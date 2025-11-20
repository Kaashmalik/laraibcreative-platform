'use client';

import { Shield, Truck, Clock, Package, HelpCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Shield className="w-12 h-12 text-pink-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Shipping Policy</h1>
            <p className="mt-4 text-lg text-gray-600">
              Your guide to our shipping process, timelines, and charges.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Section 1: Processing Time */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Order Processing</h2>
              </div>
              <p className="text-gray-700">
                All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
              </p>
            </div>

            {/* Section 2: Shipping Rates & Delivery Estimates */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Truck className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Shipping Rates & Delivery</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Shipping charges for your order will be calculated and displayed at checkout.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Standard Shipping (3-5 business days): Rs. 250</li>
                <li>Express Shipping (1-2 business days): Rs. 500</li>
              </ul>
            </div>

            {/* Section 3: Shipment Confirmation & Order Tracking */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Package className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Order Tracking</h2>
              </div>
              <p className="text-gray-700">
                You will receive a shipment confirmation email once your order has shipped, containing your tracking number(s). The tracking number will be active within 24 hours.
              </p>
            </div>

            {/* Section 4: Contact Us */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <HelpCircle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700">
                If you have any questions about our Shipping Policy, please contact us at:
              </p>
              <a href="mailto:support@laraibcreative.studio" className="text-pink-600 hover:underline">
                support@laraibcreative.studio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
