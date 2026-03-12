import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon as HeartIconSolid, TrashIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function WishlistHeader({ 
  itemCount, 
  isAuthenticated, 
  isAdmin, 
  onClearWishlist 
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            My Wishlist
            <HeartIconSolid className="w-8 h-8 text-red-500" />
            {!isAuthenticated && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Local - Login to sync)
              </span>
            )}
            {isAdmin && (
              <span className="text-sm font-normal text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full ml-2">
                View Only
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {itemCount > 0 && !isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={onClearWishlist}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Clear All
            </button>
            <Link
              to="/products"
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
            >
              Continue Shopping
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
        
        {isAdmin && itemCount > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span><span className="font-semibold">Admin Mode:</span> You can view wishlist items but cannot add, remove, or modify them.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistHeader;