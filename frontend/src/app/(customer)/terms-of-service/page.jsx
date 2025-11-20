'use client';

import { FileText, UserCheck, XCircle, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <FileText className="w-12 h-12 text-pink-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-4 text-lg text-gray-600">
              Please read these terms and conditions carefully before using Our Service.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Section 1: Interpretation and Definitions */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Interpretation and Definitions</h2>
              <p className="text-gray-700">
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>
            </div>

            {/* Section 2: Acknowledgment */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">2. Acknowledgment</h2>
              </div>
              <p className="text-gray-700">
                These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
              </p>
            </div>

            {/* Section 3: Termination */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <XCircle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">3. Termination</h2>
              </div>
              <p className="text-gray-700">
                We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
              </p>
            </div>

            {/* Section 4: Limitation of Liability */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">4. Limitation of Liability</h2>
              </div>
              <p className="text-gray-700">
                To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
