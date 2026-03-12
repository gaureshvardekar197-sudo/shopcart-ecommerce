import React from 'react';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

function BulkActionsBar({ 
  totalItems, 
  selectedCount, 
  onSelectAll, 
  onMoveToWishlist,  // Changed from onBulkAction
  isAllSelected,
  isMoving = false  // Add loading state
}) {
  if (totalItems === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
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
            type="button"
            onClick={onMoveToWishlist}
            disabled={isMoving}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMoving ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                Moving...
              </>
            ) : (
              <>
                <HeartIconSolid className="w-4 h-4" />
                Move to Wishlist ({selectedCount})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default BulkActionsBar;