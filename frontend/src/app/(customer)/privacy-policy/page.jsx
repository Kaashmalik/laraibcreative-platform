'use client';

import { Lock, User, Mail, Shield, Server, Info } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Lock className="w-12 h-12 text-pink-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-lg text-gray-600">
              Your privacy is important to us.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Section 1: Introduction */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <p className="text-gray-700">
                This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from LaraibCreative.
              </p>
            </div>

            {/* Section 2: Personal Information We Collect */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <User className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Personal Information We Collect</h2>
              </div>
              <p className="text-gray-700">
                When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
              </p>
            </div>

            {/* Section 3: How We Use Your Personal Information */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Mail className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Personal Information</h2>
              </div>
              <p className="text-gray-700">
                We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
              </p>
            </div>

            {/* Section 4: Sharing Your Personal Information */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Sharing Your Personal Information</h2>
              </div>
              <p className="text-gray-700">
                We share your Personal Information with third parties to help us use your Personal Information, as described above.
              </p>
            </div>

            {/* Section 5: Data Retention */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Server className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Data Retention</h2>
              </div>
              <p className="text-gray-700">
                When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
              </p>
            </div>

            {/* Section 6: Changes */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Info className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Changes</h2>
              </div>
              <p className="text-gray-700">
                We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
