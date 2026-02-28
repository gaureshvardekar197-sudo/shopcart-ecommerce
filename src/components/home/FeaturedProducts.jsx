import { Link, useNavigate } from 'react-router-dom'
import Container from '../layout/Container'
import { ArrowRightIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getWishlist, addToWishlist, removeFromWishlist } from '../API/api-wishlist'
import { addToCart as apiAddToCart } from '../API/api-cart'

const API_URL = "http://localhost:8000";

export default function FeaturedProducts() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchProducts()
    
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, [])

  const handleLogin = () => {
    checkAuth();
    loadWishlist();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsAdmin(false);
    setWishlist([]);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        const userData = JSON.parse(user)
        setIsAuthenticated(true)
        setUserRole(userData.role)
        setIsAdmin(userData.role === 1)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsAuthenticated(false)
        setUserRole(null)
        setIsAdmin(false)
      }
    } else {
      setIsAuthenticated(false)
      setUserRole(null)
      setIsAdmin(false)
    }
  }

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist))
        } catch (error) {
          console.error('Error parsing wishlist:', error)
          setWishlist([])
        }
      }
      return
    }

    try {
      const response = await getWishlist()
      if (response && response.data && Array.isArray(response.data)) {
        setWishlist(response.data)
      } else {
        setWishlist([])
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist))
        } catch (e) {
          setWishlist([])
        }
      }
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.get(`${API_URL}/api/products`, { headers })
      console.log('API Response:', response.data)
      
      let productsData = []
      if (response.data?.data) {
        productsData = response.data.data
      } else if (response.data?.products) {
        productsData = response.data.products
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      }
      
      console.log('All Products:', productsData.length)
      
      const trendingProducts = productsData.filter(product => 
        product.trending === 1 || product.trending === true
      )
      
      console.log('Trending Products:', trendingProducts.length)
      setAllProducts(trendingProducts)
      setProducts(trendingProducts.slice(0, 8))
      
      await loadWishlist()
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (product) => {
    if (!product?.image) {
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(product?.name || 'Product')}`;
    }
    
    if (product.image_url) {
      return product.image_url;
    }
    
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    let imagePath = product.image;
    imagePath = imagePath.replace('public/', '');
    imagePath = imagePath.replace('products/', '');
    imagePath = imagePath.replace('additional/', '');
    
    return `${API_URL}/storage/products/${imagePath}`;
  }

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  }

  // Handle wishlist toggle with login redirect
  const toggleWishlist = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🔐 Please login to add items to wishlist', {
        position: "top-right",
        autoClose: 2000,
        icon: "🔐"
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to wishlist', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      })
      return
    }

    const isInWishlist = wishlist.some(item => item.id === product.id)
    let updatedWishlist

    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(product.id)
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot modify wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          })
          return
        }
        
        updatedWishlist = wishlist.filter(item => item.id !== product.id)
        toast.success(`❤️ ${product.name} removed from wishlist`)
      } else {
        const response = await addToWishlist(product.id)
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot add to wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          })
          return
        }
        
        if (response && response.data) {
          updatedWishlist = [...wishlist, response.data]
        } else {
          updatedWishlist = [...wishlist, product]
        }
        toast.success(`❤️ ${product.name} added to wishlist`)
      }

      setWishlist(updatedWishlist)
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }))
    } catch (error) {
      console.error('Wishlist error:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot modify wishlist', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        })
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          onClick: () => window.location.href = '/login'
        })
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserRole(null)
      } else {
        toast.error('Failed to update wishlist. Please try again.')
      }
    }
  }

  const handleViewMore = () => {
    setShowAll(true)
    setProducts(allProducts)
  }

  const handleViewLess = () => {
    setShowAll(false)
    setProducts(allProducts.slice(0, 8))
  }

  // Handle add to cart with login redirect
  const addToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('Add to cart clicked for product:', product)

    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🛒 Please login to add items to cart', {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to cart', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      })
      return
    }

    try {
      console.log('Calling apiAddToCart with:', product.id, 1)
      const response = await apiAddToCart(product.id, 1)
      console.log('Complete API Response:', response)
      
      if (response && response.is_admin_error) {
        console.log('Admin error detected')
        toast.info('👑 Admin: You cannot add to cart', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        })
        return
      }
      
      if (response && response.role_error) {
        console.log('Role-based error detected')
        toast.error(response.message || 'You are not authorized to add items to cart')
        return
      }
      
      if (response && response.validation_error) {
        console.log('Validation error detected')
        const errorMessage = response.message || 'Validation error'
        toast.error(errorMessage)
        return
      }
      
      let isSuccess = false
      let cartCount = 1
      
      if (response) {
        if (response.status === true) {
          isSuccess = true
        } else if (response.status === 'success') {
          isSuccess = true
        } else if (response.success === true) {
          isSuccess = true
        } else if (response.data && response.data.status === true) {
          isSuccess = true
        } else if (response.data && response.data.success === true) {
          isSuccess = true
        }
        
        if (response.cart_count !== undefined) {
          cartCount = response.cart_count
        } else if (response.total_quantity !== undefined) {
          cartCount = response.total_quantity
        } else if (response.data?.cart_count !== undefined) {
          cartCount = response.data.cart_count
        } else if (response.data?.total_quantity !== undefined) {
          cartCount = response.data.total_quantity
        } else if (response.data?.quantity !== undefined) {
          cartCount = response.data.quantity
        }
      }
      
      console.log('Is success:', isSuccess)
      console.log('Cart count:', cartCount)
      
      if (isSuccess) {
        toast.success(`🛒 ${product.name} added to cart`)
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: cartCount, productId: product.id, action: 'add' } 
        }))
      } else {
        if (response && response.message) {
          toast.info(response.message)
        } else {
          toast.success(`🛒 ${product.name} added to cart`)
          
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: 1, productId: product.id, action: 'add' } 
          }))
        }
      }
    } catch (error) {
      console.error('Cart error in catch block:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot add to cart', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        })
        return
      }
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          onClick: () => window.location.href = '/login'
        })
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserRole(null)
        return
      }
      
      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.message || 'Validation error'
        toast.error(errorMessage)
        return
      }
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
        return
      }
      
      toast.error('Failed to add to cart. Please try again.')
    }
  }

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trending Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Loading amazing products...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[1,2,3,4,5,6,7,8].map(item => (
              <div key={item} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="h-56 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-2xl">
              <p className="text-lg font-medium mb-2">Error Loading Products</p>
              <p className="text-sm mb-4">{error}</p>
              <button 
                onClick={fetchProducts}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trending Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">No trending products available at the moment</p>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 md:mb-14">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Trending Products
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Top trending picks loved by our customers
            </p>
            {isAdmin && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                <span>👑</span> You are in admin mode - viewing only
              </p>
            )}
          </div>
          
          {!showAll && (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map(product => {
            const originalPrice = Number(product.original_price) || 0;
            const sellingPrice = Number(product.selling_price) || 0;
            
            const isInWishlist = wishlist.some(item => item.id === product.id)
            const discount = originalPrice > sellingPrice 
              ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
              : 0;
            const stock = product.qty || product.stock || 0
            const hasDiscount = originalPrice > sellingPrice
            const showOriginalPrice = originalPrice > 0
            const imageUrl = getImageUrl(product)

            return (
              <div
                key={product.id}
                className="group relative rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <button
                  onClick={(e) => toggleWishlist(product, e)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/80 backdrop-blur hover:scale-110 transition"
                  title={isAdmin ? "Admins cannot add to wishlist" : (!isAuthenticated ? "Login to add to wishlist" : "")}
                >
                  {isInWishlist ? (
                    <HeartIconSolid className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 hover:text-red-500" />
                  )}
                </button>

                <Link to={`/products/${product.id}`} className="flex-1">
                  <div className="relative h-56 md:h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`;
                        }}
                        loading="lazy"
                      />
                    </div>

                    {(product.trending === 1 || product.trending === true) && (
                      <span className="absolute top-3 left-3 px-2 md:px-3 py-1 text-xs font-bold rounded-full bg-yellow-500 text-white flex items-center gap-1">
                        🔥 Trending
                      </span>
                    )}

                    {hasDiscount && (
                      <span className="absolute bottom-3 left-3 px-2 md:px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white">
                        {discount}% OFF
                      </span>
                    )}

                    {stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {product.category?.name || 'Uncategorized'}
                    </span>

                    <h3 className="mt-2 font-semibold text-base md:text-lg text-gray-900 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>

                    {product.rating > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`w-3 h-3 md:w-4 md:h-4 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs md:text-sm text-gray-500">
                          ({product.reviews_count || 0})
                        </span>
                      </div>
                    )}

                    <div className="mt-auto pt-4 md:pt-5">
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(sellingPrice)}
                        </span>
                        
                        {showOriginalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <button 
                    className={`w-full flex items-center justify-center gap-2 py-2 md:py-3 rounded-lg font-semibold transition ${
                      stock > 0 && !isAdmin
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : stock === 0 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                    disabled={stock === 0 || isAdmin}
                    onClick={(e) => addToCart(product, e)}
                    title={!isAuthenticated ? "Login to add to cart" : (isAdmin ? "Admins cannot add to cart" : "")}
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    {!isAuthenticated ? 'Add to Cart' : (isAdmin ? 'Admin View Only' : (stock > 0 ? 'Add to Cart' : 'Out of Stock'))}
                  </button>

                  {stock > 0 && stock < 10 && !isAdmin && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                      Only {stock} left in stock!
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {allProducts.length > 8 && (
          <div className="flex justify-center mt-10 md:mt-14">
            {!showAll ? (
              <button
                onClick={handleViewMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
              >
                View More Products
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleViewLess}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-primary-600 bg-white border-2 border-primary-600 hover:bg-primary-50 transition"
              >
                Show Less
                <ArrowRightIcon className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        )}

        <div className="text-center mt-4 text-sm text-gray-500">
          Showing {products.length} of {allProducts.length} products
        </div>
      </Container>
    </section>
  )
}