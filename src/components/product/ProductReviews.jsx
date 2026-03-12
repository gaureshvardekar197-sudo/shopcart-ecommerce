import React from 'react';
import { StarIcon, PencilSquareIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '../ui/Button';

function ProductReviews({
  reviews,
  reviewStats,
  loading,
  canReview,
  isAuthenticated,
  isAdmin,
  onOpenReviewModal,
  formatDate
}) {
  // Safely access canReview properties
  const canUserReview = canReview?.can_review === true;
  
  console.log('ProductReviews - Review eligibility:', {
    canReview: canReview,
    canUserReview,
    isAuthenticated,
    isAdmin,
    showButton: !isAdmin && isAuthenticated && canUserReview
  });

  const renderStars = (rating, size = 'default') => {
    const stars = [];
    const sizeClasses = {
      small: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
      default: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      large: 'w-4 h-4 sm:w-5 sm:h-5',
      xlarge: 'w-5 h-5 sm:w-6 sm:h-6'
    };
    const starSize = sizeClasses[size] || sizeClasses.default;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIconSolid key={i} className={`${starSize} text-yellow-400`} />
        ) : (
          <StarIcon key={i} className={`${starSize} text-gray-300 dark:text-gray-600`} />
        )
      );
    }
    return stars;
  };

  return (
    <div className="space-y-8">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <StarIcon className="w-6 h-6 text-yellow-300" />
              Customer Reviews
            </h3>
            <p className="text-blue-100 mt-1">What our customers say about this product</p>
          </div>
          
          {/* Review Button - Only show when user can review */}
          {!isAdmin && isAuthenticated && canUserReview && (
            <Button
              onClick={onOpenReviewModal}
              variant="primary"
              size="md"
              icon={PencilSquareIcon}
              className="bg-white text-blue-600 hover:shadow-lg hover:-translate-y-0.5"
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Rating Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {reviewStats.average?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(Math.round(reviewStats.average || 0), 'large')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Based on {reviewStats.total} {reviewStats.total === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>

        {/* Rating Distribution Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Rating Distribution</h4>
          <div className="space-y-3">
            {[5,4,3,2,1].map((rating) => {
              const count = reviewStats.distribution?.[rating] || 0;
              const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
                    <StarIconSolid className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-20">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    <span className="text-xs text-gray-500">({Math.round(percentage)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Reviews
          <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sorted by latest</span>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 mt-2">Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.map((review) => (
              <div key={review.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {review.user?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {/* {formatDate(review.created_at)} */}
                         {review.human_date || formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-10 mt-2">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating, 'small')}
                  </div>
                </div>
                
                {review.comment && (
                  <div className="ml-10 mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {reviews.length > 5 && (
            <div className="text-center pt-4">
              <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group">
                View All Reviews
                <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Be the first to share your experience with this product and help others make an informed decision.
          </p>
          {isAuthenticated && canUserReview && !isAdmin && (
            <Button
              onClick={onOpenReviewModal}
              variant="primary"
              size="lg"
              icon={PencilSquareIcon}
            >
              Write Your Review
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductReviews;