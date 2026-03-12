import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

function BulkActionsBar({
  totalItems,
  selectedCount,
  onSelectAll,
  onAddSelected,
  isAdding,
  disabled
}) {
  if (disabled) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCount === totalItems}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select All ({totalItems})
            </span>
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCount} selected
          </span>
        </div>
        
        {selectedCount > 0 && (
          <button
            onClick={onAddSelected}
            disabled={isAdding}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
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
  );
}

export default BulkActionsBar;