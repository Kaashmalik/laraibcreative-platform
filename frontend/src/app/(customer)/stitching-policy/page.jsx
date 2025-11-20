'use client';

import { Scissors, Ruler, Package, MessageCircle } from 'lucide-react';

export default function StitchingPolicyPage() {
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Scissors className="w-12 h-12 text-pink-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Stitching Policy</h1>
            <p className="mt-4 text-lg text-gray-600">
              Our commitment to quality and precision.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Section 1: Our Process */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Ruler className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Our Stitching Process</h2>
              </div>
              <p className="text-gray-700">
                We take great care in stitching your outfits to your exact specifications. Our process involves a detailed review of your measurements and any special requests you may have.
              </p>
            </div>

            {/* Section 2: Measurement Accuracy */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Package className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Measurement Accuracy</h2>
              </div>
              <p className="text-gray-700">
                We are not responsible for any inaccuracies in measurements provided by the customer. We will stitch the outfit according to the exact measurements provided.
              </p>
            </div>

            {/* Section 3: Alterations */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Alterations</h2>
              </div>
              <p className="text-gray-700">
                If you require any alterations after receiving your outfit, please contact us. We offer one free alteration within 7 days of delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
