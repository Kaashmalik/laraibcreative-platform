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
 * 
 * @module components/checkout/OrderConfirmation
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Clipboard, Share2, Home, ShoppingBag, MessageSquare, Printer, Copy, Mail, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

/**
 * Order confirmation data interface
 */
export interface OrderConfirmationData {
  orderNumber: string;
  total: number;
  itemCount: number;
  paymentMethod: 'bank-transfer' | 'jazzcash' | 'easypaisa' | 'cod';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsApp?: string;
  shippingAddress: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  tax?: number;
}

interface OrderConfirmationProps {
  order: OrderConfirmationData;
}

/**
 * OrderConfirmation Component
 * Displays success message and order details after order placement
 */
export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  useEffect(() => {
    // Log order confirmation for analytics
    // Order placed successfully: order
    
    // Optional: Trigger confetti animation or celebration effect
    // You can integrate a library like react-confetti here
  }, [order]);

  /**
   * Copy order number to clipboard
   */
  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast.success('Order number copied to clipboard!');
  };

  /**
   * Print invoice
   */
  const handlePrintInvoice = () => {
    window.print();
  };

  /**
   * Share order on WhatsApp
   */
  const handleShareWhatsApp = () => {
    const message = `Order Placed Successfully! 🎉\n\nOrder Number: ${order.orderNumber}\nTotal: PKR ${order.total.toLocaleString()}\n\nTrack your order: ${window.location.origin}/track-order/${order.orderNumber}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  /**
   * Copy tracking link to clipboard
   */
  const handleCopyTrackingLink = () => {
    const orderUrl = `${window.location.origin}/track-order/${order.orderNumber}`;
    navigator.clipboard.writeText(orderUrl);
    toast.success('Tracking link copied to clipboard!');
  };

  /**
   * Format payment method name
   */
  const formatPaymentMethod = (method: string): string => {
    const methods: Record<string, string> = {
      'bank-transfer': 'Bank Transfer',
      'jazzcash': 'JazzCash',
      'easypaisa': 'Easypaisa',
      'cod': 'Cash on Delivery',
    };
    return methods[method] || method;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
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
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold text-purple-600 font-mono">
                {order.orderNumber}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyOrderNumber}
                className="text-gray-500 hover:text-purple-600"
                aria-label="Copy order number"
              >
                <Clipboard className="w-5 h-5" />
              </Button>
            </div>
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
                {formatPaymentMethod(order.paymentMethod)}
              </span>
            </div>

            {order.subtotal && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  PKR {order.subtotal.toLocaleString()}
                </span>
              </div>
            )}

            {order.shipping !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-gray-900">
                  PKR {order.shipping.toLocaleString()}
                </span>
              </div>
            )}

            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount:</span>
                <span className="font-medium">
                  - PKR {order.discount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-purple-600">
                PKR {order.total?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          {['bank-transfer', 'jazzcash', 'easypaisa'].includes(order.paymentMethod) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <HelpCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
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
            <MessageSquare className="w-6 h-6 text-purple-600" />
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
                  {['bank-transfer', 'jazzcash', 'easypaisa'].includes(order.paymentMethod) 
                    ? 'Payment Verification' 
                    : 'Order Processing'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {['bank-transfer', 'jazzcash', 'easypaisa'].includes(order.paymentMethod)
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
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-3">
                We'll keep you updated via:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Email:</strong> {order.customerEmail}</span>
                </li>
                {order.customerWhatsApp && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span><strong>WhatsApp:</strong> {order.customerWhatsApp}</span>
                  </li>
                )}
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
            <ShoppingBag className="w-5 h-5" />
            Track Order
          </Link>

          {/* Continue Shopping */}
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-purple-600 
              font-semibold rounded-xl hover:bg-purple-50 transition-all shadow-lg border-2 border-purple-600"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>

          {/* View All Orders */}
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 
              font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            View All Orders
          </Link>

          {/* Print Invoice */}
          <Button
            onClick={handlePrintInvoice}
            variant="outline"
            className="flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl"
          >
            <Printer className="w-5 h-5" />
            Print Invoice
          </Button>
        </div>

        {/* Share Options */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Share Your Order</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleShareWhatsApp}
              variant="outline"
              className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 border-green-500"
            >
              <MessageSquare className="w-5 h-5" />
              Share on WhatsApp
            </Button>

            <Button
              onClick={handleCopyTrackingLink}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy Tracking Link
            </Button>
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
              <Mail className="w-5 h-5" />
              Email Us
            </Link>
            <a
              href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-5 h-5" />
              WhatsApp Us
            </a>
            <Link
              href="/faq"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-5 h-5" />
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
              <p className="text-sm text-gray-600">Payment: {formatPaymentMethod(order.paymentMethod)}</p>
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

          <div className="text-right mb-8">
            {order.subtotal && (
              <p className="text-sm mb-1">Subtotal: PKR {order.subtotal.toLocaleString()}</p>
            )}
            {order.shipping !== undefined && (
              <p className="text-sm mb-1">Shipping: PKR {order.shipping.toLocaleString()}</p>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <p className="text-sm mb-1 text-green-600">Discount: - PKR {order.discount.toLocaleString()}</p>
            )}
            <p className="text-lg font-bold">Total: PKR {order.total.toLocaleString()}</p>
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

