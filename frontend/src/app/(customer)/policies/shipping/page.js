"use client";

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>
      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Delivery Time</h2>
          <p className="text-gray-700">
            Standard delivery takes 5-7 business days within Pakistan. Express delivery 
            is available for an additional fee.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Shipping Charges</h2>
          <p className="text-gray-700">
            Flat rate shipping of Rs. 200 for orders under Rs. 5,000. 
            Free shipping on orders above Rs. 5,000.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tracking</h2>
          <p className="text-gray-700">
            You will receive a tracking number via email once your order ships.
          </p>
        </section>
      </div>
    </div>
  );
}