'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/customer/ProductCard';

export default function TestProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { default: api } = await import('@/lib/api');
        const response = await api.products.getAll({ limit: 6 });
        
        console.log('Test page - API response:', response);
        
        if (response?.products) {
          setProducts(response.products);
        } else if (response?.data) {
          setProducts(Array.isArray(response.data) ? response.data : []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Test page error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-8">Loading products...</div>;
  
  if (error) return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error: {error}</h1>
    </div>
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Products Display</h1>
      
      <div className="mb-6">
        <p className="text-lg">Found {products.length} products</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
