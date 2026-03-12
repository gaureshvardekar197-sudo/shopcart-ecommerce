import React from 'react';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

function StarRating({ rating, size = 'default', interactive = false, onRate = () => {} }) {
  const sizeClasses = {
    small: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
    default: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    large: 'w-4 h-4 sm:w-5 sm:h-5',
    xlarge: 'w-5 h-5 sm:w-6 sm:h-6'
  };
  const starSize = sizeClasses[size] || sizeClasses.default;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (interactive) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onRate(i)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          {i <= rating ? (
            <StarIconSolid className={`${starSize} text-yellow-400`} />
          ) : (
            <StarIconOutline className={`${starSize} text-gray-300 dark:text-gray-600 hover:text-yellow-200`} />
          )}
        </button>
      );
    } else {
      stars.push(
        i <= rating ? (
          <StarIconSolid key={i} className={`${starSize} text-yellow-400`} />
        ) : (
          <StarIconOutline key={i} className={`${starSize} text-gray-300 dark:text-gray-600`} />
        )
      );
    }
  }

  return <div className="flex items-center gap-1">{stars}</div>;
}

export default StarRating;