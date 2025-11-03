"use client";

export default function OrderDetailPage({ params }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <p>Order ID: {params.id}</p>
      <p className="mt-4 text-gray-600">This page is under construction.</p>
    </div>
  );
}
