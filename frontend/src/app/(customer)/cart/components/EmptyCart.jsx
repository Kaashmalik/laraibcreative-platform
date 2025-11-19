/**
 * EmptyCart Component
 * Empty cart state with illustration and product suggestions
 * @location src/app/(customer)/cart/components/EmptyCart.jsx
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ProductCard from '@/components/customer/ProductCard';

const EmptyCart = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch popular products on mount
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true&limit=4');
        const data = await response.json();
        setPopularProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch popular products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center text-center mb-16">
        {/* Illustration - SVG Cart Icon */}
        <div className="mb-8 relative">
          <div className="w-48 h-48 md:w-64 md:h-64 relative">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-gray-300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cart Body */}
              <path
                d="M40 60 L50 140 L150 140 L160 60 Z"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Cart Handle */}
              <path
                d="M60 60 L70 30 L130 30 L140 60"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Left Wheel */}
              <circle
                cx="75"
                cy="155"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              {/* Right Wheel */}
              <circle
                cx="125"
                cy="155"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              {/* Decorative Lines */}
              <line
                x1="70"
                y1="80"
                x2="130"
                y2="80"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="65"
                y1="100"
                x2="135"
                y2="100"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="120"
                x2="140"
                y2="120"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Floating Sparkles Animation */}
            <div className="absolute -top-4 -right-4 animate-bounce">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse">
              <Sparkles className="w-6 h-6 text-primary-300" />
            </div>
          </div>
        </div>

        {/* Empty State Text */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Your Cart is Empty
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Looks like you haven't added any products yet. Start shopping to fill your cart with amazing designs!
        </p>

        {/* CTA Button */}
        <Link href="/products">
          <Button
            size="lg"
            className="text-base font-semibold group"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 mt-8 text-sm">
          <Link 
            href="/custom-order" 
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
          >
            Create Custom Order
          </Link>
          <span className="text-gray-300">•</span>
          <Link 
            href="/categories" 
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
          >
            Browse Categories
          </Link>
          <span className="text-gray-300">•</span>
          <Link 
            href="/blog" 
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
          >
            Style Inspiration
          </Link>
        </div>
      </div>

      {/* Popular Products Section */}
      {!isLoading && popularProducts.length > 0 && (
        <section className="mt-16 md:mt-24">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                Recommended for You
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              You Might Like These
            </h2>
            <p className="text-gray-600">
              Handpicked designs from our latest collection
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-fade-in"
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10">
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Loading State for Products */}
      {isLoading && (
        <section className="mt-16 md:mt-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Loading Recommendations...
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                {/* Skeleton Loader */}
                <div className="animate-pulse">
                  <div className="w-full h-64 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="mt-16 md:mt-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 md:p-12">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Why Shop with LaraibCreative?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h4>
            <p className="text-gray-600">
              Handcrafted designs with attention to every detail
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h4>
            <p className="text-gray-600">
              Quick processing and reliable shipping across Pakistan
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Custom Tailoring</h4>
            <p className="text-gray-600">
              Perfect fit guaranteed with our custom measurement service
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmptyCart;