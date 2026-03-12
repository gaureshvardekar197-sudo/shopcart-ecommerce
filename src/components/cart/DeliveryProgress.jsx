import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';

function DeliveryProgress({ subtotal, freeDeliveryThreshold, formatCurrency }) {
  if (subtotal >= freeDeliveryThreshold) return null;

  const remainingAmount = freeDeliveryThreshold - subtotal;
  const progressPercentage = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800/30">
      {/* <div className="flex items-center gap-3 mb-3">
        <TruckIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Add {formatCurrency(remainingAmount)} more for FREE Delivery
        </h3>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"> */}
        {/* <div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div> */}
    </div>
  );
}

export default DeliveryProgress;