// =============================================================================
// SHIPPING POLICY PAGE
// File: app/(customer)/policies/shipping/page.js
// =============================================================================

import React from 'react';
import { Truck, Package, MapPin, Clock, DollarSign } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Delivery Policy | LaraibCreative',
  description: 'Learn about our shipping policy, delivery times, charges, and coverage areas across Pakistan.',
};

const ShippingPolicyPage = () => {
  const deliveryZones = [
    { zone: 'Lahore (City)', time: '2-3 days', charge: 'Rs. 200' },
    { zone: 'Major Cities (Karachi, Islamabad, Rawalpindi, Faisalabad)', time: '3-5 days', charge: 'Rs. 250' },
    { zone: 'Other Cities', time: '4-7 days', charge: 'Rs. 300-400' },
    { zone: 'Remote Areas', time: '7-10 days', charge: 'Rs. 500+' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-pink-600 transition">Home</a>
            <span>/</span>
            <a href="/policies" className="hover:text-pink-600 transition">Policies</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shipping</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4 text-pink-600" />
          <h1 className="text-4xl font-bold mb-4">Shipping & Delivery Policy</h1>
          <p className="text-gray-600">Last Updated: October 15, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Delivery Coverage */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-pink-600" />
              Delivery Coverage
            </h2>
            <p className="text-gray-700 mb-6">
              We deliver across Pakistan to all major cities and most towns. Our courier partners 
              ensure safe and timely delivery to your doorstep.
            </p>
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Delivery Zone</th>
                    <th className="px-6 py-3 text-left font-semibold">Time</th>
                    <th className="px-6 py-3 text-left font-semibold">Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-6 py-4">{zone.zone}</td>
                      <td className="px-6 py-4">{zone.time}</td>
                      <td className="px-6 py-4 font-semibold text-pink-600">{zone.charge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Processing Time */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-pink-600" />
              Processing & Delivery Time
            </h2>
            <div className="space-y-4">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <h3 className="font-bold mb-2">Order Processing</h3>
                <p className="text-gray-700">
                  Custom stitching orders take <strong>10-14 working days</strong> from payment 
                  confirmation. Rush orders (7 days) available for additional Rs. 1,000.
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold mb-2">Dispatch Time</h3>
                <p className="text-gray-700">
                  Orders are dispatched within <strong>1-2 business days</strong> after completion. 
                  You&apos;ll receive tracking details via WhatsApp and email.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold mb-2">Total Timeline</h3>
                <p className="text-gray-700">
                  Standard orders: <strong>12-21 days</strong> (processing + delivery)<br/>
                  Rush orders: <strong>9-14 days</strong> (processing + delivery)
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Charges */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-pink-600" />
              Shipping Charges & Free Delivery
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span><strong>Within Lahore:</strong> Rs. 200 flat rate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span><strong>Major Cities:</strong> Rs. 250 via TCS/Leopards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span><strong>Other Areas:</strong> Rs. 300-500 depending on location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1 font-bold">✓</span>
                <span><strong>FREE SHIPPING</strong> on orders above Rs. 5,000</span>
              </li>
            </ul>
          </div>

          {/* Order Tracking */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-pink-600" />
              Order Tracking
            </h2>
            <p className="text-gray-700 mb-4">
              Track your order every step of the way:
            </p>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <span><strong>Order Placed:</strong> Confirmation email & WhatsApp sent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <span><strong>Payment Verified:</strong> Stitching begins</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <span><strong>In Progress:</strong> Regular updates on status</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                <span><strong>Ready for Dispatch:</strong> Quality check completed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                <span><strong>Dispatched:</strong> Tracking number provided</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
                <span><strong>Delivered:</strong> Enjoy your order!</span>
              </li>
            </ol>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Delivery times are estimates and may vary during peak seasons or public holidays</li>
              <li>• Customer must be available to receive the order. Courier will attempt 2-3 times</li>
              <li>• Inspect your order upon delivery. Report any damage within 24 hours</li>
              <li>• We&apos;re not responsible for delays caused by courier or incorrect address</li>
              <li>• International shipping not available currently</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ShippingPolicyPage;