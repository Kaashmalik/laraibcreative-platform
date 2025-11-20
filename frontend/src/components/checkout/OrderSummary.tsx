/**
 * Order Summary Component
 * Sidebar showing order summary with promo code
 * 
 * @module components/checkout/OrderSummary
 */

'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Tag, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '@/types/cart';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  promoCode?: string;
  onPromoCodeChange?: (code: string) => void;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  discount,
  tax,
  total,
  promoCode,
  onPromoCodeChange,
}: OrderSummaryProps) {
  const { applyCoupon, removeCoupon, isLoading } = useCart();
  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoError('');
    setPromoSuccess('');

    try {
      const result = await applyCoupon(promoInput.trim().toUpperCase());
      if (result.success) {
        setPromoSuccess(`Coupon applied! You saved ${formatCurrency(result.discountAmount || 0)}`);
        onPromoCodeChange?.(promoInput.trim().toUpperCase());
        setTimeout(() => setPromoSuccess(''), 3000);
      } else {
        setPromoError(result.message || 'Invalid promo code');
      }
    } catch (error: any) {
      setPromoError(error.message || 'Failed to apply promo code');
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removeCoupon();
      setPromoInput('');
      setPromoSuccess('');
      setPromoError('');
      onPromoCodeChange?.('');
    } catch (error) {
      console.error('Failed to remove promo code:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product.name || 'Product'}
              </p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatCurrency((item.priceAtAdd || item.product.pricing?.basePrice || item.product.price || 0) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Section */}
      {!promoCode ? (
        <div className="mb-6">
          <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code
          </label>
          <div className="flex gap-2">
            <input
              id="promo-code"
              type="text"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                setPromoError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              disabled={isLoading}
            />
            <button
              onClick={handleApplyPromo}
              disabled={isLoading || !promoInput.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
          {promoError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {promoError}
            </p>
          )}
          {promoSuccess && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {promoSuccess}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{promoCode}</span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-green-600 hover:text-green-800"
              aria-label="Remove promo code"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formatCurrency(shipping)
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-purple-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Security Badge */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure Checkout</span>
        </div>
      </div>
    </div>
  );
}

