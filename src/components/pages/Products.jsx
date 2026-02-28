// src/pages/Products.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../layout/Container'
import { 
  FunnelIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { getProducts } from '../API/api-products'
import { getWishlist, addToWishlist, removeFromWishlist } from '../API/api-wishlist'
import { addToCart as apiAddToCart, getCart } from '../API/api-cart'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Products() {
  const navigate = useNavigate()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [cart, setCart] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [addingToCart, setAddingToCart] = useState({})
  const [userRole, setUserRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchProducts()
    loadCart()
    
    // Listen for login/logout events
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [])

  useEffect(() => {
    let result = [...products]
    
    if (selectedCategory !== 'All') {
      result = result.filter(product => 
        getCategoryName(product) === selectedCategory
      )
    }
    
    result = sortProducts(result, sortBy)
    setFilteredProducts(result)
  }, [products, selectedCategory, sortBy])

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

  const handleLogin = () => {
    checkAuth();
    loadWishlist();
    loadCart();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsAdmin(false);
    setWishlist([]);
    setCart([]);
  };

  const handleCartUpdate = (event) => {
    if (event.detail?.cart) {
      setCart(event.detail.cart);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await getProducts(token)
      const productsData = response?.data || response || []
      
      setProducts(productsData)
      extractCategories(productsData)
      
      await loadWishlist()
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products', {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
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
        }
      }
      return
    }

    try {
      const response = await getWishlist()
      if (response && response.data && Array.isArray(response.data)) {
        setWishlist(response.data)
      } else if (Array.isArray(response)) {
        setWishlist(response)
      }
    } catch (error) {
      console.error('Error loading wishlist from database:', error)
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist))
      }
    }
  }

  const loadCart = async () => {
    if (isAuthenticated) {
      try {
        const response = await getCart()
        
        let cartData = []
        if (response?.data) {
          if (Array.isArray(response.data)) {
            cartData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            cartData = response.data.data
          }
        }
        
        cartData = cartData.map(item => ({
          ...item,
          quantity: item.quantity || 1
        }))
        
        setCart(cartData)
        
        const totalQuantity = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0)
        
        localStorage.setItem('cart', JSON.stringify(cartData))
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity, cart: cartData } 
        }))
        
      } catch (error) {
        console.error('Error loading cart from database:', error)
        loadLocalCart()
      }
    } else {
      loadLocalCart()
    }
  }

  const loadLocalCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCart(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Error parsing cart:', error)
      }
    }
  }

  // Handle wishlist toggle with login redirect
