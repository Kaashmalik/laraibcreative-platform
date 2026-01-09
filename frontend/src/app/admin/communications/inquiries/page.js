export const dynamic = 'force-dynamic';
"use client";

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch inquiries
    setLoading(false);
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customer Inquiries</h1>
      <DataTable columns={columns} data={inquiries} loading={loading} />
    </div>
  );
}