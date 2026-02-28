import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        if (Array.isArray(cart)) {
          const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalItems);
          return totalItems;
        }
      }
      setCartCount(0);
      return 0;
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
      return 0;
    }
  };

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  const refreshCart = () => {
    return loadCartCount();
  };

  useEffect(() => {
    // Initial load
    loadCartCount();

    // Listen for cart updates
    const handleCartUpdated = (event) => {
      console.log('CartContext: cartUpdated event received', event.detail);
      if (event.detail && event.detail.count !== undefined) {
        setCartCount(event.detail.count);
      } else if (event.detail && event.detail.cart) {
        const total = event.detail.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } else {
        loadCartCount();
      }
    };

    const handleRefreshCart = () => {
      console.log('CartContext: refreshCart event received');
      loadCartCount();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        console.log('CartContext: storage event for cart');
        loadCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('refreshCart', handleRefreshCart);
    window.addEventListener('storage', handleStorageChange);

    // Set up interval as backup
    const interval = setInterval(() => {
      loadCartCount();
    }, 1000);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener('refreshCart', handleRefreshCart);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, loadCartCount, updateCartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};