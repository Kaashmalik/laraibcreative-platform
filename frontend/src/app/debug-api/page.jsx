'use client';

import { useEffect, useState } from 'react';

export default function DebugAPIPage() {
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  useEffect(() => {
    const debugSteps = async () => {
      addLog('🔍 Starting API debug...', 'info');
      
      // Step 1: Check environment variables
      addLog(`📍 API_BASE_URL: ${process.env.NEXT_PUBLIC_API_URL}`, 'info');
      
      // Step 2: Test direct fetch
      try {
        addLog('🌐 Testing direct fetch to backend...', 'info');
        const response = await fetch('http://localhost:5000/api/v1/products?limit=3');
        const data = await response.json();
        addLog(`✅ Direct fetch success: ${JSON.stringify(data).substring(0, 100)}...`, 'success');
      } catch (error) {
        addLog(`❌ Direct fetch failed: ${error.message}`, 'error');
      }
      
      // Step 3: Test axios through api client
      try {
        addLog('📡 Testing through api.products.getAll...', 'info');
        const api = (await import('@/lib/api')).default;
        const response = await api.products.getAll({ limit: 3 });
        addLog(`✅ API client success: ${JSON.stringify(response).substring(0, 100)}...`, 'success');
      } catch (error) {
        addLog(`❌ API client failed: ${error.message}`, 'error');
        if (error.response) {
          addLog(`   Response status: ${error.response.status}`, 'error');
          addLog(`   Response data: ${JSON.stringify(error.response.data)}`, 'error');
        }
      }
      
      // Step 4: Check if ProductsClient component works
      try {
        addLog('🧩 Testing ProductsClient component...', 'info');
        const ProductsClient = (await import('@/app/(customer)/products/ProductsClient')).default;
        addLog('✅ ProductsClient imported successfully', 'success');
      } catch (error) {
        addLog(`❌ ProductsClient import failed: ${error.message}`, 'error');
      }
    };

    debugSteps();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 API Debug Console</h1>
      
      <div className="space-y-2 font-mono text-sm">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`p-3 rounded ${
              log.type === 'error' ? 'bg-red-100 text-red-800' :
              log.type === 'success' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            <span className="text-gray-500">[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
