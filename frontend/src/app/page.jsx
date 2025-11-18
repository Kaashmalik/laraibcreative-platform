'use client';

import { Suspense } from 'react';

// Force dynamic rendering to avoid static generation issues with client components
export const dynamic = 'force-dynamic';

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
 * Homepage Metadata - Enhanced SEO
 */
/**
 * Enhanced Homepage Component
 */
export default function HomePage() {
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
                  'https://wa.me/923020718182'
                ],
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  reviewCount: '500',
                  bestRating: '5',
                  worstRating: '1'
                }
              },
              // Website Schema
              {
                '@type': 'WebSite',
                '@id': 'https://laraibcreative.com/#website',
                url: 'https://laraibcreative.com',
                name: 'LaraibCreative',
                description: 'Custom Ladies Suits Stitching Online',
                publisher: {
                  '@id': 'https://laraibcreative.com/#organization'
                },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://laraibcreative.com/products?search={search_term_string}',
                  'query-input': 'required name=search_term_string'
                }
              },
              // Local Business Schema
              {
                '@type': 'LocalBusiness',
                '@id': 'https://laraibcreative.studio/#localbusiness',
                name: 'LaraibCreative',
                image: 'https://laraibcreative.studio/images/shop-front.jpg',
                priceRange: 'PKR 2000 - PKR 15000',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Lahore',
                  addressRegion: 'Punjab',
                  addressCountry: 'PK'
                },
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: 31.5204,
                  longitude: 74.3587
                },
                openingHoursSpecification: [
                  {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    opens: '10:00',
                    closes: '20:00'
                  }
                ],
                telephone: '+92-303-8111297',
                areaServed: {
                  '@type': 'Country',
                  name: 'Pakistan'
                }
              },
              // Service Schema
              {
                '@type': 'Service',
                serviceType: 'Custom Stitching Service',
                provider: {
                  '@id': 'https://laraibcreative.com/#organization'
                },
                areaServed: {
                  '@type': 'Country',
                  name: 'Pakistan'
                },
                hasOfferCatalog: {
                  '@type': 'OfferCatalog',
                  name: 'Custom Stitching Services',
                  itemListElement: [
                    {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Service',
                        name: 'Bridal Wear Stitching'
                      }
                    },
                    {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Service',
                        name: 'Party Wear Stitching'
                      }
                    },
                    {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Service',
                        name: 'Designer Replica Stitching'
                      }
                    }
                  ]
                }
              }
            ]
          }),
        }}
      />

      {/* Hero Section with animations */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Trust Indicators Bar */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <TrustIndicator
              icon={<Users className="w-8 h-8 text-pink-600" />}
              stat="500+"
              label="Happy Customers"
            />
            <TrustIndicator
              icon={<Award className="w-8 h-8 text-purple-600" />}
              stat="98%"
              label="Satisfaction Rate"
            />
            <TrustIndicator
              icon={<Scissors className="w-8 h-8 text-rose-600" />}
              stat="1000+"
              label="Orders Completed"
            />
            <TrustIndicator
              icon={<Star className="w-8 h-8 text-amber-500" />}
              stat="4.9/5"
              label="Average Rating"
            />
          </div>
        </div>
      </section>

      {/* Featured Collections Carousel */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Featured Collections"
            subtitle="Discover our handpicked selection of stunning designs, crafted with love and attention to detail"
            badge="TRENDING NOW"
          />
          
          <Suspense fallback={<CarouselSkeleton />}>
            <FeaturedCarousel />
          </Suspense>

          {/* Collection Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <CollectionStat
              count="45+"
              label="Bridal Designs"
              gradient="from-pink-500 to-rose-500"
            />
            <CollectionStat
              count="78+"
              label="Party Wear"
              gradient="from-purple-500 to-indigo-500"
            />
            <CollectionStat
              count="120+"
              label="Casual Suits"
              gradient="from-blue-500 to-cyan-500"
            />
            <CollectionStat
              count="56+"
              label="Formal Wear"
              gradient="from-amber-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="How It Works"
            subtitle="Simple 4-step process to get your dream outfit"
            badge="EASY PROCESS"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <ProcessStep
              step="1"
              icon={<Sparkles className="w-8 h-8" />}
              title="Choose Design"
              description="Browse our collection or upload your own reference images"
            />
            <ProcessStep
              step="2"
              icon={<Scissors className="w-8 h-8" />}
              title="Add Measurements"
              description="Provide your measurements using our easy guide"
            />
            <ProcessStep
              step="3"
              icon={<Package className="w-8 h-8" />}
              title="We Stitch"
              description="Our expert tailors craft your outfit with precision"
            />
            <ProcessStep
              step="4"
              icon={<Truck className="w-8 h-8" />}
              title="Fast Delivery"
              description="Receive your perfectly stitched outfit at your doorstep"
            />
          </div>

          <div className="text-center mt-12">
            <Link
              href="/custom-order"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Custom Order
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Shop by Category"
            subtitle="Find the perfect style for every occasion"
            badge="EXPLORE"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              title="Bridal Wear"
              image="/images/categories/bridal.jpg"
              slug="bridal-wear"
              count={45}
              description="Exquisite bridal collections"
            />
            <CategoryCard
              title="Party Wear"
              image="/images/categories/party.jpg"
              slug="party-wear"
              count={78}
              description="Stand out at every event"
            />
            <CategoryCard
              title="Casual Suits"
              image="/images/categories/casual.jpg"
              slug="casual"
              count={120}
              description="Everyday elegance"
            />
            <CategoryCard
              title="Formal Wear"
              image="/images/categories/formal.jpg"
              slug="formal-wear"
              count={56}
              description="Professional perfection"
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
          <SectionHeader
            title="Why Choose LaraibCreative?"
            subtitle="We combine traditional craftsmanship with modern convenience"
            badge="OUR PROMISE"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-10 h-10 text-pink-600" />}
              title="Custom Designs"
              description="Bring your dream outfit to life with our custom stitching service"
              stat="500+"
              statLabel="Custom Orders"
              features={[
                'Any design possible',
                'Your fabric or ours',
                'Perfect fit guaranteed'
              ]}
            />
            <FeatureCard
              icon={<Package className="w-10 h-10 text-purple-600" />}
              title="Quality Fabrics"
              description="Premium fabrics from lawn to silk, handpicked for you"
              stat="50+"
              statLabel="Fabric Types"
              features={[
                'Premium quality',
                'Authentic materials',
                'Best prices'
              ]}
            />
            <FeatureCard
              icon={<Clock className="w-10 h-10 text-rose-600" />}
              title="Fast Delivery"
              description="Quick turnaround time without compromising quality"
              stat="7-10"
              statLabel="Days Average"
              features={[
                'Rush orders available',
                'Tracking provided',
                'Timely delivery'
              ]}
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 text-indigo-600" />}
              title="Quality Guaranteed"
              description="100% satisfaction guarantee or we make it right"
              stat="98%"
              statLabel="Happy Customers"
              features={[
                'Quality checked',
                'Easy returns',
                'Customer support'
              ]}
            />
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="What Our Customers Say"
            subtitle="Real stories from real customers who trusted us with their special moments"
            badge="REVIEWS"
          />

          <Suspense fallback={<TestimonialsSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Ayesha Khan"
                image="/images/testimonials/customer1.jpg"
                rating={5}
                comment="LaraibCreative made my bridal outfit dreams come true! The attention to detail and perfect measurements made me feel like a princess on my big day."
                date="2 weeks ago"
                verified={true}
                location="Lahore, Pakistan"
              />
              <TestimonialCard
                name="Fatima Ahmed"
                image="/images/testimonials/customer2.jpg"
                rating={5}
                comment="I ordered a designer replica and was amazed by how accurate it was! The quality exceeded my expectations. Will definitely order again!"
                date="1 month ago"
                verified={true}
                location="Karachi, Pakistan"
              />
              <TestimonialCard
                name="Sana Malik"
                image="/images/testimonials/customer3.jpg"
                rating={5}
                comment="The custom stitching service is incredible. They understood exactly what I wanted and delivered perfectly. Highly recommended!"
                date="3 weeks ago"
                verified={true}
                location="Islamabad, Pakistan"
              />
            </div>
          </Suspense>

          {/* Video Testimonials */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8">
              Watch Customer Stories
            </h3>
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <VideoTestimonials />
            </Suspense>
          </div>

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

      {/* Before & After Showcase */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Work Speaks"
            subtitle="See the transformation from design to reality"
            badge="PORTFOLIO"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-semibold">Custom Design #{i}</p>
                  <p className="text-white/80 text-sm">Bridal Collection</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
            >
              View Full Portfolio
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Follow Our Journey"
            subtitle="See our latest creations and happy customers on Instagram"
            badge="@LARAIBCREATIVE"
          />
          
          <div className="text-center mb-8">
            <a
              href="https://instagram.com/laraibcreative"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-lg"
            >
              <Instagram className="w-6 h-6" />
              @laraibcreative
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <Suspense fallback={<InstagramSkeleton />}>
            <InstagramFeed />
          </Suspense>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our services"
            badge="FAQ"
          />

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="How long does custom stitching take?"
              answer="Our standard turnaround time is 7-10 business days. For rush orders, we offer 3-5 day delivery at additional cost. You'll receive updates throughout the process."
            />
            <FAQItem
              question="Do I need to provide my own fabric?"
              answer="You can either provide your own fabric or choose from our premium fabric collection. We source high-quality materials including lawn, chiffon, silk, and more."
            />
            <FAQItem
              question="How do I take my measurements?"
              answer="We provide a detailed measurement guide with images and video tutorial. You can also save measurements in your account for future orders."
            />
            <FAQItem
              question="What if the outfit doesn't fit?"
              answer="We offer free alterations within 7 days of delivery. Your satisfaction is our priority, and we'll make it right."
            />
            <FAQItem
              question="Do you deliver across Pakistan?"
              answer="Yes! We deliver to all major cities including Lahore, Karachi, Islamabad, Faisalabad, and more. Shipping charges vary by location."
            />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-pink-600 hover:text-pink-700 font-medium inline-flex items-center gap-2"
            >
              View All FAQs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
              STAY CONNECTED
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Get Exclusive Offers & Updates
            </h2>
            <p className="text-lg text-pink-100 mb-8">
              Subscribe to our newsletter for styling tips, early access to new collections, and special discounts
            </p>
            <NewsletterForm />
            <p className="text-pink-100 text-sm mt-4">
              Join 2,000+ subscribers • No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Have Questions? We're Here to Help!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our friendly team is ready to assist you with measurements, fabric selection, or any queries about your order.
                </p>
                <div className="space-y-3">
                  <ContactMethod
                    icon={<MessageCircle className="w-5 h-5" />}
                    label="WhatsApp"
                    value="03020718182"
                    href="https://wa.me/923020718182"
                  />
                  <ContactMethod
                    icon={<Phone className="w-5 h-5" />}
                    label="Call Us"
                    value="03020718182"
                    href="tel:03020718182"
                  />
                  <ContactMethod
                    icon={<Mail className="w-5 h-5" />}
                    label="Email"
                    value="info@laraibcreative.business"
                    href="mailto:info@laraibcreative.business"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="block w-full px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-center rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Contact Us
                </Link>
                <Link
                  href="/size-guide"
                  className="block w-full px-8 py-4 bg-white border-2 border-pink-600 text-pink-600 text-center rounded-full hover:bg-pink-50 transition-all duration-300"
                >
                  View Size Guide
                </Link>
                <Link
                  href="/custom-order"
                  className="block w-full px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 text-center rounded-full hover:bg-purple-50 transition-all duration-300"
                >
                  Start Custom Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </>
  );
}

/**
 * Trust Indicator Component
 */
function TrustIndicator({ icon, stat, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

/**
 * Section Header Component
 */
function SectionHeader({ title, subtitle, badge }) {
  return (
    <div className="text-center mb-12">
      {badge && (
        <div className="inline-block px-4 py-1 bg-pink-100 rounded-full text-pink-600 text-sm font-medium mb-4">
          {badge}
        </div>
      )}
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

/**
 * Collection Stat Component
 */
function CollectionStat({ count, label, gradient }) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
        {count}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

/**
 * Process Step Component
 */
function ProcessStep({ step, icon, title, description }) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-pink-600 font-bold text-sm shadow-md">
            {step}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      {step !== "4" && (
        <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-pink-300" />
      )}
    </div>
  );
}

/**
 * Enhanced Feature Card Component
 */
function FeatureCard({ icon, title, description, stat, statLabel, features }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {features && (
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      )}
      
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
 * FAQ Item Component
 */
function FAQItem({ question, answer }) {
  return (
    <details className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900">
        <span>{question}</span>
        <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
      </summary>
      <div className="px-6 pb-6 text-gray-600">
        {answer}
      </div>
    </details>
  );
}

/**
 * Contact Method Component
 */
function ContactMethod({ icon, label, value, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-pink-50 transition-colors group"
    >
      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </a>
  );
}

/**
 * Loading Skeletons for Suspense boundaries
 */
function HeroSkeleton() {
  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 to-purple-100 animate-pulse">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="w-full max-w-2xl space-y-4">
          <div className="h-12 bg-white/30 rounded-lg w-3/4" />
          <div className="h-6 bg-white/30 rounded-lg w-full" />
          <div className="h-6 bg-white/30 rounded-lg w-5/6" />
          <div className="flex gap-4 mt-8">
            <div className="h-14 bg-white/30 rounded-full w-40" />
            <div className="h-14 bg-white/30 rounded-full w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InstagramSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="aspect-square bg-gray-200 rounded-lg overflow-hidden animate-pulse"
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100" />
        </div>
      ))}
    </div>
  );
}