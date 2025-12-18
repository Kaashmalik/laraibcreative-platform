'use client';

import { useState, useEffect } from 'react';

export default function TestRealAPIPage() {
  const [logs, setLogs] = useState([]);
  
  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { 
      time: new Date().toLocaleTimeString(), 
      message, 
      type,
      id: Date.now() + Math.random()
    }]);
  };

  useEffect(() => {
    const testAPI = async () => {
      addLog('🚀 Starting API test...', 'info');
      
      // Test 1: Import API client
      try {
        addLog('📦 Importing API client...', 'info');
        const { default: api } = await import('@/lib/api');
        addLog('✅ API client imported', 'success');
        
        // Test 2: Call products.getAll
        addLog('📡 Calling api.products.getAll...', 'info');
        const response = await api.products.getAll({ limit: 5 });
        addLog(`✅ Got response: ${typeof response}`, 'success');
        addLog(`📊 Response keys: ${Object.keys(response)}`, 'info');
        
        // Test 3: Check response structure
        if (response.products) {
          addLog(`📦 Found products array with ${response.products.length} items`, 'success');
          if (response.products.length > 0) {
            addLog(`👕 First product: ${response.products[0].title}`, 'info');
          }
        } else if (response.data?.products) {
          addLog(`📦 Found data.products array with ${response.data.products.length} items`, 'success');
        } else if (Array.isArray(response)) {
          addLog(`📦 Response is an array with ${response.length} items`, 'success');
        } else {
          addLog('❌ No products found in response', 'error');
          addLog(`Full response: ${JSON.stringify(response, null, 2)}`, 'error');
        }
        
        // Test 4: Test with different params
        addLog('🔄 Testing with page=1, limit=3...', 'info');
        const response2 = await api.products.getAll({ page: 1, limit: 3 });
        addLog(`✅ Second response received`, 'success');
        
      } catch (error) {
        addLog(`❌ Error: ${error.message}`, 'error');
        if (error.response) {
          addLog(`   Status: ${error.response.status}`, 'error');
          addLog(`   Data: ${JSON.stringify(error.response.data)}`, 'error');
        }
        if (error.stack) {
          addLog(`   Stack: ${error.stack.substring(0, 200)}...`, 'error');
        }
      }
    };

    testAPI();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Real API Test</h1>
      
      <div className="space-y-2 font-mono text-sm">
        {logs.map((log) => (
          <div 
            key={log.id}
            className={`p-3 rounded-lg border ${
              log.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              log.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          >
            <span className="text-gray-500 text-xs">[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
