"use client";

import { useState } from 'react';
import ProductCard from '@/components/customer/ProductCard';
import ProductFilters from '@/components/customer/ProductFilters';
import Breadcrumbs from '@/components/customer/Breadcrumbs';
import Pagination from '@/components/customer/Pagination';
import SEO from '@/components/shared/SEO';
import api from '@/lib/api';

/**
 * Category Page Client Component
 * Handles all client-side interactivity (filters, pagination)
 */
export default function CategoryPageClient({ 
  category: initialCategory, 
  initialProducts, 
  initialTotalProducts,
  slug 
}) {
  const [category] = useState(initialCategory);
  const [products, setProducts] = useState(initialProducts || []);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts || 0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    fabric: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Handle client-side filtering (for dynamic filters)
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setLoading(true);
    
    try {
      const response = await api.products.getAll({
        category: category._id || category.id,
        page: 1,
        limit: productsPerPage,
        sortBy: newFilters.sortBy,
        minPrice: newFilters.priceRange[0],
        maxPrice: newFilters.priceRange[1],
        ...(newFilters.fabric && { fabric: newFilters.fabric })
      });
      
      if (response && response.products) {
        setProducts(response.products);
        setTotalProducts(response.total || response.products.length);
      }
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const categoryName = category?.name || slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Category';
  
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/products' },
    { label: categoryName }
  ];

  // SEO Structured Data
  const structuredData = category ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} - LaraibCreative`,
    description: category.description || `Browse our ${categoryName.toLowerCase()} collection`,
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
          priceCurrency: 'PKR'
        }
      }))
    }
  } : null;

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <a href="/products" className="text-pink-600 hover:text-pink-700 font-medium">
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${categoryName} Collection`}
        description={category.description || `Browse our ${categoryName.toLowerCase()} collection. Premium quality custom stitched suits.`}
        keywords={[categoryName, 'custom stitching', 'Pakistani fashion', category.metaTitle]}
        structuredData={structuredData}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <div className="mt-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {categoryName}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 max-w-3xl">
                {category.description}
              </p>
            )}
            <p className="text-gray-600 mt-4">
              Showing {products.length > 0 ? ((currentPage - 1) * productsPerPage + 1) : 0}-{Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
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
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or browse other categories.</p>
                  <a href="/products" className="inline-block px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors">
                    Browse All Products
                  </a>
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
      </div>
    </>
  );
}

