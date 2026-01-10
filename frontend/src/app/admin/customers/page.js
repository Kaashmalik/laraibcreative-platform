"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch customers
    setLoading(false);
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'orders', label: 'Orders' },
    { key: 'joined', label: 'Joined' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <DataTable columns={columns} data={customers} loading={loading} />
    </div>
  );
}