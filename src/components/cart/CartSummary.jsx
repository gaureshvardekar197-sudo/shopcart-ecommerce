import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, TagIcon, TruckIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import TrustBadges from './TrustBadges';

function CartSummary({
  subtotal,
  originalTotal,
  itemCount,
  savings,
  discountAmount,
  deliveryCharge,
  finalTotal,
  formatCurrency,
  isCheckoutDisabled
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 sticky top-24">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <CreditCardIcon className="w-6 h-6 text-blue-600" />
          Order Summary
        </h2>

        {/* Price Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Subtotal ({itemCount} items)
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {originalTotal > subtotal && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <TagIcon className="w-4 h-4 text-green-500" />
                You Save
              </span>
              <span className="font-medium text-green-600">
                {formatCurrency(savings)}
              </span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Coupon Discount
              </span>
              <span className="font-medium text-green-600">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <TruckIcon className="w-4 h-4 text-gray-500" />
              Delivery Charge
            </span>
            {deliveryCharge === 0 ? (
              <span className="font-medium text-green-600">FREE</span>
            ) : (
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(deliveryCharge)}
              </span>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(finalTotal)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Inclusive of all taxes
            </p>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          disabled={isCheckoutDisabled}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
        >
          <ShoppingCartIcon className="w-5 h-5" />
          Proceed to Checkout
        </button>

        {/* Trust Badges */}
        <TrustBadges />
      </div>
    </div>
  );
}

export default CartSummary;