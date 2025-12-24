'use client';


import { Suspense } from 'react';

import HeroSection from '@/components/customer/HeroSection';
import FeaturedCarousel from '@/components/customer/FeaturedCarousel';
import CategoryCard from '@/components/customer/CategoryCard';
import ServicePlansSection from '@/components/customer/ServicePlansSection';
import TestimonialsSection from '@/components/customer/TestimonialsSection';
import NewsletterSection from '@/components/customer/NewsletterSection';
import WhatsAppButton from '@/components/customer/WhatsAppButton';
import { useFeaturedProducts, useCategories } from '@/hooks/useFeaturedProducts';



import type { Product } from '@/types/product';

interface Category {
  _id?: string;
  name: string;
  slug?: string;
  image?: string;
  [key: string]: any;
}

interface HomePageClientProps {
  featuredProducts?: Product[];
  categories?: Category[];
  testimonials?: any[];
}

/**
 * Homepage Client Component
 * Handles all client-side interactivity
 * Now with client-side fallback fetching for reliability
 */
export default function HomePageClient({
  featuredProducts: initialProducts = [],
  categories: initialCategories = []
}: HomePageClientProps) {
  // Use client-side fallback hooks with initial data
  const { products: fallbackProducts, loading: productsLoading } = useFeaturedProducts(initialProducts, 8);
  const { categories: fallbackCategories } = useCategories(initialCategories);

  // Use server data if available, otherwise use client data
  const featuredProducts = initialProducts.length > 0 ? initialProducts : fallbackProducts;
  const categories = initialCategories.length > 0 ? initialCategories : fallbackCategories;

  console.log('HomePageClient display:', {
    initialCount: initialProducts.length,
    fallbackCount: fallbackProducts.length,
    finalCount: featuredProducts.length,
    productsLoading
  });

  return (
    <>
      {/* Enhanced JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              // Organization Schema
              {
                '@type': 'Organization',
                '@id': 'https://laraibcreative.studio/#organization',
                name: 'LaraibCreative',
                url: 'https://laraibcreative.studio',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://laraibcreative.studio/images/logo.svg',
                  width: 250,
                  height: 60
                },
                description: 'Custom ladies suits stitching and designer wear in Pakistan. We turn your thoughts & emotions into reality and happiness.',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Lahore',
                  addressRegion: 'Punjab',
                  addressCountry: 'PK',
                },
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+92-303-8111297',
                  contactType: 'Customer Service',
                  availableLanguage: ['English', 'Urdu'],
                  areaServed: 'PK'
                },
                sameAs: [
                  'https://instagram.com/laraibcreative',
                  'https://facebook.com/laraibcreative',
                ]
              },
              // Website Schema
              {
                '@type': 'WebSite',
                '@id': 'https://laraibcreative.studio/#website',
                url: 'https://laraibcreative.studio',
                name: 'LaraibCreative',
                description: 'Custom ladies suits stitching and designer wear in Pakistan',
                publisher: {
                  '@id': 'https://laraibcreative.studio/#organization'
                },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://laraibcreative.studio/products?search={search_term_string}'
                  },
                  'query-input': 'required name=search_term_string'
                }
              }
            ]
          })
        }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent gradient-text-animate inline-block">Featured Products</h2>
            <p className="mt-2 text-lg text-gray-600">Handpicked just for you</p>
          </div>
          <Suspense fallback={<CarouselSkeleton />}>
            <FeaturedCarousel products={featuredProducts} />
          </Suspense>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent gradient-text-animate inline-block">Shop by Category</h2>
            <p className="mt-2 text-lg text-gray-600">Find what you're looking for</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </div>
      </div>

      {/* Service Plans Section */}
      <ServicePlansSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </>
  );
}

// Loading skeleton components


function CarouselSkeleton() {
  return (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  );
}

