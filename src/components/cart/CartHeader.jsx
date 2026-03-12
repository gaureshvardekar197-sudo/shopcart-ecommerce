import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

function CartHeader({ itemCount, isAuthenticated, onClearCart }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            {!isAuthenticated && itemCount > 0 && (
              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                (Local - <Link to="/login" className="hover:underline">Login</Link> to sync)
              </span>
            )}
          </p>
        </div>

        {itemCount > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearCart}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Clear Cart
            </button>
            <Link
              to="/products"
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
            >
              Continue Shopping
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartHeader;