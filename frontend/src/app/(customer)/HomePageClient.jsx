'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import HeroSection from '@/components/customer/HeroSection';
import FeaturedCarousel from '@/components/customer/FeaturedCarousel';
import CategoryCard from '@/components/customer/CategoryCard';
import TestimonialCard from '@/components/customer/TestimonialCard';
import NewsletterForm from '@/components/customer/NewsletterForm';
import WhatsAppButton from '@/components/customer/WhatsAppButton';

import { 
  Sparkles, 
  Package, 
  Shield, 
  Clock, 
  TrendingUp, 
  Award,
  Heart,
  Scissors,
  Star,
  Truck,
  Users,
  ChevronRight,
  Play,
  Instagram,
  Facebook,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// Dynamic imports for performance
const InstagramFeed = dynamicImport(() => import('@/components/customer/InstagramFeed'), {
  loading: () => <InstagramSkeleton />,
  ssr: false
});

const VideoTestimonials = dynamicImport(() => import('@/components/customer/VideoTestimonials'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

/**
 * Homepage Client Component
 * Handles all client-side interactivity
 */
export default function HomePageClient({ featuredProducts, categories, testimonials }) {
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Products</h2>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-2 text-lg text-gray-600">Find what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-2 text-lg text-gray-600">We're trusted by hundreds of happy customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial._id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Stay in the Loop</h2>
            <p className="mt-2 text-lg text-gray-600">Subscribe to our newsletter for the latest updates and offers</p>
          </div>
          <div className="mt-8 max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </>
  );
}

// Loading skeleton components
function InstagramSkeleton() {
  return (
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  );
}

function CarouselSkeleton() {
  return (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  );
}

