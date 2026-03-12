import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../layout/Container'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Import components
import Loader from '../Common/Loader'
import ProductsHeader from '../All Products/ProductsHeader'
import ProductsToolbar from '../All Products/ProductsToolbar'
import FilterSidebar from '../All Products/FilterSidebar'
import ProductGrid from '../All Products/ProductGrid'
import EmptyProductState from '../All Products/EmptyProductState'
import MobileFilterModal from '../All Products/MobileFilterModal'

// API imports
import { getProducts } from '../API/api-products'
import { getWishlist, addToWishlist, removeFromWishlist } from '../API/api-wishlist'
import { addToCart as apiAddToCart, getCart } from '../API/api-cart'
import sizeApi from '../API/api-Product_sizes';

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
    window.addEventListener('login', handleLogin)
    window.addEventListener('logout', handleLogout)
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('login', handleLogin)
      window.removeEventListener('logout', handleLogout)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
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

  // Authentication functions
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
    checkAuth()
    loadWishlist()
    loadCart()
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    setIsAdmin(false)
    setWishlist([])
    setCart([])
  }

  const handleCartUpdate = (event) => {
    if (event.detail?.cart) {
      setCart(event.detail.cart)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await getProducts()
      
      // For each product, fetch its sizes
      const productsWithSizes = await Promise.all(
        response.data.map(async (product) => {
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
      
      setProducts(productsWithSizes)
      extractCategories(productsWithSizes)
    } catch (error) {
      console.error('Error fetching products:', error)
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

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.warning('🔐 Please login to add items to wishlist', {
        position: "top-right",
        autoClose: 1000,
        icon: "🔐"
      })
      
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      return
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
    const defaultSize = product?.sizes?.[0];
    
    // Check if in wishlist (considering size)
    const isInWishlist = wishlist.some(item => {
      if (item.id !== product.id) return false;
      
      // If the item in wishlist has size info, compare size_id
      if (item.pivot?.size_id || item.selected_size_id) {
        return item.pivot?.size_id === defaultSize?.id || item.selected_size_id === defaultSize?.id;
      }
      
      // If no size in wishlist item, it's a different variant
      return false;
    });

    if (!isAuthenticated) {
      // Handle guest wishlist with size info
      const savedWishlist = localStorage.getItem('wishlist')
      let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : []
      
      let updatedWishlist
      if (isInWishlist) {
        updatedWishlist = currentWishlist.filter(item => {
          if (item.id !== product.id) return true;
          // Remove only the specific size
          return item.selected_size_id !== defaultSize?.id;
        })
        toast.success(`❤️ ${product.name} (Size: ${defaultSize?.size}) removed from wishlist`)
      } else {
        // Add product with size info
        const wishlistItem = {
          id: product.id,
          name: product.name,
          image: product.image,
          image_url: product.image_url,
          category: product.category,
          category_name: getCategoryName(product),
          // Add size information
          selected_size: defaultSize?.size,
          selected_size_id: defaultSize?.id,
          size_price: defaultSize?.selling_price || defaultSize?.price,
          size_original_price: defaultSize?.original_price || defaultSize?.effective_original_price,
          price: defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price,
          selling_price: defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price,
          original_price: defaultSize?.original_price || defaultSize?.effective_original_price || getOriginalPrice(product),
          stock: defaultSize?.stock || product.stock
        }
        updatedWishlist = [...currentWishlist, wishlistItem]
        toast.success(`❤️ ${product.name} (Size: ${defaultSize?.size}) added to wishlist`)
      }

      setWishlist(updatedWishlist)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }))
      return
    }

    // Handle authenticated user wishlist
    try {
      if (isInWishlist) {
        // Remove specific size from wishlist
        await removeFromWishlist(product.id, defaultSize?.id)
        setWishlist(prev => prev.filter(item => {
          if (item.id !== product.id) return true;
          return item.pivot?.size_id !== defaultSize?.id;
        }))
        toast.success(`❤️ ${product.name} (Size: ${defaultSize?.size}) removed from wishlist`)
      } else {
        // Add with size ID
        await addToWishlist(product.id, defaultSize?.size, defaultSize?.id)
        
        // Fetch updated wishlist
        const response = await getWishlist()
        const wishlistData = response?.data || response || []
        setWishlist(wishlistData)
        
        toast.success(`❤️ ${product.name} (Size: ${defaultSize?.size}) added to wishlist`)
      }
      
      const response = await getWishlist()
      const wishlistData = response?.data || response || []
      const count = Array.isArray(wishlistData) ? wishlistData.length : 0
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count } 
      }))
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Failed to update wishlist')
    }
  }

  // Updated Cart functions with size information
  const addToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.warning('🛒 Please login to add items to cart', {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      })
      
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      return
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
    const defaultSize = product?.sizes?.[0];
    const sizeId = defaultSize?.id || null;
    const sizeName = defaultSize?.size || null;
    
    try {
      if (isAuthenticated) {
        // Pass size information to cart API
        const response = await apiAddToCart(
          product.id, 
          1, 
          sizeName,
          sizeId
        )
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot add to cart', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          })
          return
        }
        
        if (response?.status) {
          toast.success(`🛒 ${product.name}${sizeName ? ` (Size: ${sizeName})` : ''} added to cart`)
          
          // Fetch updated cart
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
        // Guest cart with size info
        addToLocalCart(product, defaultSize)
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
        addToLocalCart(product, defaultSize)
      } else {
        toast.error('Failed to add to cart. Please try again.')
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }
  }

  // Updated local cart function to save size info
  const addToLocalCart = (product, defaultSize = null) => {
    const savedCart = localStorage.getItem('cart')
    let currentCart = savedCart ? JSON.parse(savedCart) : []
    
    if (!Array.isArray(currentCart)) {
      currentCart = []
    }
    
    // Create cart item with size information
    const cartProduct = {
      id: product.id,
      product_id: product.id,
      name: product.name,
      // Use size-specific price if available
      price: defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price || 0,
      selling_price: defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price || 0,
      original_price: defaultSize?.original_price || defaultSize?.effective_original_price || getOriginalPrice(product) || product.price || 0,
      quantity: 1,
      stock: defaultSize?.stock || product.stock || product.qty || 0,
      image: product.image,
      image_url: product.image_url,
      category: product.category,
      category_name: getCategoryName(product),
      // Add size information
      size: defaultSize?.size || null,
      size_id: defaultSize?.id || null,
      selected_size: defaultSize?.size || null,
      selected_size_id: defaultSize?.id || null,
      size_price: defaultSize?.selling_price || defaultSize?.price || null,
      size_original_price: defaultSize?.original_price || defaultSize?.effective_original_price || null
    }
    
    // Check if same product with same size already exists
    const existingProductIndex = currentCart.findIndex(item => 
      item.id === product.id && 
      ((item.size_id && item.size_id === defaultSize?.id) || 
       (!item.size_id && !defaultSize?.id))
    )
    
    if (existingProductIndex !== -1) {
      // Update quantity for same product + size combination
      currentCart[existingProductIndex] = {
        ...currentCart[existingProductIndex],
        quantity: (currentCart[existingProductIndex].quantity || 1) + 1
      }
      toast.info(`🛒 ${product.name}${defaultSize?.size ? ` (Size: ${defaultSize.size})` : ''} quantity increased to ${currentCart[existingProductIndex].quantity}`)
    } else {
      // Add new cart item (different size or new product)
      currentCart.push(cartProduct)
      toast.success(`🛒 ${product.name}${defaultSize?.size ? ` (Size: ${defaultSize.size})` : ''} added to cart`)
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

  // Helper functions
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
  if (!product) return 0
  
  // Check all possible fields for original price
  const possibleFields = [
    'original_price', 'mrp', 'compare_at_price', 'regular_price',
    'old_price', 'list_price', 'retail_price', 'originalPrice',
    'MRP', 'comparePrice'
  ]
  
  for (const field of possibleFields) {
    const value = product[field]
    if (value && !isNaN(value) && Number(value) > 0) {
      console.log(`Found original price for ${product.name}: ${value} from field ${field}`)
      return Number(value)
    }
  }
  
  console.log(`No original price found for ${product.name}`)
  return 0
}

  const calculateDiscount = (product) => {
    const price = Number(product.selling_price || product.price || 0)
    const originalPrice = getOriginalPrice(product)
    
    if (!originalPrice || originalPrice <= price || originalPrice === 0) return null
    
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
    return discount > 0 ? discount : null
  }

  // Loading state
  if (loading) {
    return <Loader message="Loading products..." />
  }

  return (
    <Container>
      <div className="py-4 md:py-4">
        <ProductsHeader isAdmin={isAdmin} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/5">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Products Section */}
          <div className="lg:w-4/5">
            <ProductsToolbar
              totalProducts={filteredProducts.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onMobileFilterOpen={() => setShowMobileFilters(true)}
            />

            {filteredProducts.length === 0 ? (
              <EmptyProductState />
            ) : (
              <ProductGrid
                products={filteredProducts}
                formatCurrency={formatCurrency}
                getCategoryName={getCategoryName}
                calculateDiscount={calculateDiscount}
                isInStock={isInStock}
                getOriginalPrice={getOriginalPrice}
                wishlist={wishlist}
                cart={cart}
                onToggleWishlist={toggleWishlist}
                onAddToCart={addToCart}
                isAuthenticated={isAuthenticated}
                addingToCart={addingToCart}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <MobileFilterModal
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>
    </Container>
  )
}

export default Products