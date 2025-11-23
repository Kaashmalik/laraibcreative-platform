import type { Metadata } from 'next';
import HomePageClient from './(customer)/HomePageClient';
import api from '@/lib/api';
import { SITE_URL } from '@/lib/constants';
import { generateOrganizationStructuredData } from '@/lib/seo-config';
import type { Product } from '@/types/product';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import WhatsAppButton from '@/components/customer/WhatsAppButton';

/**
 * Category interface for homepage
 */
interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

/**
 * ISR Configuration
 * Revalidate homepage every 600 seconds (10 minutes)
 * Homepage content (featured products, categories) changes frequently
 */
export const revalidate = 600;

/**
 * Generate metadata for homepage
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'LaraibCreative - Custom Ladies Suits & Designer Wear | Pakistan',
    description: 'Premium custom stitched ladies suits and designer wear in Pakistan. Ready-made suits, brand replicas, and hand-made karhai suits. We turn your thoughts & emotions into reality and happiness. Fast delivery across Pakistan.',
    keywords: [
      'ready-made ladies suits Pakistan',
      'brand replica stitching online',
      'hand-made karhai suits Lahore',
      'custom ladies suits',
      'designer wear Pakistan',
      'custom stitching',
      'Pakistani fashion',
      'ready to wear',
      'online shopping Pakistan',
      'bridal wear',
      'party wear'
    ].join(', '),
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title: 'LaraibCreative - Custom Ladies Suits & Designer Wear',
      description: 'Premium custom stitched ladies suits and designer wear in Pakistan.',
      url: SITE_URL,
      siteName: 'LaraibCreative',
      locale: 'en_PK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'LaraibCreative - Custom Ladies Suits & Designer Wear',
      description: 'Premium custom stitched ladies suits and designer wear in Pakistan.',
      creator: '@laraibcreative',
    },
  };
}

/**
 * Homepage - Server Component (Root)
 * Fetches data and passes to client component
 * Includes Header and Footer for standalone rendering
 */
export default async function RootHomePage(): Promise<JSX.Element> {
  try {
    // Fetch data for homepage in parallel
    const [featuredProductsResponse, categoriesResponse] = await Promise.all([
      api.products.getFeatured(8).catch(() => ({ products: [] })),
      api.categories.getAll().catch(() => ({ data: [] }))
    ]);

    const featuredProducts: Product[] = Array.isArray(featuredProductsResponse?.products) 
      ? featuredProductsResponse.products
      : Array.isArray(featuredProductsResponse?.data?.products)
      ? featuredProductsResponse.data.products
      : Array.isArray(featuredProductsResponse)
      ? featuredProductsResponse
      : [];
    
    const categories: Category[] = Array.isArray(categoriesResponse?.data)
      ? categoriesResponse.data
      : Array.isArray(categoriesResponse)
      ? categoriesResponse
      : [];

    // Generate Organization structured data for SEO
    const organizationSchema = generateOrganizationStructuredData();

    return (
      <div className="flex flex-col min-h-screen">
        {/* Header - sticky navigation */}
        <Header />

        {/* Main content area with accessibility ID */}
        <main 
          id="main-content" 
          className="flex-1"
          role="main"
        >
          {/* JSON-LD Organization Schema for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
          <HomePageClient
            featuredProducts={featuredProducts}
            categories={categories}
            testimonials={[]} // Add when testimonials API is available
          />
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating WhatsApp button for quick contact */}
        <WhatsAppButton />
      </div>
    );
  } catch (error: unknown) {
    console.error('Error fetching homepage data:', error);
    
    // Return homepage with empty data rather than error
    // This ensures the page still loads even if API fails
    const organizationSchema = generateOrganizationStructuredData();
    
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-1" role="main">
          {/* JSON-LD Organization Schema for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
          <HomePageClient
            featuredProducts={[]}
            categories={[]}
            testimonials={[]}
          />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }
}
