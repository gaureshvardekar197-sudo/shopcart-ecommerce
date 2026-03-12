import React from 'react';
import { ShieldCheckIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function TrustBadges() {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <ShieldCheckIcon className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
        </div>
        <div>
          <TruckIcon className="w-6 h-6 mx-auto text-blue-500 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">Free Delivery*</p>
        </div>
        <div>
          <ArrowPathIcon className="w-6 h-6 mx-auto text-purple-500 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">7 Days Return</p>
        </div>
      </div>
    </div>
  );
}

export default TrustBadges;