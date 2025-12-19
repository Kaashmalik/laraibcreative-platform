'use client';


/**
 * Success Confirmation Component
 * Displays order confirmation with order number and next steps
 * 
 * @module app/(customer)/custom-order/components/SuccessConfirmation
 */

import { CheckCircle, ShoppingBag, Package, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
// import Link from 'next/link'; // Unused for now

interface SuccessConfirmationProps {
  orderNumber: string;
  orderId: string;
  onContinueShopping: () => void;
  onViewOrder: () => void;
}

export default function SuccessConfirmation({
  orderNumber,
  orderId: _orderId, // Reserved for future use
  onContinueShopping,
  onViewOrder,
}: SuccessConfirmationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
          >
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your custom order. We've received your request and will contact you soon.
          </p>

          {/* Order Number */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Your Order Number</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {orderNumber}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Please save this number for tracking your order
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next?</h2>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">We'll Contact You</p>
                <p className="text-sm text-gray-600">
                  Our team will reach out within 24 hours via WhatsApp or phone to confirm details and provide a final quote.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <Package className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Order Processing</p>
                <p className="text-sm text-gray-600">
                  Once confirmed, we'll start working on your custom order. You'll receive regular updates on the progress.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <ShoppingBag className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Delivery</p>
                <p className="text-sm text-gray-600">
                  Your order will be ready in 15-20 days (or 7-10 days for rush orders). We'll notify you when it's ready for pickup or delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onViewOrder}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl min-h-[48px]"
            >
              View Order Details
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onContinueShopping}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px]"
            >
              Continue Shopping
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Need immediate assistance?
            </p>
            <a
              href="https://wa.me/923038111297?text=Hello!%20I%20have%20a%20question%20about%20my%20recent%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Contact us on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

