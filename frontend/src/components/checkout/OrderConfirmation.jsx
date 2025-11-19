'use client';

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * OrderConfirmation Component
 * Success page after order placement
 * 
 * Features:
 * - Success animation
 * - Order number display
 * - Order summary
 * - Next steps information
 * - Action buttons (Track order, Continue shopping, View orders)
 * - Print invoice option
 * - WhatsApp and Email confirmation info
 * - Celebration confetti effect (optional)
 */

export default function OrderConfirmation({ order }) {
  const router = useRouter();

  useEffect(() => {
    // Trigger confetti animation (if you have confetti library)
    // Or simple celebration animation
    console.log('Order placed successfully:', order);
  }, [order]);

  /**
   * Print invoice
   */
  const handlePrintInvoice = () => {
    window.print();
  };

  /**
   * Share on WhatsApp
   */
  const handleShareWhatsApp = () => {
    const message = `Order Placed Successfully! 🎉\n\nOrder Number: ${order.orderNumber}\nTotal: PKR ${order.total.toLocaleString()}\n\nTrack your order: ${window.location.origin}/track-order/${order.orderNumber}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Order Placed Successfully! 🎉
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Thank you for your order. We're excited to create something beautiful for you!
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Order Number */}
          <div className="text-center pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Your Order Number</p>
            <p className="text-3xl font-bold text-purple-600 font-mono">
              {order.orderNumber}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.orderNumber);
                alert('Order number copied!');
              }}
              className="mt-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              Click to copy
            </button>
          </div>

          {/* Order Summary */}
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium text-gray-900">{order.itemCount || 0}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-900">
                {order.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-purple-600">
                PKR {order.total?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          {order.paymentMethod === 'bank-transfer' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Payment Verification Pending</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    We're verifying your payment receipt. This usually takes 2-4 hours. 
                    You'll receive a confirmation once verified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            What Happens Next?
          </h2>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Order Confirmation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You'll receive order confirmation via email and WhatsApp within a few minutes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {order.paymentMethod === 'bank-transfer' ? 'Payment Verification' : 'Order Processing'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {order.paymentMethod === 'bank-transfer' 
                    ? 'Our team will verify your payment receipt (2-4 hours).'
                    : 'Your order will be prepared for processing.'
                  }
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stitching & Quality Check</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our expert tailors will start working on your order with care and precision.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delivery</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your order will be delivered to your doorstep in 5-7 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 mb-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600">
                We'll keep you updated via:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Email:</strong> {order.customerEmail}</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/>
                  </svg>
                  <span><strong>WhatsApp:</strong> {order.customerWhatsApp}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Track Order */}
          <Link
            href={`/track-order/${order.orderNumber}`}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white 
              font-semibold rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Track Order
          </Link>

          {/* Continue Shopping */}
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-purple-600 
              font-semibold rounded-xl hover:bg-purple-50 transition-all shadow-lg border-2 border-purple-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>

          {/* View All Orders */}
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 
              font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            View All Orders
          </Link>

          {/* Print Invoice */}
          <button
            onClick={handlePrintInvoice}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 
              font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
        </div>

        {/* Share Options */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Share Your Order</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg 
                hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/>
              </svg>
              Share on WhatsApp
            </button>

            <button
              onClick={() => {
                const orderUrl = `${window.location.origin}/track-order/${order.orderNumber}`;
                navigator.clipboard.writeText(orderUrl);
                alert('Order tracking link copied!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg 
                hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Tracking Link
            </button>
          </div>
        </div>

        {/* Need Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help with your order?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us
            </Link>
            <a
              href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/>
              </svg>
              WhatsApp Us
            </a>
            <Link
              href="/faq"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View FAQs
            </Link>
          </div>
        </div>

        {/* Thank You Note */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-center">
          <p className="text-lg font-medium text-gray-900">
            Thank you for choosing LaraibCreative! 💜
          </p>
          <p className="text-sm text-gray-600 mt-2">
            We're committed to turning your vision into beautiful reality with our expert craftsmanship.
          </p>
        </div>
      </div>

      {/* Print-only Invoice Section */}
      <div className="hidden print:block print:mt-8">
        <div className="max-w-4xl mx-auto p-8 bg-white">
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900">LaraibCreative</h1>
            <p className="text-gray-600 mt-2">Invoice</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
              <p className="text-sm text-gray-600">Order Number: <strong>{order.orderNumber}</strong></p>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
              <p className="text-sm text-gray-600">{order.customerName}</p>
              <p className="text-sm text-gray-600">{order.customerEmail}</p>
              <p className="text-sm text-gray-600">{order.customerPhone}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress}</p>
          </div>

          <table className="w-full mb-8">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 text-sm">Item</th>
                <th className="text-center p-2 text-sm">Qty</th>
                <th className="text-right p-2 text-sm">Price</th>
                <th className="text-right p-2 text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Order items would be mapped here */}
              <tr className="border-b">
                <td className="p-2 text-sm" colSpan="4">Items details...</td>
              </tr>
            </tbody>
          </table>

          <div className="text-right">
            <p className="text-sm mb-1">Subtotal: PKR {order.subtotal?.toLocaleString()}</p>
            <p className="text-sm mb-1">Shipping: PKR {order.shipping?.toLocaleString()}</p>
            <p className="text-lg font-bold">Total: PKR {order.total?.toLocaleString()}</p>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
            <p>Thank you for your business!</p>
            <p className="mt-1">For inquiries: laraibcreative.business@gmail.com | +92 302 0718182</p>
          </div>
        </div>
      </div>
    </div>
  );
}