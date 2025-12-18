'use client';

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API...');
        
        // Test 1: Direct fetch
        console.log('1. Testing direct fetch...');
        const directResponse = await fetch('http://localhost:5000/api/v1/products?limit=5');
        const directData = await directResponse.json();
        console.log('Direct fetch result:', directData);
        
        // Test 2: Through API client
        console.log('2. Testing through API client...');
        const { default: api } = await import('@/lib/api');
        const apiResponse = await api.products.getAll({ limit: 5 });
        console.log('API client result:', apiResponse);
        
        setData({
          direct: directData,
          api: apiResponse
        });
      } catch (err) {
        console.error('Test failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  
  if (error) return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error: {error}</h1>
      <p>Check browser console for more details.</p>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">API Test Results</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Direct Fetch Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.direct, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">API Client Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.api, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
