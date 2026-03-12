import React from 'react';

function WishlistSummary({ 
  totalItems, 
  inStockCount, 
  totalValue, 
  totalSavings,
  formatCurrency 
}) {
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Wishlist Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">In Stock</p>
          <p className="text-2xl font-bold text-green-600">{inStockCount}</p>
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
  );
}

export default WishlistSummary;