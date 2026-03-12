import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function AdminViewMessage() {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="max-w-md mx-auto">
        <ExclamationTriangleIcon className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin View Only
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          As an admin, you can view wishlists but cannot add or modify items.
        </p>
        <p className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-6">
          <span className="font-semibold">Note:</span> This is a view-only mode. No modifications are allowed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Browse Products
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default AdminViewMessage;