'use client';

/**
 * CartSummary Component - Production Ready
 * Order summary with pricing breakdown, promo code, and checkout CTA
 * 
 * @module components/cart/CartSummary
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Tag, ShoppingBag, TrendingUp, Lock } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * CartSummary Component
 */
export default function CartSummary() {
  const router = useRouter();
  const {
    items,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
    calculateShipping,
    isLoading,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const FREE_SHIPPING_THRESHOLD = 5000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasDiscount = discount > 0;

  // Format price
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Handle coupon application
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const result = await applyPromoCode(couponCode.trim().toUpperCase());
      
      if (result.success) {
        setCouponSuccess(result.message || `Coupon applied! You saved ${formatPrice(result.discount)}`);
        setCouponCode('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setCouponSuccess(''), 3000);
      } else {
        setCouponError(result.message || 'Invalid coupon code');
      }
    } catch (error: any) {
      setCouponError(error.message || 'Failed to apply coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  }, [couponCode, applyPromoCode, formatPrice]);

  // Handle coupon removal
  const handleRemoveCoupon = useCallback(() => {
    removePromoCode();
    setCouponSuccess('');
    setCouponError('');
  }, [removePromoCode]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (items.length === 0) return;
    router.push('/checkout');
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <ShoppingBag className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Summary</h2>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4 mb-6">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* Discount */}
          {hasDiscount && promoCode && (
            <div className="flex justify-between items-start py-3 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Discount Applied
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">
                  Code: <span className="font-mono font-semibold">{promoCode}</span>
                </p>
                <p className="text-base font-semibold text-green-800 dark:text-green-300">
                  - {formatPrice(discount)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Remove coupon"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              {remainingForFreeShipping > 0 && remainingForFreeShipping <= FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                  Add {formatPrice(remainingForFreeShipping)} for free shipping
                </p>
              )}
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {shipping === 0 ? (
                <span className="text-green-600 dark:text-green-400">FREE</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>

          {/* Tax */}
          {tax > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatPrice(tax)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Coupon Code Section */}
        {!hasDiscount && (
          <div className="mb-6">
            <label htmlFor="coupon-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <Input
                id="coupon-input"
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Enter code"
                disabled={isApplying || isLoading}
                className="flex-1 uppercase"
                maxLength={20}
                aria-label="Coupon code"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isApplying || isLoading || !couponCode.trim()}
                className="min-w-[80px]"
                aria-label="Apply coupon"
              >
                {isApplying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>

            {/* Coupon Messages */}
            {couponError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">{couponSuccess}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0 || isLoading}
            className="w-full text-base font-semibold min-h-[48px]"
            aria-label="Proceed to checkout"
          >
            Proceed to Checkout
          </Button>

          <Link href="/products" className="block">
            <Button
              variant="outline"
              className="w-full text-base min-h-[48px]"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}

