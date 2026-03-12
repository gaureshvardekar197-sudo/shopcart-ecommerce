import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function WishlistEmptyState({ isAuthenticated }) {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="max-w-md mx-auto">
        <HeartIcon className="w-24 h-24 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isAuthenticated 
            ? "Start adding items to your wishlist!" 
            : "Login to sync your wishlist across devices or continue as guest."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          )}
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 dark:bg-blue-700 text-black-600 dark:text-black-300 rounded-lg hover:bg-blue-900 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Browse Products
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WishlistEmptyState;