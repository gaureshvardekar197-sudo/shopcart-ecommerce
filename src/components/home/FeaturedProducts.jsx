import { Link, useNavigate } from 'react-router-dom'
import Container from '../layout/Container'
import { ArrowRightIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getWishlist, addToWishlist, removeFromWishlist } from '../API/api-wishlist'
import { addToCart as apiAddToCart } from '../API/api-cart'
import sizeApi from '../API/api-Product_sizes'

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
  const [addingToCart, setAddingToCart] = useState({})

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

  useEffect(() => {
    if (isAuthenticated !== undefined) {
      loadWishlist();
    }
  }, [isAuthenticated]);

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
          const parsed = JSON.parse(savedWishlist)
          setWishlist(parsed)
          
          // Dispatch event for navbar
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: parsed.length } 
          }))
        } catch (error) {
          console.error('Error parsing wishlist:', error)
          setWishlist([])
        }
      }
      return
    }

    try {
      const response = await getWishlist()
      let wishlistData = []
      
      if (response && response.data && Array.isArray(response.data)) {
        wishlistData = response.data
      } else if (Array.isArray(response)) {
        wishlistData = response
      }
      
      setWishlist(wishlistData)
      localStorage.setItem('wishlist', JSON.stringify(wishlistData))
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: wishlistData.length } 
      }))
    } catch (error) {
      console.error('Error loading wishlist:', error)
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist)
          setWishlist(parsed)
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: parsed.length } 
          }))
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
      
      // Filter trending products
      const trendingProducts = productsData.filter(product => 
        product.trending === 1 || product.trending === true
      )
      
      // Fetch sizes for each trending product
      const productsWithSizes = await Promise.all(
        trendingProducts.map(async (product) => {
          try {
            const sizesResponse = await sizeApi.getProductSizes(product.id)
            if (sizesResponse?.data?.sizes) {
              return {
                ...product,
                sizes: sizesResponse.data.sizes
              }
            }
          } catch (error) {
            console.error(`Error fetching sizes for product ${product.id}:`, error)
          }
          return product
        })
      )
      
      console.log('Trending Products with sizes:', productsWithSizes.length)
      setAllProducts(productsWithSizes)
      setProducts(productsWithSizes.slice(0, 8))
      
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

  // Get default size price for a product
  const getDefaultSizePrice = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
      return defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price || 0
    }
    return product.selling_price || product.price || 0
  }

  // Get default size original price - FIXED VERSION

