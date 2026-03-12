import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

function ProductCard({
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
  isAdmin,
  defaultSize
}) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Check if product actually has sizes (handle both original product and wishlist/cart items)
  const hasSizes = (() => {
    // Check original product structure
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return true
    }
    // Check wishlist/cart structure with pivot data
    if (product?.pivot?.size_id || product?.selected_size_id) {
      return true
    }
    return false
  })()

  // Get the correct price based on where the product is from
  const getDisplayPrice = () => {
    // If price is provided as prop, use it
    if (price !== undefined) return price
    
    // Check wishlist/cart structure
    if (product?.pivot?.selling_price) return product.pivot.selling_price
    if (product?.pivot?.price) return product.pivot.price
    if (product?.size_price) return product.size_price
    if (product?.selling_price) return product.selling_price
    if (product?.price) return product.price
    return 0
  }

  // Get the correct original price
  const getDisplayOriginalPrice = () => {
    if (originalPrice !== undefined) return originalPrice
    if (product?.pivot?.original_price) return product.pivot.original_price
    if (product?.size_original_price) return product.size_original_price
    if (product?.original_price) return product.original_price
    if (product?.mrp) return product.mrp
    return 0
  }

  // Get the correct size name
  const getDisplaySize = () => {
    if (defaultSize) return defaultSize
    if (product?.pivot?.size) return product.pivot.size
    if (product?.selected_size) return product.selected_size
    return null
  }

  // Check if item has multiple sizes
  const hasMultipleSizes = () => {
    return product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 1
  }

  const displayPrice = getDisplayPrice()
  const displayOriginalPrice = getDisplayOriginalPrice()
  const displaySize = getDisplaySize()

  const getImageUrl = () => {
    if (imageError) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=200&length=1&font-size=0.5`
    }
    return product.image_url || product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=200&length=1&font-size=0.5`
  }

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

          {/* Size Badge - ONLY SHOW FOR PRODUCTS THAT ACTUALLY HAVE SIZES */}
          {hasSizes && displaySize && (
            <div className="">
              <span className="hidden">Size:</span>
              <span className="hidden">{displaySize}</span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(displayPrice)}
            </span>
            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <span className="text-sm text-red-500 line-through">
                {formatCurrency(displayOriginalPrice)}
              </span>
            )}
          </div>

          {/* Multiple sizes indicator - ONLY SHOW FOR PRODUCTS WITH MULTIPLE SIZES */}
          {hasMultipleSizes() && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +{product.sizes.length - 1} more sizes available
            </p>
          )}
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

export default ProductCard