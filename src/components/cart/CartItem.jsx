// CartItem.js - Updated to show size information

import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import QuantitySelector from '../common/QuantitySelector';

function CartItem({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  formatCurrency,
  getImageUrl,
  getSafePrice,
  getSafeOriginalPrice
}) {
  if (!item?.id) return null;

  // Generate unique ID for cart item (productId + sizeId)
  const getUniqueItemId = () => {
    const sizeId = item.size_id || item.selected_size_id;
    return sizeId ? `${item.id}-${sizeId}` : `${item.id}-nosize`;
  };

  const quantity = item.quantity || 1;
  const price = getSafePrice(item);
  const originalPrice = getSafeOriginalPrice(item);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
  const inStock = (item.stock > 0 || item.qty > 0);
  const itemTotal = price * quantity;
  
  // Check if item has size information
  const hasSize = !!(item.size || item.selected_size || item.size_id || item.selected_size_id);
  const sizeDisplay = item.size || item.selected_size || '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Checkbox */}
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(getUniqueItemId())}
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
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=3B82F6&color=fff&size=400&length=2`;
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
                
                {/* Category & Size Badge */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {item.category?.name || item.category_name || 'Uncategorized'}
                  </span>
                  
                  {/* Show Size Badge if item has size */}
                  {hasSize && sizeDisplay && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Size:</span>
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-200">{sizeDisplay}</span>
                    </span>
                  )}
                  
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

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={() => onUpdateQuantity(
                    item.id, 
                    quantity + 1, 
                    item.size_id || item.selected_size_id
                  )}
                  onDecrease={() => onUpdateQuantity(
                    item.id, 
                    quantity - 1, 
                    item.size_id || item.selected_size_id
                  )}
                  maxQuantity={item.stock}
                  disabled={!inStock || isUpdating}
                  isUpdating={isUpdating}
                  size="md"
                />

                {/* Item Total */}
                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(itemTotal)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => onRemove(
                    item.id, 
                    item.name || 'Product',
                    item.size_id || item.selected_size_id
                  )}
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
  );
}

export default CartItem;