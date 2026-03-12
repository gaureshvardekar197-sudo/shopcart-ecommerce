import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center text-xs sm:text-sm mb-4 sm:mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-gray-900/20 overflow-x-auto whitespace-nowrap scrollbar-hide border border-gray-200 dark:border-gray-700">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400 dark:text-gray-600 flex-shrink-0" />
          )}
          {item.to ? (
            <Link
              to={item.to}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[120px] sm:max-w-[200px]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;