import React, { useState } from 'react';
import { HeartIcon, FireIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Badge from '../ui/Badge';

function ProductImages({
  images,
  name,
  discount,
  inStock,
  isAdmin,
  isInWishlist,
  onWishlistToggle,
  isAuthenticated,
  disabled
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 flex gap-1 sm:gap-2">
          {discount && !isAdmin && (
            <Badge variant="danger" icon={FireIcon}>
              {discount}% OFF
            </Badge>
          )}
          {!inStock && (
            <Badge variant="warning">
              Out of Stock
            </Badge>
          )}
          {isAdmin && (
            <Badge variant="admin">
              👑 Admin View
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={onWishlistToggle}
          className={`absolute top-2 sm:top-4 right-2 sm:right-4 z-10 p-2 sm:p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
          title={!isAuthenticated ? "Login to add to wishlist" : (isAdmin ? "Admins cannot add to wishlist" : "")}
        >
          {isInWishlist ? (
            <HeartIconSolid className={`w-4 h-4 sm:w-5 sm:h-5 ${disabled ? 'text-gray-400' : 'text-red-500'}`} />
          ) : (
            <HeartIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
          )}
        </button>

        {/* Main Image */}
        <div className="relative h-[300px] sm:h-[380px] lg:h-[440px] flex items-center justify-center p-4 sm:p-8">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={images[selectedImage]}
            alt={name}
            className={`max-w-full max-h-full object-contain transition-all duration-500 hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=400&length=2&font-size=0.4`;
              setImageLoaded(true);
            }}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(index);
                setImageLoaded(false);
              }}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 border ${selectedImage === index
                ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900 scale-105 border-transparent'
                : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                }`}
            >
              <img
                src={img}
                alt={`${name} ${index + 1}`}
                className="w-full h-full object-cover dark:bg-gray-800"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImages;