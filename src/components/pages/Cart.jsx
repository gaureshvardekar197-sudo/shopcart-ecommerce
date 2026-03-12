import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../layout/Container'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart as apiClearCart 
} from '../API/api-cart'
import { addToWishlist, getWishlist } from '../API/api-wishlist'

// Import components
import Loader from '../Common/Loader'
import CartHeader from '../cart/CartHeader'
import CartEmptyState from '../cart/CartEmptyState'
import BulkActionsBar from '../cart/BulkActionsBar'
import CartItem from '../cart/CartItem'
import DeliveryProgress from '../cart/DeliveryProgress'
import CartSummary from '../cart/CartSummary'

const API_URL = "http://localhost:8000";
const FREE_DELIVERY_THRESHOLD = 500
const DELIVERY_CHARGE = 40

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [updatingItems, setUpdatingItems] = useState({})
  const [movingToWishlist, setMovingToWishlist] = useState(false)

  // Helper function to generate unique ID for cart item (productId + sizeId)
  const getItemUniqueId = (item) => {
    const sizeId = item.size_id || item.selected_size_id;
    return sizeId ? `${item.id}-${sizeId}` : `${item.id}-nosize`;
  }

  // Helper function to extract size ID from item
  const getItemSizeId = (item) => {
    return item.size_id || item.selected_size_id || null;
  }

  // Helper function to get size name from item
  const getItemSize = (item) => {
    return item.size || item.selected_size || null;
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    loadCart(!!token)
  }, [])

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
      setSelectedItems([])
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
          // Ensure each item has unique ID based on size
          const itemsWithUniqueId = parsed.map(item => ({
            ...item,
            uniqueId: getItemUniqueId(item)
          }));
          setCartItems(itemsWithUniqueId);
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
      const response = await getCart();
      
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
        stock: item.stock || item.qty || 0,
        size: item.size || item.selected_size,
        size_id: item.size_id || item.selected_size_id,
        category: item.category,
        category_name: item.category_name || item.category?.name,
        uniqueId: getItemUniqueId(item)
      }));
      
      setCartItems(cartData);
      
      // Calculate total quantity
      const totalQuantity = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      // Update cart count in navbar
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: totalQuantity, cart: cartData } 
      }));
      
      // Sync with localStorage
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
            const parsed = JSON.parse(savedCart);
            const itemsWithUniqueId = parsed.map(item => ({
              ...item,
              uniqueId: getItemUniqueId(item)
            }));
            setCartItems(itemsWithUniqueId);
          } catch {
            setCartItems([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity, sizeId = null) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(item => 
      item.id === productId && getItemSizeId(item) === sizeId
    );
    
    if (!item) return;
    
    if (item.stock && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
    
    const itemKey = getItemUniqueId(item);
    setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
    
    // Optimistic update
    const updatedItems = cartItems.map(item => {
      const currentItemKey = getItemUniqueId(item);
      if (currentItemKey === itemKey) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);
    
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      const totalQuantity = updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: totalQuantity, cart: updatedItems } 
      }));
      
      setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
      return;
    }

    try {
      const response = await updateCartItem(productId, newQuantity, sizeId);
      
      if (response?.status === true) {
        const totalQuantity = updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalQuantity, cart: updatedItems } 
        }));
      } else {
        // Revert on failure
        setCartItems(cartItems);
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
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
      setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const removeFromCart = async (productId, productName, sizeId = null) => {
    const result = await Swal.fire({
      title: 'Remove Item?',
      text: `Are you sure you want to remove "${productName}" from your cart?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (!result.isConfirmed) {
      return;
    }
    
    // Find the item to remove
    const itemToRemove = cartItems.find(item => 
      item.id === productId && getItemSizeId(item) === sizeId
    );
    
    if (!itemToRemove) return;
    
    const itemKey = getItemUniqueId(itemToRemove);
    setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
    
    // Filter out the specific item
    const updatedItems = cartItems.filter(item => getItemUniqueId(item) !== itemKey);
    setCartItems(updatedItems);
    setSelectedItems(prev => prev.filter(id => id !== itemKey));
    
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
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
      
      setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
      return;
    }

    try {
      const response = await removeCartItem(productId, sizeId);
      
      if (response?.status) {
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
      } else {
        // Revert on failure
        setCartItems(cartItems);
        setSelectedItems(prev => [...prev, itemKey]);
        
        Swal.fire({
          title: 'Error!',
          text: 'Failed to remove item. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartItems(cartItems);
      setSelectedItems(prev => [...prev, itemKey]);
      
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
      setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const clearCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (cartItems.length === 0) return;
    
    try {
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
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const previousItems = [...cartItems];
            
            setCartItems([]);
            setAppliedCoupon(null);
            setCouponCode('');
            setSelectedItems([]);
            
            if (!isAuthenticated) {
              localStorage.setItem('cart', JSON.stringify([]));
              window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
              return { success: true, message: 'Cart cleared successfully' };
            }

            const response = await apiClearCart();
            
            if (response?.status === true) {
              window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
              return { success: true, message: 'Cart cleared successfully' };
            } else {
              setCartItems(previousItems);
              setSelectedItems(previousItems.map(item => getItemUniqueId(item)));
              throw new Error('Failed to clear cart');
            }
          } catch (error) {
            console.error('Error clearing cart:', error);
            throw new Error(error.response?.data?.message || 'Failed to clear cart');
          }
        }
      });

      if (result.isConfirmed) {
        await Swal.fire({
          title: 'Cleared!',
          text: result.value?.message || 'Your cart has been cleared successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        setCartItems([]);
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
      }
    } catch (error) {
      console.error('Error in clear cart:', error);
      toast.error('An error occurred while clearing the cart');
    }
  };

  const toggleSelectItem = (uniqueId) => {
    setSelectedItems(prev =>
      prev.includes(uniqueId)
        ? prev.filter(id => id !== uniqueId)
        : [...prev, uniqueId]
    );
  }

  const selectAll = () => {
    const allUniqueIds = cartItems.map(item => getItemUniqueId(item));
    
    if (selectedItems.length === allUniqueIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allUniqueIds);
    }
  }

  const moveSelectedToWishlist = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to move to wishlist');
      return;
    }

    if (!isAuthenticated) {
      toast.warning('🔐 Please login to move items to wishlist');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    const result = await Swal.fire({
      title: 'Move to Wishlist?',
      html: `
        <div class="text-center">
          <p class="text-lg mb-2">Move ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} to wishlist?</p>
          <p class="text-sm text-gray-500">These items will be removed from your cart and added to your wishlist.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move them!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setMovingToWishlist(true);

    try {
      // Get selected products with their size info
      const selectedProducts = cartItems.filter(item => 
        selectedItems.includes(getItemUniqueId(item))
      );
      
      let successCount = 0;
      let failCount = 0;
      const movedItemIds = [];

      // Process each selected item
      for (const item of selectedProducts) {
        try {
          const sizeId = getItemSizeId(item);
          const size = getItemSize(item);
          
          // Add to wishlist with size information
          await addToWishlist(item.id, size, sizeId);
          
          // Remove from cart with size information
          await removeCartItem(item.id, sizeId);
          
          successCount++;
          movedItemIds.push(getItemUniqueId(item));
        } catch (error) {
          console.error(`Failed to move item ${item.id}:`, error);
          failCount++;
        }
      }

      // Update cart state
      const updatedCartItems = cartItems.filter(item => 
        !movedItemIds.includes(getItemUniqueId(item))
      );
      setCartItems(updatedCartItems);
      localStorage.setItem('cart', JSON.stringify(updatedCartItems));

      // Update selected items
      setSelectedItems([]);

      // Update wishlist count
      const wishlistResponse = await getWishlist();
      const wishlistData = wishlistResponse?.data || wishlistResponse || [];
      const wishlistCount = Array.isArray(wishlistData) ? wishlistData.length : 0;
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: wishlistCount } 
      }));

      // Update cart count
      const totalQuantity = updatedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: totalQuantity, cart: updatedCartItems } 
      }));

      // Show result message
      if (successCount > 0) {
        Swal.fire({
          title: 'Success!',
          text: `${successCount} ${successCount === 1 ? 'item' : 'items'} moved to wishlist successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }

      if (failCount > 0) {
        toast.error(`Failed to move ${failCount} ${failCount === 1 ? 'item' : 'items'}`);
      }

    } catch (error) {
      console.error('Error moving items to wishlist:', error);
      toast.error('Failed to move items to wishlist');
    } finally {
      setMovingToWishlist(false);
    }
  };

  // Helper functions for price calculations
  const getSafePrice = (product) => {
    if (!product) return 0;
    return Number(product.selling_price || product.price || 0) || 0;
  }

  const getSafeOriginalPrice = (product) => {
    if (!product) return 0;
    return Number(product.original_price || product.mrp || 0) || 0;
  }

  const getImageUrl = (product) => {
    if (!product) return '';
    if (product.image_url) return product.image_url;
    if (product.image) {
      if (product.image.startsWith('http')) return product.image;
      if (product.image.startsWith('products/')) return `${API_URL}/storage/${product.image}`;
      return `${API_URL}/storage/products/${product.image}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Product')}&background=3B82F6&color=fff&size=400&length=2`;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  const calculateTotals = () => {
    let subtotal = 0;
    let originalTotal = 0;
    let itemCount = 0;
    
    cartItems.forEach(item => {
      const quantity = item.quantity || 1;
      const price = getSafePrice(item);
      const originalPrice = getSafeOriginalPrice(item);
      
      subtotal += price * quantity;
      originalTotal += Math.max(originalPrice, price) * quantity;
      itemCount += quantity;
    });
    
    const savings = originalTotal - subtotal;
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    
    return { subtotal, originalTotal, itemCount, savings, deliveryCharge };
  }

  const { subtotal, originalTotal, itemCount, savings, deliveryCharge } = calculateTotals();

  const getDiscountedTotal = () => {
    if (!appliedCoupon) return subtotal;
    
    if (appliedCoupon.type === 'percentage') {
      return subtotal - (subtotal * appliedCoupon.discount / 100);
    } else {
      return Math.max(0, subtotal - appliedCoupon.discount);
    }
  }

  const discountedTotal = getDiscountedTotal();
  const finalTotal = discountedTotal + deliveryCharge;
  const discountAmount = subtotal - discountedTotal;

  if (loading) {
    return <Loader message="Loading your cart..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 lg:py-4">
      <Container>
        <CartHeader 
          itemCount={cartItems.length}
          isAuthenticated={isAuthenticated}
          onClearCart={clearCart}
        />

        {cartItems.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-6">
              <BulkActionsBar
                totalItems={cartItems.length}
                selectedCount={selectedItems.length}
                onSelectAll={selectAll}
                onMoveToWishlist={moveSelectedToWishlist}
                isAllSelected={selectedItems.length === cartItems.length}
                isMoving={movingToWishlist}
              />

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={getItemUniqueId(item)}
                    item={item}
                    isSelected={selectedItems.includes(getItemUniqueId(item))}
                    onToggleSelect={toggleSelectItem}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    isUpdating={updatingItems[getItemUniqueId(item)]}
                    formatCurrency={formatCurrency}
                    getImageUrl={getImageUrl}
                    getSafePrice={getSafePrice}
                    getSafeOriginalPrice={getSafeOriginalPrice}
                  />
                ))}
              </div>

              <DeliveryProgress
                subtotal={subtotal}
                freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                formatCurrency={formatCurrency}
              />
            </div>

            {/* Order Summary */}
            <CartSummary
              subtotal={subtotal}
              originalTotal={originalTotal}
              itemCount={itemCount}
              savings={savings}
              discountAmount={discountAmount}
              deliveryCharge={deliveryCharge}
              finalTotal={finalTotal}
              formatCurrency={formatCurrency}
              isCheckoutDisabled={cartItems.length === 0}
            />
          </div>
        )}
      </Container>
    </div>
  );
}