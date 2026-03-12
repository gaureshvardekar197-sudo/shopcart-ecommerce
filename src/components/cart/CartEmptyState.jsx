import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

function CartEmptyState() {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="max-w-md mx-auto">
        <ShoppingCartIcon className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Looks like you haven't added anything to your cart yet
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Start Shopping
        </Link>
      </div>
    </div>
  );
}

export default CartEmptyState;