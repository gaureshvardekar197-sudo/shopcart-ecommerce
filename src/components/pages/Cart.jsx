import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../layout/Container'
import { 
  ShoppingCartIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TagIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  MinusIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart as apiClearCart 
} from '../API/api-cart'

const API_URL = "http://localhost:8000";

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [updatingItems, setUpdatingItems] = useState({}) // Track which items are being updated

  const FREE_DELIVERY_THRESHOLD = 500
  const DELIVERY_CHARGE = 40

  // Check authentication and load cart on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    loadCart(!!token)
  }, [])

  // Set up event listeners
  useEffect(() => {
    const handleCartUpdated = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
      loadCart(!!token)
    }

    const handleLogin = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
      loadCart(!!token)
    }

    const handleLogout = () => {
      setIsAuthenticated(false)
      setCartItems([])
    }

    window.addEventListener('login', handleLogin)
    window.addEventListener('logout', handleLogout)
    window.addEventListener('cartUpdated', handleCartUpdated)
    
    return () => {
      window.removeEventListener('login', handleLogin)
      window.removeEventListener('logout', handleLogout)
      window.removeEventListener('cartUpdated', handleCartUpdated)
    }
  }, [])

  const loadCart = async (authStatus) => {
    setLoading(true);
    
    if (!authStatus) {
      // Load from localStorage for guests
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsed) ? parsed : []);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Load from database for authenticated users
    try {
      console.log('Loading cart from database...');
      const response = await getCart();
      console.log('Cart response:', response);
      
      // Extract cart data from response
      let cartData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          cartData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          cartData = response.data.data;
        }
      }
      
      // Ensure each item has the correct structure
      cartData = cartData.map(item => ({
        ...item,
        id: item.id || item.product_id,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.selling_price || item.price || 0,
        selling_price: item.selling_price || item.price || 0,
        original_price: item.original_price || item.mrp || 0,
        image: item.image,
        image_url: item.image_url,
        name: item.name || 'Product',
        stock: item.stock || item.qty || 0
      }));
      
      setCartItems(cartData);
      
      // Calculate total quantity (sum of all quantities)
      const totalQuantity = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      // Update cart count in navbar
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: totalQuantity, cart: cartData } 
      }));
      
      // Optionally sync with localStorage
      localStorage.setItem('cart', JSON.stringify(cartData));
      
    } catch (error) {
      console.error('Error loading cart:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } else {
        // Fallback to localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch {
            setCartItems([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Update quantity without page refresh
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Find the item to check stock
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;
    
    // Check stock limit
    if (item.stock && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
    
    // Set updating state for this item
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    // Optimistic update for better UX
    const updatedItems = cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    
    if (!isAuthenticated) {
      // Update localStorage for guests
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      toast.success('Quantity updated');
      
      const totalQuantity = updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: totalQuantity, cart: updatedItems } 
      }));
      
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
      return;
    }

    // Update database for authenticated users
    try {
      console.log('Updating cart item:', { productId, quantity: newQuantity });
      
      const response = await updateCartItem(productId, newQuantity);
      console.log('Update response:', response);
      
      if (response?.status === true) {
        toast.success('Quantity updated');
        
        const totalQuantity = response?.total_quantity || 
                             updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity, cart: updatedItems } 
        }));
      } else {
        // If update failed, revert the optimistic update
        setCartItems(cartItems);
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      
      // Revert the optimistic update on error
      setCartItems(cartItems);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update quantity');
      }
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Updated removeFromCart with SweetAlert
  const removeFromCart = async (productId, productName) => {
    // Show confirmation dialog with SweetAlert
    const result = await Swal.fire({
      title: 'Remove Item?',
      text: `Are you sure you want to remove "${productName}" from your cart?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `
        rgba(0,0,0,0.4)
        left top
        no-repeat
      `,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (!result.isConfirmed) {
      return;
    }
    
    // Set updating state
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    // Optimistic update
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    setSelectedItems(prev => prev.filter(id => id !== productId));
    
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Show success message
      Swal.fire({
        title: 'Removed!',
        text: `${productName} has been removed from your cart.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true
      });
      
      const totalQuantity = updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: totalQuantity, cart: updatedItems } 
      }));
      
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
      return;
    }

    try {
      console.log('Removing cart item:', productId);
      
      const response = await removeCartItem(productId);
      console.log('Remove response:', response);
      
      if (response?.status) {
        // Show success message
        Swal.fire({
          title: 'Removed!',
          text: `${productName} has been removed from your cart.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        const totalQuantity = response?.total_quantity || 
                             updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity, cart: updatedItems } 
        }));
      } else {
        // Revert on failure
        setCartItems(cartItems);
        setSelectedItems(prev => [...prev, productId]);
        
        Swal.fire({
          title: 'Error!',
          text: 'Failed to remove item. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      
      // Revert on error
      setCartItems(cartItems);
      setSelectedItems(prev => [...prev, productId]);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } else {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to remove item',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // FIXED: Clear cart with SweetAlert - No page refresh
  const clearCart = async (e) => {
    // Prevent any default behavior that might cause page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (cartItems.length === 0) return;
    
    try {
      // Show confirmation dialog with SweetAlert
      const result = await Swal.fire({
        title: 'Clear Cart?',
        html: `
          <div class="text-center">
            <p class="text-lg mb-2">Are you sure you want to clear your cart?</p>
            <p class="text-sm text-gray-500">You have <strong>${cartItems.length}</strong> ${cartItems.length === 1 ? 'item' : 'items'} in your cart.</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, clear it!',
        cancelButtonText: 'Cancel',
        focusCancel: true,
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            // Store current items for potential revert
            const previousItems = [...cartItems];
            
            // Optimistic update
            setCartItems([]);
            setAppliedCoupon(null);
            setCouponCode('');
            setSelectedItems([]);
            
            if (!isAuthenticated) {
              localStorage.setItem('cart', JSON.stringify([]));
              window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
              return { success: true, message: 'Cart cleared successfully' };
            }

            // Call API to clear cart
            const response = await apiClearCart();
            console.log('Clear cart response:', response);
            
            if (response?.status === true) {
              window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
              return { success: true, message: 'Cart cleared successfully' };
            } else {
              // Revert on failure
              setCartItems(previousItems);
              setSelectedItems(previousItems.map(item => item.id));
              throw new Error('Failed to clear cart');
            }
          } catch (error) {
            console.error('Error clearing cart:', error);
            
            // Revert on error
            setCartItems(previousItems);
            setSelectedItems(previousItems.map(item => item.id));
            
            if (error.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setIsAuthenticated(false);
              throw new Error('Session expired. Please login again.');
            } else if (error.response?.status === 404) {
              throw new Error('Clear cart endpoint not found. Please check API configuration.');
            } else {
              throw new Error(error.response?.data?.message || 'Failed to clear cart');
            }
          }
        }
      });

      if (result.isConfirmed) {
        // Show success message
        await Swal.fire({
          title: 'Cleared!',
          text: result.value?.message || 'Your cart has been cleared successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        // Force a re-render to ensure cart is empty
        setCartItems([]);
        
        // Dispatch event for navbar update
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
      }
    } catch (error) {
      console.error('Error in clear cart:', error);
      toast.error('An error occurred while clearing the cart');
    }
  };

  const toggleSelectItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map(item => item.id))
    }
  }

  const getSafePrice = (product) => {
    if (!product) return 0
    const price = product.selling_price || product.price || 0
    return Number(price) || 0
  }

  const getSafeOriginalPrice = (product) => {
    if (!product) return 0
    const originalPrice = product.original_price || product.mrp || 0
    return Number(originalPrice) || 0
  }

  const getImageUrl = (product) => {
    if (!product) return ''
    if (product.image_url) return product.image_url
    if (product.image) {
      if (product.image.startsWith('http')) return product.image
      if (product.image.startsWith('products/')) return `${API_URL}/storage/${product.image}`
      return `${API_URL}/storage/products/${product.image}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Product')}&background=3B82F6&color=fff&size=400&length=2`
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(value) || 0)
  }

  const calculateTotals = () => {
    let subtotal = 0
    let originalTotal = 0
    let itemCount = 0
    
    cartItems.forEach(item => {
      const quantity = item.quantity || 1
      const price = getSafePrice(item)
      const originalPrice = getSafeOriginalPrice(item)
      
      subtotal += price * quantity
      originalTotal += Math.max(originalPrice, price) * quantity
      itemCount += quantity
    })
    
    const savings = originalTotal - subtotal
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
    
    return { subtotal, originalTotal, itemCount, savings, deliveryCharge }
  }

  const { subtotal, originalTotal, itemCount, savings, deliveryCharge } = calculateTotals()

  const getDiscountedTotal = () => {
    if (!appliedCoupon) return subtotal
    
    if (appliedCoupon.type === 'percentage') {
      return subtotal - (subtotal * appliedCoupon.discount / 100)
    } else {
      return Math.max(0, subtotal - appliedCoupon.discount)
    }
  }

  const discountedTotal = getDiscountedTotal()
  const finalTotal = discountedTotal + deliveryCharge
  const discountAmount = subtotal - discountedTotal

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your cart...</p>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 lg:py-4">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                {!isAuthenticated && cartItems.length > 0 && (
                  <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                    (Local - <Link to="/login" className="hover:underline">Login</Link> to sync)
                  </span>
                )}
              </p>
            </div>

            {cartItems.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => clearCart(e)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear Cart
                </button>
                <Link
                  to="/products"
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
                >
                  Continue Shopping
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto">
              <ShoppingCartIcon className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Looks like you haven't added anything to your cart yet
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bulk Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select All ({cartItems.length})
                      </span>
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedItems.length} selected
                    </span>
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toast.info('Bulk action coming soon')}
                      className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center gap-2"
                    >
                      <HeartIconSolid className="w-4 h-4" />
                      Move to Wishlist
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  if (!item?.id) return null
                  
                  const quantity = item.quantity || 1
                  const price = getSafePrice(item)
                  const originalPrice = getSafeOriginalPrice(item)
                  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null
                  const inStock = (item.stock > 0 || item.qty > 0)
                  const itemTotal = price * quantity
                  const isUpdating = updatingItems[item.id]

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          {/* Checkbox */}
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                              className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>

                          {/* Product Image */}
                          <Link to={`/products/${item.id}`} className="flex-shrink-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img
                                src={getImageUrl(item)}
                                alt={item.name || 'Product'}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=3B82F6&color=fff&size=400&length=2`
                                }}
                              />
                            </div>
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div>
                                <Link to={`/products/${item.id}`}>
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                                    {item.name || 'Product'}
                                  </h3>
                                </Link>
                                
                                {/* Category & Tags */}
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                    {item.category?.name || item.category_name || 'Uncategorized'}
                                  </span>
                                  {!inStock && (
                                    <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>

                                {/* Price */}
                                <div className="mt-3">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {formatCurrency(price)}
                                    </span>
                                    {originalPrice > price && (
                                      <>
                                        <span className="text-sm text-gray-400 line-through">
                                          {formatCurrency(originalPrice)}
                                        </span>
                                        {discount && (
                                          <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            Save {discount}%
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Controls - No page refresh */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, quantity - 1)}
                                    disabled={quantity <= 1 || !inStock || isUpdating}
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <MinusIcon className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                                    {isUpdating ? (
                                      <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                      quantity
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, quantity + 1)}
                                    disabled={!inStock || isUpdating || (item.stock && quantity >= item.stock)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <PlusIcon className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Item Total */}
                                <div className="text-right min-w-[100px]">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(itemTotal)}
                                  </p>
                                </div>

                                {/* Remove Button with SweetAlert */}
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id, item.name || 'Product')}
                                  disabled={isUpdating}
                                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Remove item"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Free Delivery Progress */}
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800/30">
                  <div className="flex items-center gap-3 mb-3">
                    <TruckIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Add {formatCurrency(FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE Delivery
                    </h3>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                    Order Summary
                  </h2>

                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal ({itemCount} items)
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    {originalTotal > subtotal && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <TagIcon className="w-4 h-4 text-green-500" />
                          You Save
                        </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(savings)}
                        </span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Coupon Discount
                        </span>
                        <span className="font-medium text-green-600">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <TruckIcon className="w-4 h-4 text-gray-500" />
                        Delivery Charge
                      </span>
                      {deliveryCharge === 0 ? (
                        <span className="font-medium text-green-600">FREE</span>
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(deliveryCharge)}
                        </span>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(finalTotal)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Proceed to Checkout
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <ShieldCheckIcon className="w-6 h-6 mx-auto text-green-500 mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
                      </div>
                      <div>
                        <TruckIcon className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Free Delivery*</p>
                      </div>
                      <div>
                        <ArrowPathIcon className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">7 Days Return</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}