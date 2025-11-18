"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/customer/ProductCard';
import ProductFilters from '@/components/customer/ProductFilters';
import Breadcrumbs from '@/components/customer/Breadcrumbs';
import Pagination from '@/components/customer/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import SEO from '@/components/shared/SEO';
import api from '@/lib/api';

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    fabric: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch category by slug
        const categories = await api.categories.getAll();
        const foundCategory = categories.find(cat => cat.slug === params.slug);
        
        if (foundCategory) {
          setCategory(foundCategory);
          
          // Fetch products for this category
          const response = await api.products.getAll({
            category: foundCategory._id || foundCategory.id,
            page: currentPage,
            limit: productsPerPage,
            sortBy: filters.sortBy,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            ...(filters.fabric && { fabric: filters.fabric })
          });
          
          if (response && response.products) {
            setProducts(response.products);
            setTotalProducts(response.total || response.products.length);
          }
        }
      } catch (error) {
        console.error('Error fetching category/products:', error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCategoryAndProducts();
    }
  }, [params.slug, filters, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const categoryName = category?.name || params.slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Category';
  
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/products' },
    { label: categoryName }
  ];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner className="w-12 h-12 text-rose-600" />
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

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
              {products.length === 0 ? (
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