const getDefaultSizeOriginalPrice = (product) => {
  // First check if product has sizes
  if (product?.sizes && product.sizes.length > 0) {
    const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
    
    // Check size-specific original price
    if (defaultSize?.original_price && defaultSize.original_price > 0) {
      return Number(defaultSize.original_price) // Ensure it's a number
    }
    if (defaultSize?.effective_original_price && defaultSize.effective_original_price > 0) {
      return Number(defaultSize.effective_original_price) // Ensure it's a number
    }
  }
  
  // If no size original price, check product's original price
  // Check all possible fields for original price
  const possibleFields = [
    'original_price', 'mrp', 'compare_at_price', 'regular_price',
    'old_price', 'list_price', 'retail_price', 'originalPrice',
    'MRP', 'comparePrice', 'original', 'price_old'
  ]
  
  for (const field of possibleFields) {
    const value = product[field]
    if (value && !isNaN(value) && Number(value) > 0) {
      return Number(value) // Ensure it's a number
    }
  }
  
  // No original price found
  return null
}

  // Calculate discount based on default size
  const calculateDefaultSizeDiscount = (product) => {
    const price = getDefaultSizePrice(product)
    const originalPrice = getDefaultSizeOriginalPrice(product)
    
    if (!originalPrice || originalPrice <= price || originalPrice === 0) return 0
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  // Check stock based on default size
  const isDefaultSizeInStock = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
      return defaultSize?.stock > 0
    }
    return (product.qty > 0 || product.stock > 0)
  }

  // Get default size name
  const getDefaultSizeName = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
      return defaultSize?.size || null
    }
    return null
  }

  // Check if product has multiple sizes
  const hasMultipleSizes = (product) => {
    return product?.sizes && product.sizes.length > 1
  }

  // Handle wishlist toggle with login redirect
  const toggleWishlist = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

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

    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to wishlist', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      })
      return
    }

    // Get the default size from the product
    const defaultSize = product?.sizes?.[0]
    
    // Check if in wishlist (considering size)
    const isInWishlist = wishlist.some(item => {
      if (item.id !== product.id) return false
      
      if (item.pivot?.size_id || item.selected_size_id) {
        return item.pivot?.size_id === defaultSize?.id || item.selected_size_id === defaultSize?.id
      }
      return false
    })

    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(product.id, defaultSize?.id)
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot modify wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          })
          return
        }
        
        const updatedWishlist = wishlist.filter(item => {
          if (item.id !== product.id) return true
          if (defaultSize?.id) {
            return item.pivot?.size_id !== defaultSize?.id && item.selected_size_id !== defaultSize?.id
          }
          return false
        })
        
        setWishlist(updatedWishlist)
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: updatedWishlist.length } 
        }))
        
        toast.success(`❤️ ${product.name}${defaultSize?.size ? ` (Size: ${defaultSize.size})` : ''} removed from wishlist`)
      } else {
        const response = await addToWishlist(product.id, defaultSize?.size, defaultSize?.id)
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot add to wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          })
          return
        }
        
        // Fetch updated wishlist
        const wishlistResponse = await getWishlist()
        const wishlistData = wishlistResponse?.data || wishlistResponse || []
        setWishlist(wishlistData)
        localStorage.setItem('wishlist', JSON.stringify(wishlistData))
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: wishlistData.length } 
        }))
        
        toast.success(`❤️ ${product.name}${defaultSize?.size ? ` (Size: ${defaultSize.size})` : ''} added to wishlist`)
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot modify wishlist', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        })
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
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

  // Handle add to cart with login redirect and size info
  const addToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('Add to cart clicked for product:', product)

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

    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to cart', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      })
      return
    }
    
    setAddingToCart(prev => ({ ...prev, [product.id]: true }))
    
    // Get the default size from the product
    const defaultSize = product?.sizes?.[0]
    const sizeId = defaultSize?.id || null
    const sizeName = defaultSize?.size || null

    try {
      console.log('Calling apiAddToCart with:', product.id, 1, sizeName, sizeId)
      const response = await apiAddToCart(product.id, 1, sizeName, sizeId)
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
        toast.success(`🛒 ${product.name}${sizeName ? ` (Size: ${sizeName})` : ''} added to cart`)
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: cartCount, productId: product.id, action: 'add' } 
        }))
      } else {
        if (response && response.message) {
          toast.info(response.message)
        } else {
          toast.success(`🛒 ${product.name}${sizeName ? ` (Size: ${sizeName})` : ''} added to cart`)
          
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
        toast.error('Session expired. Please login again.')
        
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
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
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
                <div className="h-48 sm:h-56 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const defaultSizePrice = getDefaultSizePrice(product)
            const defaultSizeOriginalPrice = getDefaultSizeOriginalPrice(product)
            const discount = calculateDefaultSizeDiscount(product)
            const defaultSizeName = getDefaultSizeName(product)
            const hasSizes = product?.sizes && product.sizes.length > 0
            const inStock = isDefaultSizeInStock(product)
            const isInWishlist = wishlist.some(item => item.id === product.id)
            const imageUrl = getImageUrl(product)

            // Debug log to check values
            console.log(`Product ${product.name}:`, {
              price: defaultSizePrice,
              originalPrice: defaultSizeOriginalPrice,
              discount
            });

            return (
              <div
                key={product.id}
                className="group relative rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1 flex flex-col h-full"
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

                <Link to={`/products/${product.id}`} className="flex flex-col h-full">
                  {/* Image Container - Fixed height */}
                  <div className="relative h-48 sm:h-56 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`;
                        }}
                        loading="lazy"
                      />
                    </div>

                    {/* Trending Badge */}
                    {(product.trending === 1 || product.trending === true) && (
                      <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-full bg-yellow-500 text-white flex items-center gap-1 z-10">
                        🔥 Trending
                      </span>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && !isAdmin && (
                      <span className="absolute bottom-3 left-3 px-2 py-1 text-xs font-bold rounded-full bg-red-600 text-white z-10">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Out of Stock Overlay */}
                    {!inStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <span className="bg-white px-4 py-2 rounded-lg font-bold text-gray-900 text-sm shadow-xl">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info - Flex grow to fill remaining space */}
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {product.category?.name || 'Uncategorized'}
                    </span>

                    <h3 className="mt-2 font-semibold text-base text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Size Badge - Show if product has sizes */}
                    {hasSizes && defaultSizeName && (
                      <div className="">
                        <span className="hidden">Size:</span>
                        <span className="hidden">{defaultSizeName}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.reviews_count || 0})
                        </span>
                      </div>
                    )}

                    {/* Price Section */}
                    <div className="mt-auto ">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(defaultSizePrice)}
                        </span>
                        
                        {defaultSizeOriginalPrice && defaultSizeOriginalPrice > 0 && defaultSizeOriginalPrice > defaultSizePrice && !isAdmin && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(defaultSizeOriginalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Multiple sizes indicator */}
                      {hasMultipleSizes(product) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          +{product.sizes.length - 1} more sizes available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button - Auto margin top to push to bottom */}
                  <div className="px-4 pb-4 mt-auto">
                    <button 
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all transform hover:scale-[1.02] ${
                        isAdmin
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                          : !inStock
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                      }`}
                      disabled={isAdmin || !inStock || addingToCart[product.id]}
                      onClick={(e) => addToCart(product, e)}
                      title={!isAuthenticated ? "Login to add to cart" : (isAdmin ? "Admins cannot add to cart" : (!inStock ? "Out of Stock" : ""))}
                    >
                      {addingToCart[product.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : isAdmin ? (
                        'Admin View Only'
                      ) : !inStock ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingBagIcon className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    {inStock && !isAdmin && product?.sizes?.[0]?.stock < 10 && (
                      <p className="text-xs text-orange-600 mt-2 text-center">
                        Only {product.sizes[0].stock} left in stock!
                      </p>
                    )}
                  </div>
                </Link>
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