const toggleWishlist = async (product) => {
  // FIRST CHECK - This should show alert for non-logged in users
  if (!isAuthenticated) {
    toast.warning('🔐 Please login to add items to wishlist', {
      position: "top-right",
      autoClose: 1000,
      icon: "🔐"
    });
    
    setTimeout(() => {
      navigate('/login');
    }, 1500);
    return; // This should stop execution here
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

  // SECOND CHECK - This is the problem!
  // This block should NEVER execute because we already returned above
  if (!isAuthenticated) {  // ❌ This condition is never true because we already returned
    const savedWishlist = localStorage.getItem('wishlist')
    let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : []
    
    const isInWishlist = currentWishlist.some(item => item.id === product.id)
    let updatedWishlist

    if (isInWishlist) {
      updatedWishlist = currentWishlist.filter(item => item.id !== product.id)
      toast.success(`❤️ ${product.name} removed from wishlist`)
    } else {
      updatedWishlist = [...currentWishlist, product]
      toast.success(`❤️ ${product.name} added to wishlist`)
    }

    setWishlist(updatedWishlist)
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { count: updatedWishlist.length } 
    }))
    return
  }
  
  // Rest of the code for authenticated users...
}

  // Handle add to cart with login redirect
  const addToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    
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
    
    setAddingToCart(prev => ({ ...prev, [product.id]: true }))
    
    try {
      if (isAuthenticated) {
        const response = await apiAddToCart(product.id, 1)
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot add to cart', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          })
          return
        }
        
        if (response?.status) {
          toast.success(`🛒 ${product.name} added to cart`)
          
          const cartResponse = await getCart()
          if (cartResponse?.data) {
            let cartData = []
            if (Array.isArray(cartResponse.data)) {
              cartData = cartResponse.data
            } else if (cartResponse.data.data && Array.isArray(cartResponse.data.data)) {
              cartData = cartResponse.data.data
            }
            
            cartData = cartData.map(item => ({
              ...item,
              quantity: item.quantity || 1
            }))
            
            setCart(cartData)
            
            const totalQuantity = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0)
            
            window.dispatchEvent(new CustomEvent('cartUpdated', { 
              detail: { count: totalQuantity, cart: cartData } 
            }))
          }
        }
      } else {
        addToLocalCart(product)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot add to cart', {
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
        addToLocalCart(product)
      } else {
        toast.error('Failed to add to cart. Please try again.')
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }
  }

  const addToLocalCart = (product) => {
    const savedCart = localStorage.getItem('cart')
    let currentCart = savedCart ? JSON.parse(savedCart) : []
    
    if (!Array.isArray(currentCart)) {
      currentCart = []
    }
    
    const cartProduct = {
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price || 0,
      selling_price: product.selling_price || product.price || 0,
      original_price: getOriginalPrice(product) || product.price || 0,
      quantity: 1,
      stock: product.stock || product.qty || 0,
      image: product.image,
      image_url: product.image_url,
      category: product.category,
      category_name: getCategoryName(product)
    }
    
    const existingProductIndex = currentCart.findIndex(item => item.id === product.id)
    
    if (existingProductIndex !== -1) {
      currentCart[existingProductIndex] = {
        ...currentCart[existingProductIndex],
        quantity: (currentCart[existingProductIndex].quantity || 1) + 1
      }
      toast.info(`🛒 ${product.name} quantity increased to ${currentCart[existingProductIndex].quantity}`)
    } else {
      currentCart.push(cartProduct)
      toast.success(`🛒 ${product.name} added to cart`)
    }
    
    const totalQuantity = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    
    localStorage.setItem('cart', JSON.stringify(currentCart))
    setCart(currentCart)
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { 
        count: totalQuantity,
        cart: currentCart 
      } 
    }))
  }

  const extractCategories = (productsData) => {
    const categorySet = new Set(['All'])
    productsData.forEach(product => {
      const category = getCategoryName(product)
      if (category) categorySet.add(category)
    })
    setCategories(Array.from(categorySet))
  }

  const getCategoryName = (product) => {
    if (!product) return 'Uncategorized'
    
    if (product.category && typeof product.category === 'object') {
      return product.category.name || 'Uncategorized'
    }
    if (product.category_name && typeof product.category_name === 'object') {
      return product.category_name.name || 'Uncategorized'
    }
    return product.category_name || product.category || 'Uncategorized'
  }

  const sortProducts = (productsToSort, sortOption) => {
    const sorted = [...productsToSort]
    
    switch(sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => 
          (a.selling_price || a.price || 0) - (b.selling_price || b.price || 0)
        )
      case 'price-high':
        return sorted.sort((a, b) => 
          (b.selling_price || b.price || 0) - (a.selling_price || a.price || 0)
        )
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )
      default:
        return sorted
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const isInStock = (product) => {
    return (product.stock > 0 || product.qty > 0)
  }

  const getOriginalPrice = (product) => {
    if (!product) return null
    
    const possibleFields = [
      'original_price', 'mrp', 'compare_at_price', 'regular_price',
      'old_price', 'list_price', 'retail_price', 'originalPrice',
      'MRP', 'comparePrice'
    ]
    
    for (const field of possibleFields) {
      const value = product[field]
      if (value && !isNaN(value) && Number(value) > 0) {
        return Number(value)
      }
    }
    
    return null
  }

  const calculateDiscount = (product) => {
    const price = Number(product.selling_price || product.price || 0)
    const originalPrice = getOriginalPrice(product)
    
    if (!originalPrice || originalPrice <= price || originalPrice === 0) return null
    
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
    return discount > 0 ? discount : null
  }

  const isInCart = (productId) => {
    return cart.some(item => item.id === productId)
  }

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const FilterSidebar = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 sticky top-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FunnelIcon className="w-4 h-4" />
          Filters
        </h3>
        <button 
          onClick={() => setShowMobileFilters(false)}
          className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">Categories</h4>
        <div className="space-y-1.5">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category)
                setShowMobileFilters(false)
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border-l-3 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // Simple centered loader
  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading products...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-4 md:py-4">
        {/* Header - Removed login prompt */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            All Products
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Browse our collection of premium products
          </p>
          {isAdmin && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
              <span>👑</span> You are in admin mode - viewing only
            </p>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-5">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/5">
            <FilterSidebar />
          </div>

          {/* Products Section */}
          <div className="lg:w-4/5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Products ({filteredProducts.length})</h1>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-44">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const discount = calculateDiscount(product)
                  const inStock = isInStock(product)
                  const price = product.selling_price || product.price || 0
                  const originalPrice = getOriginalPrice(product)
                  const isInWishlist = wishlist.some(item => item.id === product.id)
                  const inCart = isInCart(product.id)
                  const cartQuantity = getCartQuantity(product.id)

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      discount={discount}
                      inStock={inStock}
                      price={price}
                      originalPrice={originalPrice}
                      formatCurrency={formatCurrency}
                      getCategoryName={getCategoryName}
                      isInWishlist={isInWishlist}
                      inCart={inCart}
                      cartQuantity={cartQuantity}
                      onToggleWishlist={() => toggleWishlist(product)}
                      onAddToCart={(e) => addToCart(product, e)}
                      isAuthenticated={isAuthenticated}
                      addingToCart={addingToCart[product.id]}
                      isAdmin={isAdmin}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto p-5">
              <FilterSidebar />
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

// Product Card Component
const ProductCard = ({ 
  product, 
  discount, 
  inStock, 
  price, 
  originalPrice, 
  formatCurrency, 
  getCategoryName,
  isInWishlist,
  inCart,
  cartQuantity,
  onToggleWishlist,
  onAddToCart,
  isAuthenticated,
  addingToCart,
  isAdmin
}) => {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const getImageUrl = () => {
    if (imageError) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=200&length=1&font-size=0.5`
    }
    return product.image_url || product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=200&length=1&font-size=0.5`
  }

  // Handle wishlist click with login redirect
  const handleWishlistClick = (e) => {
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
    
    onToggleWishlist()
  }

  // Handle add to cart click with login redirect
  const handleAddToCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
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
    
    onAddToCart(e)
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full relative">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-gray-700"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        title={isAdmin ? "Admins cannot add to wishlist" : (!isAuthenticated ? "Login to add to wishlist" : "")}
      >
        {isInWishlist ? (
          <HeartIconSolid className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className={`w-5 h-5 ${isAdmin ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300'}`} />
        )}
      </button>

      {/* Cart Quantity Badge */}
      {inCart && cartQuantity > 0 && !isAdmin && (
        <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
          {cartQuantity}
        </div>
      )}

      <Link to={`/products/${product.id}`} className="flex-1">
        {/* Image Container */}
        <div className="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-900 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          )}
          <img 
            src={getImageUrl()} 
            alt={product.name} 
            className={`absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg z-10">
              -{discount}%
            </div>
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

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <span className="inline-block text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full mb-2">
            {getCategoryName(product)}
          </span>
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-red-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <button 
          className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            inStock && !isAdmin
              ? inCart
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={!inStock || addingToCart || isAdmin}
          onClick={handleAddToCartClick}
          title={!isAuthenticated ? "Login to add to cart" : (isAdmin ? "Admins cannot add to cart" : "")}
        >
          {addingToCart ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : isAdmin ? (
            'Admin View Only'
          ) : !inStock 
            ? 'Out of Stock' 
            : inCart 
              ? `Add Again (${cartQuantity} in cart)` 
              : 'Add to Cart'
          }
        </button>
      </div>
      
      {/* Admin Notice */}
      {isAdmin && (
        <div className="px-4 pb-3 text-center">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            👑 Admin view only
          </p>
        </div>
      )}
    </div>
  )
}

export default Products