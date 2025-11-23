"use client";

/**
 * CartSummary Component
 * Order summary sidebar with pricing breakdown, coupon application, and checkout action
 * @location src/app/(customer)/cart/components/CartSummary.jsx
 */



import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Tag, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/formatters';

const CartSummary = () => {
  const router = useRouter();
  const { items, subtotal, discount, shippingCost, total, applyCoupon, removeCoupon, appliedCoupon } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const FREE_SHIPPING_THRESHOLD = 5000;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const hasDiscount = discount > 0;

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const result = await applyCoupon(couponCode.trim().toUpperCase());
      
      if (result.success) {
        setCouponSuccess(`Coupon applied! You saved ${formatCurrency(result.discountAmount)}`);
        setCouponCode('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setCouponSuccess(''), 3000);
      } else {
        setCouponError(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon. Please try again.');
      console.error('Coupon application error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponSuccess('');
      setCouponError('');
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <Card className="p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <ShoppingBag className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4 mb-6">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Discount Section */}
          {hasDiscount && appliedCoupon && (
            <div className="flex justify-between items-start py-3 px-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Discount Applied
                  </span>
                </div>
                <p className="text-xs text-green-700 mb-1">
                  Code: <Badge variant="success" className="text-xs">{appliedCoupon}</Badge>
                </p>
                <p className="text-base font-semibold text-green-800">
                  - {formatCurrency(discount)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded transition-colors"
                aria-label="Remove coupon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-600">Shipping</span>
              {remainingForFreeShipping > 0 && remainingForFreeShipping <= FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Add {formatCurrency(remainingForFreeShipping)} for free shipping
                </p>
              )}
            </div>
            <span className="font-semibold text-gray-900">
              {shippingCost === 0 ? (
                <Badge variant="success">FREE</Badge>
              ) : (
                formatCurrency(shippingCost)
              )}
            </span>
          </div>

          {/* Free Shipping Info */}
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <Alert variant="info" className="text-xs">
              <p>Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}</p>
            </Alert>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Coupon Code Section */}
        {!hasDiscount && (
          <div className="mb-6">
            <label htmlFor="coupon-input" className="block text-sm font-medium text-gray-700 mb-2">
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
                disabled={isApplying}
                className="flex-1 uppercase"
                maxLength={20}
                aria-label="Coupon code"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
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
              <Alert variant="error" className="mt-2 text-sm">
                {couponError}
              </Alert>
            )}
            {couponSuccess && (
              <Alert variant="success" className="mt-2 text-sm">
                {couponSuccess}
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0}
            size="lg"
            className="w-full text-base font-semibold"
            aria-label="Proceed to checkout"
          >
            Proceed to Checkout
          </Button>

          <Link href="/products" className="block">
            <Button
              variant="outline"
              size="lg"
              className="w-full text-base"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure Checkout</span>
          </div>
        </div>
      </Card>

      {/* Mobile Fixed Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-xl font-bold text-primary-600">
            {formatCurrency(total)}
          </span>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={items.length === 0}
          size="lg"
          className="w-full"
        >
          Proceed to Checkout
        </Button>
      </div>
    </aside>
  );
};

export default CartSummary;