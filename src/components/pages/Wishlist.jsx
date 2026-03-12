import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Container from '../layout/Container'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { getWishlist, removeFromWishlist, clearWishlist } from '../API/api-wishlist'
import { addToCart } from '../API/api-cart'

// Import components
import Loader from '../Common/Loader'
import WishlistHeader from '../Wishlist/WishlistHeader'
import WishlistEmptyState from '../Wishlist/WishlistEmptyState'
import AdminViewMessage from '../Wishlist/AdminViewMessage'
import BulkActionsBar from '../Wishlist/BulkActionsBar'
import WishlistItem from '../Wishlist/WishlistItem'
import WishlistSummary from '../Wishlist/WishlistSummary'

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
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
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

  const handleWishlistUpdate = (event) => {
    if (event.detail) {
      loadWishlist();
    }
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

  // Generate unique ID for wishlist item (productId + sizeId)
  const getItemUniqueId = (item) => {
    const sizeId = item.pivot?.size_id || item.selected_size_id;
    return sizeId ? `${item.id}-${sizeId}` : `${item.id}-nosize`;
  }

  // Handle size-specific removal
// Handle remove with unique ID
const handleRemoveFromWishlist = async (productId, productName, sizeId = null, uniqueId = null) => {
  if (isAdmin) {
    toast.error('Admins cannot remove items from wishlist', {
      position: "top-right",
      autoClose: 3000
    })
    return
  }

  if (!isAuthenticated) {
    // For guest users, filter by unique ID
    const updatedWishlist = wishlistItems.filter(item => {
      const itemUniqueId = getItemUniqueId(item);
      return uniqueId ? itemUniqueId !== uniqueId : true;
    })
    
    setWishlistItems(updatedWishlist)
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    
    toast.success(`${productName}${sizeId ? ' (Size specific)' : ''} removed from wishlist`, {
      position: "top-right",
      autoClose: 2000
    })
    
    // Remove from selected items using unique ID
    if (uniqueId) {
      setSelectedItems(prev => prev.filter(id => id !== uniqueId));
    }
    
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { count: updatedWishlist.length } 
    }))
    return
  }

  try {
    const response = await removeFromWishlist(productId, sizeId)
    
    if (response && response.role_error) {
      toast.error(response.message || 'Admins cannot remove items from wishlist', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }
    
    // Filter out the specific item with matching unique ID
    const updatedWishlist = wishlistItems.filter(item => {
      const itemUniqueId = getItemUniqueId(item);
      return uniqueId ? itemUniqueId !== uniqueId : true;
    })
    
    setWishlistItems(updatedWishlist)
    
    toast.success(`${productName}${sizeId ? ` (Size specific)` : ''} removed from wishlist`, {
      position: "top-right",
      autoClose: 2000
    })
    
    // Remove from selected items using unique ID
    if (uniqueId) {
      setSelectedItems(prev => prev.filter(id => id !== uniqueId));
    }
    
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

  // Toggle selection using unique ID
  // Toggle selection using unique ID
const toggleSelectItem = (uniqueId) => {
  if (isAdmin) {
    toast.info('Admins cannot select items', {
      position: "top-right",
      autoClose: 2000
    })
    return
  }
  
  setSelectedItems(prev =>
    prev.includes(uniqueId)
      ? prev.filter(id => id !== uniqueId)
      : [...prev, uniqueId]
  )
}

// Select all items using unique IDs
const selectAll = () => {
  if (isAdmin) {
    toast.info('Admins cannot select items', {
      position: "top-right",
      autoClose: 2000
    })
    return
  }
  
  const allUniqueIds = wishlistItems.map(item => getItemUniqueId(item));
  
  if (selectedItems.length === allUniqueIds.length) {
    setSelectedItems([])
  } else {
    setSelectedItems(allUniqueIds)
  }
}

  const addToCartHandler = async (product) => {
    if (!product || !product.id) return;
    
    if (isAdmin) {
      toast.error('Admins cannot add items to cart', {
        position: "top-right",
        autoClose: 3000
      })
      return
    }
    
    setProcessingItems(prev => ({ ...prev, [product.id]: true }));
    
    try {
      // Get size information from pivot or direct fields
      let selectedSize = null;
      let selectedSizeId = null;
      let priceToUse = product.selling_price || product.price || 0;
      
      if (product.pivot && product.pivot.size) {
        selectedSize = product.pivot.size;
        selectedSizeId = product.pivot.size_id;
        priceToUse = product.pivot.selling_price || product.pivot.price || priceToUse;
      } else if (product.selected_size) {
        selectedSize = product.selected_size;
        selectedSizeId = product.selected_size_id;
        priceToUse = product.size_price || priceToUse;
      }
      
      const uniqueId = getItemUniqueId(product);
      
      if (isAuthenticated) {
        // Pass size information to cart API if available
        const response = await addToCart(
          product.id, 
          1, 
          selectedSize || null,
          selectedSizeId || null
        );
        
        if (response && response.role_error) {
          toast.error(response.message || 'Admins cannot add to cart', {
            position: "top-right",
            autoClose: 3000
          });
          return;
        }
        
        if (response?.status) {
          const updatedWishlist = wishlistItems.filter(item => 
            getItemUniqueId(item) !== uniqueId
          );
          setWishlistItems(updatedWishlist);
          
          toast.success(`${product.name || 'Product'} added to cart${selectedSize ? ` (Size: ${selectedSize})` : ''}`, {
            position: "top-right",
            autoClose: 2000
          });
          
          setSelectedItems(prev => prev.filter(id => id !== uniqueId));
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: updatedWishlist.length } 
          }));
        }
      } else {
        // Handle guest cart with size info
        const existingCart = localStorage.getItem('cart');
        let cart = existingCart ? JSON.parse(existingCart) : [];
        
        const existingItem = cart.find(item => 
          item.id === product.id && 
          item.size === selectedSize
        );
        
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: priceToUse,
            selling_price: priceToUse,
            original_price: product.size_original_price || product.original_price || priceToUse,
            image: product.image,
            image_url: product.image_url,
            quantity: 1,
            size: selectedSize,
            size_id: selectedSizeId
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const updatedWishlist = wishlistItems.filter(item => 
          getItemUniqueId(item) !== uniqueId
        );
        setWishlistItems(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        toast.success(`${product.name || 'Product'} added to cart${selectedSize ? ` (Size: ${selectedSize})` : ''}`, {
          position: "top-right",
          autoClose: 2000
        });
        
        setSelectedItems(prev => prev.filter(id => id !== uniqueId));
        
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity } 
        }));
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: updatedWishlist.length } 
        }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        position: "top-right",
        autoClose: 2000
      });
    } finally {
      setProcessingItems(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const addMultipleToCart = async (products) => {
    if (!products || products.length === 0) return;
    
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
    const successfullyAddedUniqueIds = [];
    
    try {
      if (isAuthenticated) {
        for (const product of products) {
          try {
            const selectedSize = product.pivot?.size || product.selected_size;
            const selectedSizeId = product.pivot?.size_id || product.selected_size_id;
            
            const response = await addToCart(
              product.id, 
              1,
              selectedSize || null,
              selectedSizeId || null
            );
            
            if (response?.status) {
              successCount++;
              successfullyAddedUniqueIds.push(getItemUniqueId(product));
            } else {
              failCount++;
            }
          } catch (err) {
            console.error(`Failed to add product ${product.id}:`, err);
            failCount++;
          }
        }
        
        if (successCount > 0) {
          const updatedWishlist = wishlistItems.filter(item => 
            !successfullyAddedUniqueIds.includes(getItemUniqueId(item))
          );
          setWishlistItems(updatedWishlist);
          
          setSelectedItems(prev => prev.filter(id => !successfullyAddedUniqueIds.includes(id)));
          
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
        const existingCart = localStorage.getItem('cart');
        let cart = existingCart ? JSON.parse(existingCart) : [];
        
        products.forEach(product => {
          const selectedSize = product.selected_size || product.pivot?.size;
          const selectedSizeId = product.selected_size_id || product.pivot?.size_id;
          
          const existingItem = cart.find(item => 
            item.id === product.id && 
            item.size === selectedSize
          );
          
          if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
          } else {
            cart.push({
              id: product.id,
              name: product.name,
              price: getSafePrice(product),
              selling_price: getSafePrice(product),
              original_price: getSafeOriginalPrice(product),
              image: product.image,
              image_url: product.image_url,
              quantity: 1,
              size: selectedSize,
              size_id: selectedSizeId
            });
          }
          successfullyAddedUniqueIds.push(getItemUniqueId(product));
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const updatedWishlist = wishlistItems.filter(item => 
          !successfullyAddedUniqueIds.includes(getItemUniqueId(item))
        );
        setWishlistItems(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        setSelectedItems(prev => prev.filter(id => !successfullyAddedUniqueIds.includes(id)));
        
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


// Add selected to cart using unique IDs
const addSelectedToCart = async () => {
  if (selectedItems.length === 0) {
    toast.warning('Please select items to add to cart', {
      position: "top-right",
      autoClose: 2000
    });
    return;
  }

  // Map unique IDs back to actual products
  const selectedProducts = wishlistItems.filter(item => 
    selectedItems.includes(getItemUniqueId(item))
  );
  
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

  // Simplified price functions that just pass through the pivot data
  const getSafePrice = (product) => {
    if (product.pivot?.selling_price) return Number(product.pivot.selling_price);
    if (product.pivot?.price) return Number(product.pivot.price);
    if (product.size_price) return Number(product.size_price);
    if (product.selling_price) return Number(product.selling_price);
    if (product.price) return Number(product.price);
    return 0;
  }

  const getSafeOriginalPrice = (product) => {
    if (product.pivot?.original_price) return Number(product.pivot.original_price);
    if (product.size_original_price) return Number(product.size_original_price);
    if (product.original_price) return Number(product.original_price);
    if (product.mrp) return Number(product.mrp);
    return 0;
  }

  const calculateDiscount = (product) => {
    const price = getSafePrice(product);
    const originalPrice = getSafeOriginalPrice(product);
    
    if (!originalPrice || originalPrice <= price || originalPrice === 0) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  const isInStock = (product) => {
    if (product.pivot?.stock !== undefined) return Number(product.pivot.stock) > 0;
    if (product.size_stock !== undefined) return Number(product.size_stock) > 0;
    const stock = Number(product.stock) || 0;
    const qty = Number(product.qty) || 0;
    return stock > 0 || qty > 0;
  }

  const calculateTotals = () => {
    let totalValue = 0;
    let totalSavings = 0;
    
    wishlistItems.forEach(item => {
      const price = getSafePrice(item);
      const originalPrice = getSafeOriginalPrice(item);
      
      totalValue += price;
      
      if (originalPrice > price) {
        totalSavings += (originalPrice - price);
      }
    });
    
    return { totalValue, totalSavings };
  }

  const { totalValue, totalSavings } = calculateTotals();
  const inStockCount = wishlistItems.filter(item => isInStock(item)).length;

  if (loading) {
    return <Loader message="Loading wishlist..." />;
  }

  if (!isAuthenticated && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <Container>
          <WishlistEmptyState isAuthenticated={isAuthenticated} />
        </Container>
      </div>
    );
  }

  if (isAdmin && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
        <Container>
          <AdminViewMessage />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 lg:py-4">
      <Container>
        <WishlistHeader 
          itemCount={wishlistItems.length}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onClearWishlist={handleClearWishlist}
        />

        {wishlistItems.length > 0 ? (
          <>
            <BulkActionsBar
              totalItems={wishlistItems.length}
              selectedCount={selectedItems.length}
              onSelectAll={selectAll}
              onAddSelected={addSelectedToCart}
              isAdding={addingToCart}
              disabled={isAdmin}
            />

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
                const uniqueId = getItemUniqueId(item);
                return (
                  <WishlistItem
                    key={uniqueId}
                    item={item}
                    isSelected={selectedItems.includes(uniqueId)}
                    onToggleSelect={toggleSelectItem}
                    onAddToCart={addToCartHandler}
                    onRemove={handleRemoveFromWishlist}
                    isProcessing={processingItems[item.id]}
                    isAdmin={isAdmin}
                    formatCurrency={formatCurrency}
                    getImageUrl={getImageUrl}
                    isInStock={isInStock}
                    calculateDiscount={calculateDiscount}
                    getSafePrice={getSafePrice}
                    getSafeOriginalPrice={getSafeOriginalPrice}
                  />
                );
              })}
            </div>

            <WishlistSummary
              totalItems={wishlistItems.length}
              inStockCount={inStockCount}
              totalValue={totalValue}
              totalSavings={totalSavings}
              formatCurrency={formatCurrency}
            />
          </>
        ) : (
          <WishlistEmptyState isAuthenticated={isAuthenticated} />
        )}
      </Container>
    </div>
  );
}