import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Container from '../layout/Container'
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  TrashIcon,
  ChevronRightIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { getWishlist, removeFromWishlist, clearWishlist } from '../API/api-wishlist'
import { addToCart } from '../API/api-cart'

const API_URL = "http://localhost:8000";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [processingItems, setProcessingItems] = useState({})
  const [userRole, setUserRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
    
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, [])

  const handleLogin = () => {
    checkAuth();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsAdmin(false);
    setWishlistItems([]);
    setSelectedItems([]);
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
        loadWishlist()
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsAuthenticated(false)
        setUserRole(null)
        setIsAdmin(false)
        loadLocalWishlist()
      }
    } else {
      setIsAuthenticated(false)
      setUserRole(null)
      setIsAdmin(false)
      loadLocalWishlist()
      setLoading(false)
    }
  }

  const loadLocalWishlist = () => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist)
        setWishlistItems(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Error parsing wishlist:', error)
        setWishlistItems([])
      }
    } else {
      setWishlistItems([])
    }
  }

  const loadWishlist = async () => {
    setLoading(true)
    try {
      const response = await getWishlist()
      console.log('Wishlist response:', response)
      
      // Check for role-based error
      if (response && response.role_error) {
        if (isAdmin) {
          toast.info('Admins can view wishlist but cannot modify it', {
            position: "top-right",
            autoClose: 4000
          })
        }
        setWishlistItems([])
        setLoading(false)
        return
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        setWishlistItems(response.data)
      } else {
        setWishlistItems([])
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000
        })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setUserRole(null)
        setIsAdmin(false)
      } else {
        toast.error('Failed to load wishlist. Using local data.', {
          position: "top-right",
          autoClose: 3000
        })
        loadLocalWishlist()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId, productName) => {
    // Check if user is admin (role 1) - prevent removal
    if (isAdmin) {
      toast.error('Admins cannot remove items from wishlist', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }

    if (!isAuthenticated) {
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId)
      setWishlistItems(updatedWishlist)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      
      toast.success(`${productName} removed from wishlist`, {
        position: "top-right",
        autoClose: 2000
      })
      
      setSelectedItems(selectedItems.filter(id => id !== productId))
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }))
      return
    }

    try {
      const response = await removeFromWishlist(productId)
      
      // Check for admin error in response
      if (response && response.role_error) {
        toast.error(response.message || 'Admins cannot remove items from wishlist', {
          position: "top-right",
          autoClose: 3000
        })
        return
      }
      
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId)
      setWishlistItems(updatedWishlist)
      
      toast.success(`${productName} removed from wishlist`, {
        position: "top-right",
        autoClose: 2000
      })
      
      setSelectedItems(selectedItems.filter(id => id !== productId))
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }))
    } catch (error) {
      console.error('Remove error:', error)
      
      if (error.response?.status === 403) {
        toast.error('Admins cannot remove items from wishlist', {
          position: "top-right",
          autoClose: 3000
        })
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000
        })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setUserRole(null)
        setIsAdmin(false)
      } else {
        toast.error('Failed to remove from wishlist. Please try again.', {
          position: "top-right",
          autoClose: 2000
        })
      }
    }
  }

  const handleClearWishlist = async () => {
    // Check if user is admin (role 1) - prevent clearing
    if (isAdmin) {
      toast.error('Admins cannot clear wishlist', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }

    if (wishlistItems.length === 0) return
    
    const result = await Swal.fire({
      title: 'Clear Wishlist?',
      text: `Are you sure you want to remove all ${wishlistItems.length} items from your wishlist?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;
    
    Swal.fire({
      title: 'Clearing Wishlist...',
      text: 'Please wait while we clear your wishlist.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      if (!isAuthenticated) {
        setWishlistItems([])
        setSelectedItems([])
        localStorage.removeItem('wishlist')
        
        await Swal.fire({
          title: 'Cleared!',
          text: 'Your wishlist has been cleared successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: 0 } 
        }))
        return
      }

      const response = await clearWishlist();
      console.log('Clear wishlist response:', response);
      
      // Check for admin error
      if (response && response.role_error) {
        await Swal.fire({
          title: 'Error',
          text: response.message || 'Admins cannot clear wishlist',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
        return
      }
      
      setWishlistItems([])
      setSelectedItems([])
      localStorage.removeItem('wishlist')
      
      await Swal.fire({
        title: 'Cleared!',
        text: response.message || 'Your wishlist has been cleared successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: 0 } 
      }))
      
    } catch (error) {
      console.error('Clear wishlist error:', error);
      
      let errorMessage = 'Failed to clear wishlist. ';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Admins cannot clear wishlist';
        } else if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserRole(null);
          setIsAdmin(false);
        } else {
          errorMessage += error.response.data?.message || 'Unknown error occurred.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message;
      }
      
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const toggleSelectItem = (productId) => {
    // Check if user is admin (role 1) - prevent selection
    if (isAdmin) {
      toast.info('Admins cannot select items', {
        position: "top-right",
        autoClose: 2000
      })
      return
    }
    
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    // Check if user is admin (role 1) - prevent selection
    if (isAdmin) {
      toast.info('Admins cannot select items', {
        position: "top-right",
        autoClose: 2000
      })
      return
    }
    
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(wishlistItems.map(item => item.id))
    }
  }

  const addToCartHandler = async (product) => {
    if (!product || !product.id) return;
    
    // Check if user is admin (role 1) - prevent adding to cart
    if (isAdmin) {
      toast.error('Admins cannot add items to cart', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }
    
    setProcessingItems(prev => ({ ...prev, [product.id]: true }));
    
    try {
      if (isAuthenticated) {
        const response = await addToCart(product.id, 1);
        console.log('Add to cart response:', response);
        
        // Check for admin error in response
        if (response && response.role_error) {
          toast.error(response.message || 'Admins cannot add to cart', {
            position: "top-right",
            autoClose: 3000
          });
          return;
        }
        
        if (response?.status) {
          const updatedWishlist = wishlistItems.filter(item => item.id !== product.id);
          setWishlistItems(updatedWishlist);
          
          toast.success(`${product.name || 'Product'} added to cart`, {
            position: "top-right",
            autoClose: 2000
          });
          
          setSelectedItems(prev => prev.filter(id => id !== product.id));
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          
          let cartCount = 0;
          if (response.total_quantity) {
            cartCount = response.total_quantity;
          } else {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              const cart = JSON.parse(savedCart);
              cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            }
          }
          
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: cartCount } 
          }));
          
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: updatedWishlist.length } 
          }));
        } else {
          toast.error(response?.message || 'Failed to add to cart', {
            position: "top-right",
            autoClose: 2000
          });
        }
      } else {
        // Guest users logic
        const existingCart = localStorage.getItem('cart');
        let cart = existingCart ? JSON.parse(existingCart) : [];
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: getSafePrice(product),
            selling_price: getSafePrice(product),
            image: product.image,
            image_url: product.image_url,
            quantity: 1
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const updatedWishlist = wishlistItems.filter(item => item.id !== product.id);
        setWishlistItems(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        setSelectedItems(prev => prev.filter(id => id !== product.id));
        
        toast.success(`${product.name || 'Product'} added to cart`, {
          position: "top-right",
          autoClose: 2000
        });
        
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity, cart: cart } 
        }));
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: updatedWishlist.length } 
        }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.response?.status === 403) {
        toast.error('Admins cannot add items to cart', {
          position: "top-right",
          autoClose: 3000
        });
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAdmin(false);
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart', {
          position: "top-right",
          autoClose: 2000
        });
      }
    } finally {
      setProcessingItems(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const addMultipleToCart = async (products) => {
    if (!products || products.length === 0) return;
    
    // Check if user is admin (role 1) - prevent adding to cart
    if (isAdmin) {
      toast.error('Admins cannot add items to cart', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }
    
    setAddingToCart(true);
    let successCount = 0;
    let failCount = 0;
    const successfullyAddedIds = [];
    
    try {
      if (isAuthenticated) {
        for (const product of products) {
          try {
            const response = await addToCart(product.id, 1);
            if (response?.status) {
              successCount++;
              successfullyAddedIds.push(product.id);
            } else {
              failCount++;
            }
          } catch (err) {
            console.error(`Failed to add product ${product.id}:`, err);
            failCount++;
          }
        }
        
        if (successCount > 0) {
          const updatedWishlist = wishlistItems.filter(item => !successfullyAddedIds.includes(item.id));
          setWishlistItems(updatedWishlist);
          
          setSelectedItems(prev => prev.filter(id => !successfullyAddedIds.includes(id)));
          
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          
          toast.success(`${successCount} item(s) added to cart`, {
            position: "top-right",
            autoClose: 3000
          });
          
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: updatedWishlist.length } 
          }));
          
          let cartCount = 0;
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const cart = JSON.parse(savedCart);
            cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          }
          
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: cartCount } 
          }));
        } else {
          toast.error('Failed to add items to cart', {
            position: "top-right",
            autoClose: 2000
          });
        }
      } else {
        // Guest users logic
        const existingCart = localStorage.getItem('cart');
        let cart = existingCart ? JSON.parse(existingCart) : [];
        
        products.forEach(product => {
          const existingItem = cart.find(item => item.id === product.id);
          if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
          } else {
            cart.push({
              id: product.id,
              name: product.name,
              price: getSafePrice(product),
              selling_price: getSafePrice(product),
              image: product.image,
              image_url: product.image_url,
              quantity: 1
            });
          }
          successfullyAddedIds.push(product.id);
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const updatedWishlist = wishlistItems.filter(item => !successfullyAddedIds.includes(item.id));
        setWishlistItems(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        setSelectedItems(prev => prev.filter(id => !successfullyAddedIds.includes(id)));
        
        toast.success(`${products.length} item(s) added to cart`, {
          position: "top-right",
          autoClose: 2000
        });
        
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity, cart: cart } 
        }));
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: updatedWishlist.length } 
        }));
      }
    } catch (error) {
      console.error('Error adding multiple to cart:', error);
      
      if (error.response?.status === 403) {
        toast.error('Admins cannot add items to cart', {
          position: "top-right",
          autoClose: 3000
        });
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAdmin(false);
      } else {
        toast.error('Failed to add items to cart', {
          position: "top-right",
          autoClose: 2000
        });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const addSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to add to cart', {
        position: "top-right",
        autoClose: 2000
      });
      return;
    }

    const selectedProducts = wishlistItems.filter(item => selectedItems.includes(item.id));
    await addMultipleToCart(selectedProducts);
  }

  const getImageUrl = (product) => {
    if (!product) return `https://via.placeholder.com/400x300?text=Product`
    
    if (product.image_url) return product.image_url
    
    if (product.image) {
      if (product.image.startsWith('http')) return product.image
      if (product.image.startsWith('products/')) return `${API_URL}/storage/${product.image}`
      return `${API_URL}/storage/products/${product.image}`
    }
    
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name || 'Product')}`
  }

  const formatCurrency = (value) => {
    const numValue = Number(value) || 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numValue)
  }

  const getSafePrice = (product) => {
    if (!product) return 0
    
    if (product.selling_price) {
      const num = Number(product.selling_price)
      if (!isNaN(num) && num > 0) return num
    }
    
    if (product.price) {
      const num = Number(product.price)
      if (!isNaN(num) && num > 0) return num
    }
    
    return 0
  }

  const getSafeOriginalPrice = (product) => {
    if (!product) return 0
    
    const possibleFields = [
      'original_price', 'mrp', 'compare_at_price', 'regular_price',
      'old_price', 'list_price', 'originalPrice'
    ]
    
    for (const field of possibleFields) {
      if (product[field]) {
        const num = Number(product[field])
        if (!isNaN(num) && num > 0) {
          return num
        }
      }
    }
    
    return 0
  }

  const calculateDiscount = (product) => {
    const price = getSafePrice(product)
    const originalPrice = getSafeOriginalPrice(product)
    
    if (!originalPrice || originalPrice <= price || originalPrice === 0) return null
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  const isInStock = (product) => {
    if (!product) return false
    const stock = Number(product.stock) || 0
    const qty = Number(product.qty) || 0
    return stock > 0 || qty > 0
  }

  const calculateTotals = () => {
    let totalValue = 0
    let totalSavings = 0
    
    wishlistItems.forEach(item => {
      const price = getSafePrice(item)
      const originalPrice = getSafeOriginalPrice(item)
      
      totalValue += price
      
      if (originalPrice > price) {
        totalSavings += (originalPrice - price)
      }
    })
    
    return { totalValue, totalSavings }
  }

  const { totalValue, totalSavings } = calculateTotals()

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading wishlist...</p>
        </div>
      </Container>
    )
  }

  if (!isAuthenticated && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <Container>
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <HeartIcon className="w-24 h-24 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isAuthenticated 
                  ? "Start adding items to your wishlist!" 
                  : "Login to sync your wishlist across devices or continue as guest."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Browse Products
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // Show admin message if admin and wishlist is empty
  if (isAdmin && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <Container>
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <ExclamationTriangleIcon className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Admin View Only
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                As an admin, you can view wishlists but cannot add or modify items.
              </p>
              <p className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-6">
                <span className="font-semibold">Note:</span> This is a view-only mode. No modifications are allowed.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Products
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 lg:py-4">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                My Wishlist
                <HeartIconSolid className="w-8 h-8 text-red-500" />
                {!isAuthenticated && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Local - Login to sync)
                  </span>
                )}
                {isAdmin && (
                  <span className="text-sm font-normal text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full ml-2">
                    View Only
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {wishlistItems.length > 0 && !isAdmin && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearWishlist}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear All
                </button>
                <Link
                  to="/products"
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
                >
                  Continue Shopping
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
            
            {isAdmin && wishlistItems.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span><span className="font-semibold">Admin Mode:</span> You can view wishlist items but cannot add, remove, or modify them.</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <HeartIcon className="w-24 h-24 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save your favorite items here and come back to them anytime!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Products
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar - Hide for admin */}
            {!isAdmin && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === wishlistItems.length}
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select All ({wishlistItems.length})
                      </span>
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedItems.length} selected
                    </span>
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <button
                      onClick={addSelectedToCart}
                      disabled={addingToCart}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCartIcon className="w-4 h-4" />
                          Add Selected to Cart
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Table Header - Desktop only */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-white dark:bg-gray-800 p-4 rounded-t-lg border border-gray-200 dark:border-gray-700 font-medium text-sm text-gray-700 dark:text-gray-300">
              <div className={`${!isAdmin ? 'col-span-5' : 'col-span-6'} flex items-center gap-4`}>
                {!isAdmin && <span className="w-4"></span>}
                <span>Product</span>
              </div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Stock Status</div>
              <div className="col-span-2 text-center">Action</div>
              {!isAdmin && <div className="col-span-1 text-center"></div>}
            </div>

            {/* Wishlist Items */}
            <div className="space-y-3">
              {wishlistItems.map((item) => {
                const discount = calculateDiscount(item)
                const price = getSafePrice(item)
                const originalPrice = getSafeOriginalPrice(item)
                const inStock = isInStock(item)
                const isProcessing = processingItems[item.id]

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Mobile View */}
                    <div className="md:hidden p-4">
                      <div className="flex gap-4">
                        {!isAdmin && (
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                              className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={isAdmin}
                            />
                          </div>
                        )}

                        <Link to={`/products/${item.id}`} className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={getImageUrl(item)}
                              alt={item.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`
                              }}
                            />
                          </div>
                        </Link>

                        <div className="flex-1">
                          <Link to={`/products/${item.id}`}>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {item.category?.name || item.category_name || 'Uncategorized'}
                          </p>
                          
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(price)}
                            </span>
                            {originalPrice > price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatCurrency(originalPrice)}
                              </span>
                            )}
                          </div>

                          {discount && (
                            <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full mb-2">
                              {discount}% OFF
                            </span>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-block w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={`text-xs ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => addToCartHandler(item)}
                              disabled={!inStock || isProcessing || isAdmin}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                inStock && !isAdmin
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {isProcessing ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Adding...
                                </div>
                              ) : isAdmin ? (
                                'View Only'
                              ) : (
                                'Add to Cart'
                              )}
                            </button>
                            {!isAdmin && (
                              <button
                                onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className={`hidden md:grid ${!isAdmin ? 'grid-cols-12' : 'grid-cols-11'} gap-4 items-center p-4`}>
                      <div className={`${!isAdmin ? 'col-span-5' : 'col-span-6'} flex items-center gap-4`}>
                        {!isAdmin && (
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isAdmin}
                          />
                        )}
                        <Link to={`/products/${item.id}`} className="flex items-center gap-3 flex-1">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={getImageUrl(item)}
                              alt={item.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {item.category?.name || item.category_name || 'Uncategorized'}
                            </p>
                          </div>
                        </Link>
                      </div>

                      <div className="col-span-2 text-center">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(price)}
                        </div>
                        {originalPrice > price && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatCurrency(originalPrice)}
                          </div>
                        )}
                        {discount && (
                          <span className="text-xs text-red-500 font-medium">
                            {discount}% off
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        <button
                          onClick={() => addToCartHandler(item)}
                          disabled={!inStock || isProcessing || isAdmin}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            inStock && !isAdmin
                              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </div>
                          ) : isAdmin ? (
                            'View Only'
                          ) : (
                            'Add to Cart'
                          )}
                        </button>
                      </div>

                      {!isAdmin && (
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove from wishlist"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Wishlist Summary */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Wishlist Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{wishlistItems.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {wishlistItems.filter(item => isInStock(item)).length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalSavings)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  )
}