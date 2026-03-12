import React from 'react';

const badgeVariants = {
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-yellow-500 text-white',
};

function Badge({ children, variant = 'primary', icon: Icon, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg ${badgeVariants[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
      {children}
    </span>
  );
}

export default Badge;