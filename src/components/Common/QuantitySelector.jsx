import React from 'react';
import { MinusIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  maxQuantity,
  disabled = false,
  isUpdating = false,
  size = 'md'
}) {
  const sizeClasses = {
    sm: {
      button: 'w-8 h-8',
      text: 'w-10',
      icon: 'w-3 h-3'
    },
    md: {
      button: 'w-10 h-10',
      text: 'w-12',
      icon: 'w-4 h-4'
    },
    lg: {
      button: 'w-12 h-12',
      text: 'w-14',
      icon: 'w-5 h-5'
    }
  };

  const classes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1 || isUpdating}
        className={`${classes.button} flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        <MinusIcon className={classes.icon} />
      </button>
      <span className={`${classes.text} text-center font-medium text-gray-900 dark:text-white`}>
        {isUpdating ? (
          <ArrowPathIcon className={`${classes.icon} animate-spin mx-auto`} />
        ) : (
          quantity
        )}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || isUpdating || (maxQuantity && quantity >= maxQuantity)}
        className={`${classes.button} flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        <PlusIcon className={classes.icon} />
      </button>
    </div>
  );
}

export default QuantitySelector;