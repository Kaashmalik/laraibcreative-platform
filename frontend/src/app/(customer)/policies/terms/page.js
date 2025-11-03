"use client";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
      <div className="prose prose-lg">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Use of Website</h2>
          <p className="text-gray-700">
            By accessing and using this website, you accept and agree to be bound by 
            the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
          <p className="text-gray-700">
            We strive to provide accurate product descriptions and images. However, 
            colors may vary slightly due to screen settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
          <p className="text-gray-700">
            All prices are in Pakistani Rupees (PKR) and are subject to change without notice.
          </p>
        </section>
      </div>
    </div>
  );
}