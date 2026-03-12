import React from 'react';
import { CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';

function ProductInfo({ 
  product, 
  categoryName, 
  isAdmin, 
  hidePrice = false,
  selectedSize = null,
  sizePrice = null,
  sizeOriginalPrice = null,
  formatCurrency 
}) {
  // Determine which price to show
  const displayPrice = selectedSize && sizePrice ? sizePrice : (product.selling_price || product.price || 0);
  const displayOriginalPrice = selectedSize && sizeOriginalPrice ? sizeOriginalPrice : (product.original_price || product.mrp || null);
  
  const smallDescription = product.small_description || product.short_description || '';

  // Helper to safely get brand name
  const getBrandName = () => {
    if (!product.brand) return null;
    
    // If brand is an object, try to get its name
    if (typeof product.brand === 'object') {
      return product.brand.name || null;
    }
    
    // If brand is a string, return it
    return product.brand;
  };

  const brandName = getBrandName();

  // Calculate discount
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title & Category */}
      <div>
        {brandName && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2">
            <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{brandName}</span>
          </div>
        )}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
          {product.name}
        </h1>

        {/* Category Display */}
        <div className="flex items-center flex-wrap gap-2">
          <Badge variant="primary">
            {categoryName}
          </Badge>
          {isAdmin && (
            <Badge variant="warning">
              👑 Admin View Only
            </Badge>
          )}
        </div>
      </div>

      {/* Price - Always show here (product price OR size price) */}
      <div className={`bg-gradient-to-r ${isAdmin ? 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'} p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isAdmin ? 'border-yellow-200 dark:border-yellow-800/30' : 'border-blue-100 dark:border-blue-800/30'}`}>
        <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(displayPrice)}
          </span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && !isAdmin && (
            <>
              <span className="text-base sm:text-lg lg:text-xl text-gray-400 dark:text-gray-500 line-through">
                {formatCurrency(displayOriginalPrice)}
              </span>
              {discount && (
                <span className="bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md">
                  Save {discount}%
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Show size indicator when size price is active */}
        {selectedSize && sizePrice && (
          <div className="mt-2">
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
              <span className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                Price for {selectedSize}
              </span>
            </p>
          </div>
        )}
        
        {!isAdmin ? (
          <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1.5 sm:mt-2 flex items-center gap-1">
            <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Inclusive of all taxes
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 mt-1.5 sm:mt-2 flex items-center gap-1">
            <span>👑</span>
            Admin viewing mode - no purchases allowed
          </p>
        )}
      </div>

      {/* Small Description */}
      {smallDescription && !isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-start gap-2 sm:gap-3">
            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base text-purple-800 dark:text-purple-300">{smallDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductInfo;