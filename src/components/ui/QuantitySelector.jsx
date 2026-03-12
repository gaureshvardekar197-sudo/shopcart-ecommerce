import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

function QuantitySelector({ quantity, onChange, max, disabled = false }) {
  const handleDecrease = () => {
    onChange(Math.max(1, quantity - 1));
  };

  const handleIncrease = () => {
    if (!max || quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl w-full sm:w-auto border border-gray-200 dark:border-gray-700">
      <button
        onClick={handleDecrease}
        className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-xl transition-colors disabled:opacity-50 text-lg sm:text-xl"
        disabled={disabled || quantity <= 1}
      >
        <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <span className="w-12 sm:w-14 text-center font-medium text-gray-900 dark:text-white text-base sm:text-lg">
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-xl transition-colors disabled:opacity-50 text-lg sm:text-xl"
        disabled={disabled || (max && quantity >= max)}
      >
        <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}

export default QuantitySelector;