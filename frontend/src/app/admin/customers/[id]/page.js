"use client";

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';

export default function CustomerDetailPage() {
  const params = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customer Details #{params.id}</h1>
      <p className="text-gray-600">View customer information and order history</p>
    </div>
  );
}