import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

function WishlistItem({
  item,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isProcessing,
  isAdmin,
  formatCurrency,
  getImageUrl,
}) {
  // Generate a unique ID combining product_id and size_id
  const getUniqueItemId = () => {
    const productId = item.id;
    const sizeId = item.pivot?.size_id || item.selected_size_id;
    return sizeId ? `${productId}-${sizeId}` : `${productId}-nosize`;
  };

  const uniqueId = getUniqueItemId();

  // Extract size information from different possible structures
  const getSizeInfo = () => {
    // For debugging - log the item structure
    console.log('Wishlist Item Data:', item);
    
    // From API response with pivot (authenticated users)
    if (item.pivot) {
      console.log('Pivot Data:', item.pivot);
      return {
        size: item.pivot.size || null,
        sizeId: item.pivot.size_id || null,
        price: item.pivot.selling_price || item.pivot.price || item.selling_price || item.price || 0,
        originalPrice: item.pivot.original_price || item.original_price || item.mrp || null,
        stock: item.pivot.stock !== undefined ? item.pivot.stock : (item.stock || item.qty || 0),
        hasSize: !!item.pivot.size_id
      };
    }
    
    // From localStorage (guest users) with size
    if (item.selected_size) {
      return {
        size: item.selected_size,
        sizeId: item.selected_size_id,
        price: item.size_price || item.selling_price || item.price || 0,
        originalPrice: item.size_original_price || item.original_price || item.mrp || null,
        stock: item.stock || item.qty || 0,
        hasSize: true
      };
    }
    
    // No size selected - return product info
    return {
      hasSize: false,
      price: item.selling_price || item.price || 0,
      originalPrice: item.original_price || item.mrp || null,
      stock: item.stock || item.qty || 0
    };
  };

  const sizeInfo = getSizeInfo();
  
  // Log the extracted size info
  console.log('Extracted Size Info:', sizeInfo);
  
  // Determine which price to display
  const displayPrice = sizeInfo.price;
  const displayOriginalPrice = sizeInfo.originalPrice;
  
  // Calculate discount
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : null;

  // Check stock status
  const inStock = sizeInfo.stock > 0;

  // Handle toggle select with unique ID
  const handleToggleSelect = () => {
    onToggleSelect(uniqueId);
  };

  // Handle remove with size ID
  const handleRemove = () => {
    onRemove(item.id, item.name, sizeInfo.sizeId, uniqueId);
  };

  // Handle add to cart with size info and remove from wishlist
  const handleAddToCart = () => {
    // First add to cart
    onAddToCart({
      ...item,
      selected_size: sizeInfo.hasSize ? sizeInfo.size : null,
      selected_size_id: sizeInfo.hasSize ? sizeInfo.sizeId : null,
      size_price: sizeInfo.hasSize ? sizeInfo.price : null,
      size_original_price: sizeInfo.hasSize ? sizeInfo.originalPrice : null
    });
    
    // Then remove from wishlist (automatically happens in the parent component)
    // Remove product from wishlist after adding to cart
  onRemove(item.id, item.name, sizeInfo.sizeId, uniqueId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden p-4">
        <div className="flex gap-4">
          {!isAdmin && (
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleToggleSelect}
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
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`;
                }}
              />
            </div>
          </Link>

          <div className="flex-1">
            <Link to={`/products/${item.id}`}>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
                {item.name}
              </h3>
            </Link>
            
            {/* Size Badge - Only show when size is selected */}
            {sizeInfo.hasSize && sizeInfo.size && (
              <div className="inline-flex items-center gap-1 mb-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Size:</span>
                <span className="text-xs font-bold text-blue-800 dark:text-blue-200">{sizeInfo.size}</span>
                {discount && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-1">
                    ({discount}% off)
                  </span>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {item.category?.name || item.category_name || 'Uncategorized'}
            </p>
            
            {/* Price Section - Clean display */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(displayPrice)}
              </span>
              {displayOriginalPrice > displayPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(displayOriginalPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-block w-2 h-2 rounded-full ${inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className={`text-xs font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              {sizeInfo.hasSize && sizeInfo.stock < 10 && inStock && (
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  Only {sizeInfo.stock} left
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || isProcessing || isAdmin}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  inStock && !isAdmin
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : isAdmin ? (
                  'View Only'
                ) : (
                  <>
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              {!isAdmin && (
                <button
                  onClick={handleRemove}
                  className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                  title="Remove from wishlist"
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
        {/* Product Info Column */}
        <div className={`${!isAdmin ? 'col-span-5' : 'col-span-6'} flex items-center gap-4`}>
          {!isAdmin && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggleSelect}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isAdmin}
            />
          )}
          <Link to={`/products/${item.id}`} className="flex items-center gap-4 flex-1 group">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img
                src={getImageUrl(item)}
                alt={item.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`;
                }}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.name}
              </h3>
              {/* Size Badge - Only show when size is selected */}
              {sizeInfo.hasSize && sizeInfo.size && (
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Size:</span>
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-200">{sizeInfo.size}</span>
                  {discount && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-1">
                      {discount}% off
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.category?.name || item.category_name || 'Uncategorized'}
              </p>
            </div>
          </Link>
        </div>

        {/* Price Column - Clean display */}
        <div className="col-span-2 text-center">
          <div className="font-bold text-lg text-gray-900 dark:text-white">
            {formatCurrency(displayPrice)}
          </div>
          {displayOriginalPrice > displayPrice && (
            <div className="text-xs text-gray-400 line-through">
              {formatCurrency(displayOriginalPrice)}
            </div>
          )}
          {discount && (
            <span className="inline-block mt-1 text-xs font-medium text-green-600 dark:text-green-400">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Stock Status Column */}
        <div className="col-span-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            {sizeInfo.hasSize && sizeInfo.stock < 10 && inStock && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                Only {sizeInfo.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="col-span-2 text-center">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isProcessing || isAdmin}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto ${
              inStock && !isAdmin
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>...</span>
              </>
            ) : isAdmin ? (
              'View Only'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>

        {/* Remove Button Column */}
        {!isAdmin && (
          <div className="col-span-1 text-center">
            <button
              onClick={handleRemove}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
              title="Remove from wishlist"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistItem;