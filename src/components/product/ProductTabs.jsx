import React, { useState } from 'react';
import { SparklesIcon, CheckBadgeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductReviews from './ProductReviews';

function ProductTabs({
  product,
  reviews,
  reviewStats,
  reviewsLoading,
  canReview,
  isAuthenticated,
  isAdmin,
  onOpenReviewModal,
  formatDate
}) {
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const tabs = ['description', 'features', 'specifications', 'reviews'];

  const fullDescription = product.description || product.long_description || product.details || '';
  const features = getFeatures(product);

  // Helper function to safely get category name
  const getCategoryName = () => {
    if (!product) return 'Uncategorized';
    
    if (product.category && typeof product.category === 'object') {
      return product.category.name || 'Uncategorized';
    }
    
    if (product.category_name && typeof product.category_name === 'object') {
      return product.category_name.name || 'Uncategorized';
    }
    
    return product.category_name || product.category || 'Uncategorized';
  };

  function getFeatures(product) {
    const features = [];
    if (product.features && Array.isArray(product.features)) {
      features.push(...product.features);
    }
    if (product.material) features.push(`Material: ${product.material}`);
    if (product.weight) features.push(`Weight: ${product.weight}`);
    if (product.warranty) features.push(`Warranty: ${product.warranty}`);

    return features.length > 0 ? features : ['Premium quality', '100% genuine', 'Secure packaging'];
  }

  return (
    <div className="mt-10 sm:mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium capitalize whitespace-nowrap transition-all relative ${activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {tab}
              {tab === 'reviews' && reviewStats.total > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px]">
                  {reviewStats.total}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <>
              {fullDescription ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className={`prose max-w-none text-sm sm:text-base transition-all duration-500 ${showFullDescription ? 'max-h-[1000px]' : 'max-h-[150px] sm:max-h-[200px] overflow-hidden'
                    }`}>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {fullDescription}
                    </p>
                  </div>
                  {fullDescription.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1.5 sm:gap-2 transition-all hover:gap-2 sm:hover:gap-3 text-xs sm:text-sm"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                      <ChevronRightIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFullDescription ? 'rotate-90' : ''
                        }`} />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No description available.</p>
              )}
            </>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                Key Features
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                    <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Category</span>
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">
                  {getCategoryName()}
                </span>
              </div>
              {product.brand && (
                <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Brand</span>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">
                    {product.brand}
                  </span>
                </div>
              )}
              {product.material && (
                <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Material</span>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">
                    {product.material}
                  </span>
                </div>
              )}
              {product.weight && (
                <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Weight</span>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">
                    {product.weight}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <ProductReviews
              reviews={reviews}
              reviewStats={reviewStats}
              loading={reviewsLoading}
              canReview={canReview}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onOpenReviewModal={onOpenReviewModal}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductTabs;