import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function RelatedProducts({ products, categoryName, formatCurrency, getOriginalPrice, isAdmin }) {
  if (!products.length) return null;

  return (
    <div className="mt-10 sm:mt-16">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          You might also like
        </h2>
        <Link
          to={`/products?category=${categoryName.toLowerCase()}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 sm:gap-1 group text-xs sm:text-sm"
        >
          View All
          <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map(product => {
          const price = product.selling_price || product.price || 0;
          const original = getOriginalPrice(product);
          const discount = original && original > price
            ? Math.round(((original - price) / original) * 100)
            : null;

          return (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-2 sm:p-4">
                {discount && !isAdmin && (
                  <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
                    -{discount}%
                  </span>
                )}
                <img
                  src={product.image_url || product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=200`}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 dark:brightness-90"
                />
              </div>
              <div className="p-2 sm:p-4">
                <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                    {formatCurrency(price)}
                  </span>
                  {original && original > price && !isAdmin && (
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 line-through">
                      {formatCurrency(original)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RelatedProducts;