'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestAllPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  const updateResult = (test, status, message, data = null) => {
    setResults(prev => ({
      ...prev,
      [test]: { status, message, data, timestamp: new Date().toLocaleTimeString() }
    }));
  };

  useEffect(() => {
    const runAllTests = async () => {
      // Test 1: Backend API Connection
      try {
        updateResult('api-connection', 'loading', 'Testing backend API connection...');
        const response = await fetch('http://localhost:5000/api/v1/products?limit=3');
        const data = await response.json();
        if (response.ok && data.products) {
          updateResult('api-connection', 'success', `Connected! Found ${data.products.length} products`, data);
        } else {
          updateResult('api-connection', 'error', `API error: ${response.status}`);
        }
      } catch (error) {
        updateResult('api-connection', 'error', `Connection failed: ${error.message}`);
      }

      // Test 2: Frontend API Client
      try {
        updateResult('frontend-api', 'loading', 'Testing frontend API client...');
        const { default: api } = await import('@/lib/api');
        const response = await api.products.getAll({ limit: 3 });
        if (response && response.products) {
          updateResult('frontend-api', 'success', `API client works! Found ${response.products.length} products`, response);
        } else {
          updateResult('frontend-api', 'error', 'API client returned unexpected format');
        }
      } catch (error) {
        updateResult('frontend-api', 'error', `API client failed: ${error.message}`);
      }

      // Test 3: Category Filters
      try {
        updateResult('category-filters', 'loading', 'Testing category filters...');
        const { default: api } = await import('@/lib/api');
        const response = await api.products.getAll({ 
          category: 'party-formal-wear', 
          limit: 5 
        });
        if (response && response.products) {
          updateResult('category-filters', 'success', `Category filter works! Found ${response.products.length} party wear items`, response);
        } else {
          updateResult('category-filters', 'error', 'Category filter failed');
        }
      } catch (error) {
        updateResult('category-filters', 'error', `Category filter error: ${error.message}`);
      }

      // Test 4: Product Images
      try {
        updateResult('product-images', 'loading', 'Testing product images...');
        const { default: api } = await import('@/lib/api');
        const response = await api.products.getAll({ limit: 1 });
        if (response && response.products && response.products[0]) {
          const product = response.products[0];
          const hasImages = product.primaryImage || (product.images && product.images.length > 0);
          if (hasImages) {
            updateResult('product-images', 'success', `Product has images: ${product.title}`, product);
          } else {
            updateResult('product-images', 'warning', 'Product found but no images');
          }
        } else {
          updateResult('product-images', 'error', 'No products found to test images');
        }
      } catch (error) {
        updateResult('product-images', 'error', `Image test error: ${error.message}`);
      }

      // Test 5: Featured Products
      try {
        updateResult('featured-products', 'loading', 'Testing featured products endpoint...');
        const { default: api } = await import('@/lib/api');
        const response = await api.products.getFeatured(5);
        if (response && response.products) {
          updateResult('featured-products', 'success', `Featured products: ${response.products.length} items`, response);
        } else if (response && response.data) {
          updateResult('featured-products', 'success', `Featured products: ${response.data.length} items`, response);
        } else {
          updateResult('featured-products', 'warning', 'Featured products returned empty or unexpected format');
        }
      } catch (error) {
        updateResult('featured-products', 'error', `Featured products error: ${error.message}`);
      }

      // Test 6: Environment Variables
      try {
        updateResult('env-vars', 'loading', 'Checking environment variables...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          updateResult('env-vars', 'success', `API URL configured: ${apiUrl}`, { apiUrl });
        } else {
          updateResult('env-vars', 'error', 'NEXT_PUBLIC_API_URL not configured');
        }
      } catch (error) {
        updateResult('env-vars', 'error', `Env check error: ${error.message}`);
      }

      setLoading(false);
    };

    runAllTests();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'loading':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const tests = [
    { key: 'api-connection', name: 'Backend API Connection' },
    { key: 'frontend-api', name: 'Frontend API Client' },
    { key: 'category-filters', name: 'Category Filters' },
    { key: 'product-images', name: 'Product Images' },
    { key: 'featured-products', name: 'Featured Products' },
    { key: 'env-vars', name: 'Environment Variables' }
  ];

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">🧪 Complete System Test</h1>
        <p className="text-gray-600 text-lg">Testing all functionality end-to-end</p>
      </div>

      {/* Test Results */}
      <div className="space-y-4 mb-8">
        {tests.map(({ key, name }) => {
          const result = results[key];
          return (
            <div
              key={key}
              className={`p-4 rounded-lg border ${getStatusColor(result?.status || 'pending')}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getStatusIcon(result?.status)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <p className="text-sm mt-1">{result?.message || 'Pending...'}</p>
                    {result?.timestamp && (
                      <p className="text-xs mt-2 opacity-75">Tested at: {result.timestamp}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔗 Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/" className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="font-medium">🏠 Homepage</div>
            <div className="text-sm text-gray-600">View product slider</div>
          </Link>
          <Link href="/products" className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="font-medium">🛍️ All Products</div>
            <div className="text-sm text-gray-600">Browse with filters</div>
          </Link>
          <Link href="/test-api" className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="font-medium">🔍 API Test</div>
            <div className="text-sm text-gray-600">Debug API connection</div>
          </Link>
          <Link href="/test-products" className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="font-medium">📦 Product Display</div>
            <div className="text-sm text-gray-600">Test product cards</div>
          </Link>
          <Link href="/test-real-api" className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="font-medium">🌐 Real API Test</div>
            <div className="text-sm text-gray-600">Live API testing</div>
          </Link>
          <Link href="/debug-api" className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="font-medium">🐛 Debug Console</div>
            <div className="text-sm text-gray-600">Debug API issues</div>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-3">📋 Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">✅ Passed:</span> {Object.values(results).filter(r => r?.status === 'success').length}
          </div>
          <div>
            <span className="font-medium">❌ Failed:</span> {Object.values(results).filter(r => r?.status === 'error').length}
          </div>
          <div>
            <span className="font-medium">⚠️ Warnings:</span> {Object.values(results).filter(r => r?.status === 'warning').length}
          </div>
        </div>
      </div>
    </div>
  );
}
