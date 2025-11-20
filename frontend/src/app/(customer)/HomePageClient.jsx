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

      {/* Rest of the homepage content - keeping existing structure */}
      {/* This is a simplified version - you should copy the rest from page.jsx */}
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

