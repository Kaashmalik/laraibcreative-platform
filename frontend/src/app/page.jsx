import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import HeroSection from '@/components/customer/HeroSection';
import FeaturedCarousel from '@/components/customer/FeaturedCarousel';
import CategoryCard from '@/components/customer/CategoryCard';
import TestimonialCard from '@/components/customer/TestimonialCard';
import NewsletterForm from '@/components/customer/NewsletterForm';
import WhatsAppButton from '@/components/customer/WhatsAppButton';
import { Sparkles, Package, Shield, Clock, TrendingUp } from 'lucide-react';

/**
 * Homepage Metadata - SEO Optimized
 * Includes Open Graph and Twitter Card tags
 */
export const metadata = {
  title: 'LaraibCreative - Custom Ladies Suits Stitching Online | Designer Wear Pakistan',
  description: 'Transform your vision into beautiful reality. Custom stitched ladies suits, bridal wear, party suits with perfect measurements. Fast delivery across Pakistan.',
  keywords: ['custom stitching Pakistan', 'ladies suit stitching', 'designer replica stitching', 'bridal wear online', 'party suits Lahore'],
  openGraph: {
    title: 'LaraibCreative - Custom Ladies Suits Stitching Online',
    description: 'We turn your thoughts & emotions into reality and happiness. Get custom stitched designer suits delivered to your door.',
    url: 'https://laraibcreative.com',
    siteName: 'LaraibCreative',
    images: [
      {
        url: '/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'LaraibCreative - Custom Stitching Services',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaraibCreative - Custom Ladies Suits Stitching',
    description: 'Transform your vision into beautiful reality with custom stitched designer suits.',
    images: ['/images/og-homepage.jpg'],
  },
  alternates: {
    canonical: 'https://laraibcreative.com',
  },
};

/**
 * Homepage Component
 * Main landing page with hero, categories, testimonials, and features
 */
export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'LaraibCreative',
            url: 'https://laraibcreative.com',
            logo: 'https://laraibcreative.com/images/logo.svg',
            description: 'Custom ladies suits stitching and designer wear in Pakistan',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Lahore',
              addressRegion: 'Punjab',
              addressCountry: 'PK',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+92-300-1234567',
              contactType: 'Customer Service',
              availableLanguage: ['English', 'Urdu'],
            },
            sameAs: [
              'https://instagram.com/laraibcreative',
              'https://facebook.com/laraibcreative',
            ],
          }),
        }}
      />

      {/* Hero Section - Full screen with gradient and CTAs */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Featured Collections Carousel */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Collections
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of stunning designs, crafted with love and attention to detail
            </p>
          </div>
          
          <Suspense fallback={<CarouselSkeleton />}>
            <FeaturedCarousel />
          </Suspense>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect style for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              title="Bridal Wear"
              image="/images/categories/bridal.jpg"
              slug="bridal-wear"
              count={45}
            />
            <CategoryCard
              title="Party Wear"
              image="/images/categories/party.jpg"
              slug="party-wear"
              count={78}
            />
            <CategoryCard
              title="Casual Suits"
              image="/images/categories/casual.jpg"
              slug="casual"
              count={120}
            />
            <CategoryCard
              title="Formal Wear"
              image="/images/categories/formal.jpg"
              slug="formal-wear"
              count={56}
            />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-all duration-300 hover:scale-105"
            >
              View All Collections
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose LaraibCreative?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine traditional craftsmanship with modern convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-10 h-10 text-pink-600" />}
              title="Custom Designs"
              description="Bring your dream outfit to life with our custom stitching service"
              stat="500+"
              statLabel="Custom Orders"
            />
            <FeatureCard
              icon={<Package className="w-10 h-10 text-purple-600" />}
              title="Quality Fabrics"
              description="Premium fabrics from lawn to silk, handpicked for you"
              stat="50+"
              statLabel="Fabric Types"
            />
            <FeatureCard
              icon={<Clock className="w-10 h-10 text-rose-600" />}
              title="Fast Delivery"
              description="Quick turnaround time without compromising quality"
              stat="7-10"
              statLabel="Days Average"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 text-indigo-600" />}
              title="Quality Guaranteed"
              description="100% satisfaction guarantee or we make it right"
              stat="98%"
              statLabel="Happy Customers"
            />
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real customers who trusted us with their special moments
            </p>
          </div>

          <Suspense fallback={<TestimonialsSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Ayesha Khan"
                image="/images/testimonials/customer1.jpg"
                rating={5}
                comment="LaraibCreative made my bridal outfit dreams come true! The attention to detail and perfect measurements made me feel like a princess on my big day."
                date="2 weeks ago"
                verified={true}
              />
              <TestimonialCard
                name="Fatima Ahmed"
                image="/images/testimonials/customer2.jpg"
                rating={5}
                comment="I ordered a designer replica and was amazed by how accurate it was! The quality exceeded my expectations. Will definitely order again!"
                date="1 month ago"
                verified={true}
              />
              <TestimonialCard
                name="Sana Malik"
                image="/images/testimonials/customer3.jpg"
                rating={5}
                comment="The custom stitching service is incredible. They understood exactly what I wanted and delivered perfectly. Highly recommended!"
                date="3 weeks ago"
                verified={true}
              />
            </div>
          </Suspense>

          <div className="text-center mt-8">
            <Link
              href="/reviews"
              className="text-pink-600 hover:text-pink-700 font-medium inline-flex items-center gap-2"
            >
              Read More Reviews
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Follow Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              See our latest creations and happy customers on Instagram
            </p>
            <a
              href="https://instagram.com/laraibcreative"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
            >
              @laraibcreative
              <TrendingUp className="w-4 h-4" />
            </a>
          </div>

          {/* Instagram Grid Placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
              >
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 group-hover:scale-110 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Stay Updated with Latest Designs
            </h2>
            <p className="text-lg text-pink-100 mb-8">
              Subscribe to our newsletter and get exclusive offers, styling tips, and early access to new collections
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </>
  );
}

/**
 * Feature Card Component
 * Displays features with icon, title, description, and animated stats
 */
function FeatureCard({ icon, title, description, stat, statLabel }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="pt-4 border-t border-gray-100">
        <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          {stat}
        </div>
        <div className="text-sm text-gray-500">{statLabel}</div>
      </div>
    </div>
  );
}

/**
 * Loading Skeletons for Suspense boundaries
 */
function HeroSkeleton() {
  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 to-purple-100 animate-pulse" />
  );
}

function CarouselSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse h-64" />
      ))}
    </div>
  );
}