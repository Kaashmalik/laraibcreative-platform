"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/customer/ProductCard';
import ProductFilters from '@/components/customer/ProductFilters';
import Pagination from '@/components/customer/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/lib/api';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams?.get('category') || 'all',
    sortBy: searchParams?.get('sortBy') || 'newest',
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    fabric: searchParams?.get('fabric') || '',
    search: searchParams?.get('search') || '',
    minPrice: parseInt(searchParams?.get('minPrice') || '0', 10),
    maxPrice: parseInt(searchParams?.get('maxPrice') || '50000', 10),
    occasion: searchParams?.get('occasion') ? searchParams.get('occasion').split(',') : [],
    color: searchParams?.get('color') ? searchParams.get('color').split(',') : [],
    availability: searchParams?.get('availability') || ''
  });
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1', 10));
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products with filters:', filters);
        
        const params = {
          page: currentPage,
          limit: productsPerPage,
          ...(filters.category !== 'all' && { category: filters.category }),
          ...(filters.fabric && { fabric: filters.fabric }),
          ...(filters.search && { search: filters.search }),
          sortBy: filters.sortBy,
          minPrice: filters.minPrice || filters.priceRange[0],
          maxPrice: filters.maxPrice || filters.priceRange[1],
        };

        console.log('API params:', params);
        const response = await api.products.getAll(params);
        console.log('API response:', response);
        
        // Handle different response formats
        if (response?.products) {
          setProducts(response.products);
          setTotalProducts(response.total || response.products.length);
        } else if (response?.data) {
          // If data is an array, use it directly
          if (Array.isArray(response.data)) {
            setProducts(response.data);
            setTotalProducts(response.data.length);
          } else {
            setProducts(response.data);
            setTotalProducts(response.data.length);
          }
        } else {
          console.log('Unexpected response format:', response);
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    if (newFilters.category && newFilters.category !== 'all') {
      params.set('category', newFilters.category);
    }
    if (newFilters.fabric) {
      params.set('fabric', newFilters.fabric);
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.sortBy) {
      params.set('sortBy', newFilters.sortBy);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    window.history.pushState({}, '', newUrl);
  };

  // SEO Structured Data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Products - LaraibCreative',
    description: 'Browse our complete collection of custom stitched ladies suits, bridal wear, party suits, and designer replicas.',
    url: typeof window !== 'undefined' ? window.location.href : '',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalProducts,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product.title || product.name,
        description: product.description,
        image: product.primaryImage || product.images?.[0],
        offers: {
          '@type': 'Offer',
          price: product.pricing?.basePrice || product.price,
          priceCurrency: 'PKR',
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }))
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner className="w-12 h-12 text-rose-600" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-600">
            Discover our collection of beautiful Pakistani fashion
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ProductFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results count and sort */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {products.length > 0 ? ((currentPage - 1) * productsPerPage + 1) : 0}-{Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
              </p>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="border rounded px-4 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductsClient() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner className="w-12 h-12 text-rose-600" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

