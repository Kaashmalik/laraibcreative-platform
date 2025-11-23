'use client';

import { useState } from 'react';

/**
 * OrderReview Component
 * Step 4 of checkout - Review complete order before submission
 * 
 * Features:
 * - Display all order details
 * - Customer information summary
 * - Shipping address summary
 * - Payment method summary
 * - Cart items with images
 * - Price breakdown
 * - Terms and conditions checkbox
 * - Edit options for each section
 * - Place order submission
 */

export default function OrderReview({ formData, updateFormData, onBack, onSubmit, isSubmitting, cartData, errors: propErrors = {} }) {
  const [errors, setErrors] = useState(propErrors);

  /**
   * Handle terms checkbox change
   */
  const handleTermsChange = (e) => {
    updateFormData('termsAccepted', e.target.checked);
    if (errors.terms) {
      setErrors({});
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate terms acceptance
    if (!formData.termsAccepted) {
      setErrors({ terms: 'You must accept the terms and conditions' });
      return;
    }

    // Submit order
    onSubmit();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
        <p className="mt-2 text-gray-600">
          Please review all details before placing your order
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="text-gray-600 w-32">Name:</span>
              <span className="font-medium text-gray-900">{formData.customerInfo.fullName}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Email:</span>
              <span className="font-medium text-gray-900">{formData.customerInfo.email}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Phone:</span>
              <span className="font-medium text-gray-900">{formData.customerInfo.phone}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">WhatsApp:</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                {formData.customerInfo.whatsapp}
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Shipping Address
            </h3>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{formData.shippingAddress.fullAddress}</p>
            <p className="text-gray-600 mt-1">
              {formData.shippingAddress.city.charAt(0).toUpperCase() + formData.shippingAddress.city.slice(1)}, 
              {' '}{formData.shippingAddress.province.charAt(0).toUpperCase() + formData.shippingAddress.province.slice(1)}
              {' '}- {formData.shippingAddress.postalCode}
            </p>
            {formData.shippingAddress.deliveryInstructions && (
              <p className="text-gray-600 mt-2 italic">
                <span className="font-medium">Note:</span> {formData.shippingAddress.deliveryInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Method
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium text-gray-900">
                {formData.payment.method === 'bank-transfer' ? 'Bank Transfer / Mobile Payment' : 'Cash on Delivery'}
              </span>
            </div>
            
            {formData.payment.method === 'bank-transfer' && (
              <>
                {formData.payment.receiptPreview && (
                  <div>
                    <p className="text-gray-600 mb-2">Receipt:</p>
                    <img 
                      src={formData.payment.receiptPreview} 
                      alt="Payment receipt" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <div className="flex">
                  <span className="text-gray-600 w-32">Transaction ID:</span>
                  <span className="font-medium text-gray-900">{formData.payment.transactionId}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Transaction Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(formData.payment.transactionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Your order will be processed after payment verification (usually within 2-4 hours)</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Order Items ({cartData.items.length})
          </h3>
          
          <div className="space-y-4">
            {cartData.items.map((item, index) => (
              <div key={index} className="flex gap-4 p-3 bg-white rounded-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  {item.isCustom && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      Custom Order
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">PKR {item.price.toLocaleString()} each</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">PKR {cartData.subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Charges</span>
              <span className="font-medium text-gray-900">
                {cartData.shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `PKR ${cartData.shipping.toLocaleString()}`
                )}
              </span>
            </div>
            
            {cartData.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-PKR {cartData.discount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t border-purple-200 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-purple-600">PKR {cartData.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted}
              onChange={handleTermsChange}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded 
                focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex-1">
              <span className="font-medium">I accept the </span>
              <a href="/policies/terms" target="_blank" className="text-purple-600 hover:underline">
                Terms & Conditions
              </a>
              <span className="font-medium"> and </span>
              <a href="/policies/returns" target="_blank" className="text-purple-600 hover:underline">
                Return Policy
              </a>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-2 ml-8 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.terms}
            </p>
          )}
        </div>

        {/* Important Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">What happens next?</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>You'll receive an order confirmation email and WhatsApp message</li>
                <li>We'll verify your payment (for bank transfers)</li>
                <li>Your order will be processed and you'll get regular updates</li>
                <li>Track your order anytime from your account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg
              hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white 
              font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 
              focus:ring-4 focus:ring-purple-300 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Placing Order...
              </>
            ) : (
              <>
                Place Order
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}