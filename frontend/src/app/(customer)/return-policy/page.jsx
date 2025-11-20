'use client';

import { Gift, RefreshCw, MessageSquare, CheckSquare, XSquare } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Gift className="w-12 h-12 text-pink-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Return & Exchange Policy</h1>
            <p className="mt-4 text-lg text-gray-600">
              Our commitment to your satisfaction.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Section 1: Our Promise */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <RefreshCw className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">7-Day Exchange Policy</h2>
              </div>
              <p className="text-gray-700">
                We offer a 7-day exchange policy for items that are defective, damaged, or incorrect. If you are not satisfied with your purchase, please contact us within 7 days of receiving your order.
              </p>
            </div>

            {/* Section 2: Conditions for Exchange */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <CheckSquare className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Conditions for Exchange</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>The item must be unused and in the same condition that you received it.</li>
                <li>It must be in the original packaging.</li>
                <li>A receipt or proof of purchase is required.</li>
              </ul>
            </div>

            {/* Section 3: Non-Exchangeable Items */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <XSquare className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Non-Exchangeable Items</h2>
              </div>
              <p className="text-gray-700">
                Unfortunately, we cannot accept returns on sale items or gift cards.
              </p>
            </div>

            {/* Section 4: How to Initiate an Exchange */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">How to Initiate an Exchange</h2>
              </div>
              <p className="text-gray-700">
                To initiate an exchange, please contact our customer service team at:
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
