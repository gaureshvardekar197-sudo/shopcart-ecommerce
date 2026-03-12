// components/context/WishlistContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { getWishlist } from '../API/api-wishlist'

const WishlistContext = createContext()

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0)
  const [wishlistItems, setWishlistItems] = useState([])

  const loadWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const response = await getWishlist()
          if (response?.data && Array.isArray(response.data)) {
            const items = response.data
            setWishlistItems(items)
            const count = items.length
            setWishlistCount(count)
            localStorage.setItem('wishlist', JSON.stringify(items))
            return count
          }
        } catch (error) {
          console.error('Error fetching wishlist from API:', error)
          return loadFromLocalStorage()
        }
      } else {
        return loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error loading wishlist count:', error)
      setWishlistCount(0)
      setWishlistItems([])
      return 0
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        const wishlist = JSON.parse(savedWishlist)
        if (Array.isArray(wishlist)) {
          setWishlistItems(wishlist)
          const count = wishlist.length
          setWishlistCount(count)
          return count
        }
      }
      setWishlistCount(0)
      setWishlistItems([])
      return 0
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error)
      setWishlistCount(0)
      setWishlistItems([])
      return 0
    }
  }

  const updateWishlistCount = (count) => {
    setWishlistCount(count)
  }

  const refreshWishlist = () => {
    return loadWishlistCount()
  }

  useEffect(() => {
    loadWishlistCount()

    const handleWishlistUpdated = (event) => {
      console.log('WishlistContext: event received', event.detail)
      if (event.detail?.count !== undefined) {
        setWishlistCount(event.detail.count)
      } else {
        loadWishlistCount()
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'wishlist' || e.key === 'token') {
        loadWishlistCount()
      }
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdated)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <WishlistContext.Provider value={{ 
      wishlistCount,
      wishlistItems,
      loadWishlistCount,
      updateWishlistCount,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}