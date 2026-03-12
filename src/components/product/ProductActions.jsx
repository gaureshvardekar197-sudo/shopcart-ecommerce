import React from 'react';
import { 
  ShoppingCartIcon, 
  TruckIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon, 
  GiftIcon 
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import QuantitySelector from '../ui/QuantitySelector';
import { toast } from 'react-toastify';

function ProductActions({
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  inStock,
  addingToCart,
  isAdmin,
  isAuthenticated,
  colors = [],
  sizes = [],
  selectedColor,
  onColorSelect,
  selectedSize,
  onSizeSelect,
  stock,
  deliveryDate,
  loadingSizes = false
}) {
  const maxStock = stock || 0;
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  // Helper function to extract size name from size object or string
  const getSizeName = (size) => {
    if (!size) return '';
    if (typeof size === 'string') return size;
    if (typeof size === 'object') {
      return size.size || size.name || size.value || '';
    }
    return String(size);
  };

  // Check if a specific size is selected
  const isCurrentSizeSelected = (size) => {
    const sizeName = getSizeName(size);
    return selectedSize === sizeName;
  };

  // Toast messages
  const showLoginRequiredToast = () => {
    toast.warning('Please login to add items to cart', {
      position: "top-right",
      autoClose: 2000,
      icon: "🔐"
    });
  };

  const showAdminToast = () => {
    toast.info('Admin cannot add to cart', {
      position: "top-right",
      autoClose: 2000,
      icon: "👑"
    });
  };

  const showOutOfStockToast = () => {
    toast.error('Product is out of stock', {
      position: "top-right",
      autoClose: 2000
    });
  };

  // Validation function - REMOVED size validation
  const validateBeforeAction = (action) => {
    if (!isAuthenticated) {
      showLoginRequiredToast();
      return false;
    }

    if (isAdmin) {
      showAdminToast();
      return false;
    }

    if (!inStock) {
      showOutOfStockToast();
      return false;
    }

    // Size validation REMOVED - users can add without selecting size
    return true;
  };

  const handleAddToCartClick = () => {
    if (validateBeforeAction()) {
      onAddToCart();
    }
  };

  const handleBuyNowClick = () => {
    if (validateBeforeAction()) {
      onBuyNow();
    }
  };

  const handleQuantityChange = (newQuantity) => {
    onQuantityChange(newQuantity);
  };

  const handleSizeClick = (sizeName) => {
    if (!isAdmin) {
      onSizeSelect(sizeName);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Colors Section */}
      {hasColors && (
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            Available Colors
          </h3>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => !isAdmin && onColorSelect(color)}
                className={`group relative w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 border-2 ${
                  selectedColor === color
                    ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900 scale-110 border-white dark:border-gray-900'
                    : 'border-gray-200 dark:border-gray-700 hover:scale-105'
                } ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ backgroundColor: color.toLowerCase() }}
                disabled={isAdmin}
                aria-label={`Select color ${color}`}
                title={color}
              >
                {selectedColor === color && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg">✓</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes Section - OPTIONAL now, no validation */}
      {hasSizes && (
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            Select Size 
          </h3>
          
          {loadingSizes ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Loading sizes...</span>
            </div>
          ) : (
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {sizes.map((size, index) => {
                const sizeName = getSizeName(size);
                const isSelected = isCurrentSizeSelected(size);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSizeClick(sizeName)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                    } ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={isAdmin}
                    title={`Select size ${sizeName}`}
                  >
                    {sizeName}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Optional size hint - not required */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ℹ️ Size selection is optional
          </p> */}
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <QuantitySelector
            quantity={quantity}
            onChange={handleQuantityChange}
            max={maxStock}
            disabled={!inStock || addingToCart || isAdmin}
          />

          <Button
            onClick={handleAddToCartClick}
            disabled={!inStock || addingToCart || isAdmin}
            variant={isAdmin ? 'admin' : 'primary'}
            size="lg"
            icon={ShoppingCartIcon}
            className="flex-1"
            loading={addingToCart}
          >
            {isAdmin ? 'Admin View Only' : 'Add to Cart'}
          </Button>
        </div>

        <Button
          onClick={handleBuyNowClick}
          disabled={!inStock || addingToCart || isAdmin}
          variant={isAdmin ? 'admin' : 'success'}
          size="lg"
          className="w-full"
          loading={addingToCart}
        >
          {isAdmin ? 'Admin View Only' : 'Buy Now'}
        </Button>
      </div>

      {/* Removed size selection alert - users can add without size */}

      {/* Selected Size Indicator (only shows if size is selected) */}
      {hasSizes && selectedSize && (
        <div className="text-xs text-green-600 dark:text-green-400 text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <span className="font-medium">✓ Size {selectedSize} selected</span>
        </div>
      )}

      {/* Delivery & Services */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
            <TruckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium">Delivery</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{deliveryDate}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
            <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium">Returns</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">7 days</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
            <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium">Warranty</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">1 year</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
            <GiftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium">Gift</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Available</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border ${
        inStock
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className={`text-xs sm:text-sm font-medium ${
            inStock ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {inStock ? `✓ In Stock (${maxStock} available)` : '× Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductActions;