import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowPathIcon, TruckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';

function ReviewModal({ isOpen, onClose, onSubmit, isAuthenticated, canReview, submitting }) {
  const [formData, setFormData] = useState({ rating: 0, comment: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ rating: 0, comment: '' });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Write a Review
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Not eligible to review message */}
                {isAuthenticated && !canReview.can_review && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" />
                      {!canReview.has_purchased
                        ? 'You can only review this product after it has been delivered.'
                        : 'You have already reviewed this product.'}
                    </p>
                  </div>
                )}

                {/* Login required message */}
                {!isAuthenticated && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5" />
                      Please login to write a review.
                    </p>
                  </div>
                )}

                {/* Review Form */}
                {isAuthenticated && canReview.can_review && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 justify-center">
                        <StarRating
                          rating={formData.rating}
                          size="large"
                          interactive
                          onRate={(rating) => setFormData({ ...formData, rating })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                        placeholder="Share your experience with this product... (optional)"
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {formData.comment.length}/1000
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        disabled={submitting || formData.rating === 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          'Submit Review'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ReviewModal;