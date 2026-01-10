'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import type { CartItem } from '@/types/cart'
import type { CheckoutData } from '@/app/actions/orders'

interface ReviewStepProps {
  data: Partial<CheckoutData>
  items: CartItem[]
  onPlaceOrder: () => void
  onBack: () => void
  isSubmitting: boolean
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  card: 'Credit/Debit Card',
}

export function ReviewStep({ data, items, onPlaceOrder, onBack, isSubmitting }: ReviewStepProps) {
  const shippingFee = 200 // Will be calculated based on city
  const codFee = data.paymentMethod === 'cod' && (data.subtotal || 0) < 5000 ? 100 : 0
  const total = (data.subtotal || 0) + (data.stitchingFee || 0) + shippingFee + codFee - (data.discountAmount || 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
        Review Your Order
      </h2>

      {/* Order Items */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800">Order Items ({items.length})</h3>
        </div>
        <div className="divide-y divide-neutral-100">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-neutral-100">
                {item.product.image && (
                  <Image
                    src={item.product.image}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-neutral-800 line-clamp-1">
                  {item.product.title}
                </h4>
                <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                {item.customizations?.isStitched && (
                  <span className="inline-block mt-1 text-xs bg-primary-rose/20 text-primary-rose-dark px-2 py-0.5 rounded">
                    Stitched
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-800">
                  PKR {((item.product.pricing?.comparePrice || item.product.price || 0) * item.quantity).toLocaleString()}
                </p>
                {item.customizations?.isStitched && item.product.pricing?.customStitchingCharge && (
                  <p className="text-sm text-neutral-500">
                    +PKR {(item.product.pricing.customStitchingCharge * item.quantity).toLocaleString()} stitching
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800">Shipping Address</h3>
        </div>
        <div className="p-4">
          <p className="font-medium text-neutral-800">{data.shippingAddress?.full_name}</p>
          <p className="text-neutral-600">{data.shippingAddress?.address_line1}</p>
          {data.shippingAddress?.address_line2 && (
            <p className="text-neutral-600">{data.shippingAddress.address_line2}</p>
          )}
          <p className="text-neutral-600">
            {data.shippingAddress?.city}
            {data.shippingAddress?.postal_code && `, ${data.shippingAddress.postal_code}`}
          </p>
          <p className="text-neutral-500 mt-2">{data.phone}</p>
          <p className="text-neutral-500">{data.email}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800">Payment Method</h3>
        </div>
        <div className="p-4">
          <p className="text-neutral-800">{PAYMENT_LABELS[data.paymentMethod || 'cod']}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800">Order Summary</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>PKR {data.subtotal?.toLocaleString()}</span>
          </div>
          
          {(data.stitchingFee || 0) > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Stitching</span>
              <span>PKR {data.stitchingFee?.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span>PKR {shippingFee.toLocaleString()}</span>
          </div>
          
          {codFee > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>COD Fee</span>
              <span>PKR {codFee.toLocaleString()}</span>
            </div>
          )}
          
          {(data.discountAmount || 0) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({data.discountCode})</span>
              <span>-PKR {data.discountAmount?.toLocaleString()}</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-neutral-200 flex justify-between text-lg font-bold text-neutral-800">
            <span>Total</span>
            <span className="text-primary-gold">PKR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <p className="text-sm text-neutral-500 text-center">
        By placing this order, you agree to our{' '}
        <a href="/terms" className="text-primary-gold hover:underline">Terms & Conditions</a>
        {' '}and{' '}
        <a href="/privacy" className="text-primary-gold hover:underline">Privacy Policy</a>
      </p>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-4 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-primary-gold text-white font-semibold rounded-xl hover:bg-primary-gold-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Place Order - PKR ${total.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  )
}

export default ReviewStep
