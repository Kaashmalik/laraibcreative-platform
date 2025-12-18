'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function TestAPIPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPI() {
      try {
        console.log('Testing API connection...');
        const response = await api.products.getAll({ limit: 3 });
        console.log('API Response:', response);
        setData(response);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    testAPI();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Success!</h2>
          <p>Total Products: {data.total}</p>
          <p>Products Returned: {data.products?.length || 0}</p>
          {data.products && data.products.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">First Product:</h3>
              <pre className="bg-white p-2 rounded mt-2 text-xs overflow-auto">
                {JSON.stringify(data.products[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
