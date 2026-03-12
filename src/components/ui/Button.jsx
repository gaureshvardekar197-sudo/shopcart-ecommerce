import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-xl',
  success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-xl border-2 border-green-600',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-xl',
  outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  disabled: 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-gray-700',
  admin: 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed border border-gray-400 dark:border-gray-600',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${buttonSizes[size]} ${buttonVariants[isDisabled ? (variant === 'admin' ? 'admin' : 'disabled') : variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;