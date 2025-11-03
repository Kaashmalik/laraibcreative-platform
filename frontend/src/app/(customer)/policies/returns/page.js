"use client";

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Return & Exchange Policy</h1>
      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Return Window</h2>
          <p className="text-gray-700">
            You may return items within 7 days of delivery for a full refund or exchange.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Conditions</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Items must be unused and in original condition</li>
            <li>Original tags must be attached</li>
            <li>Custom-made items cannot be returned</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Process</h2>
          <p className="text-gray-700">
            Contact our customer service team to initiate a return. We will provide 
            instructions for shipping the item back to us.
          </p>
        </section>
      </div>
    </div>
  );
}