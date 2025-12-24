import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import api from '@/lib/api';
import { SITE_URL } from '@/lib/constants';
import { generateOrganizationStructuredData } from '@/lib/seo-config';
import type { Product } from '@/types/product';

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
export const revalidate = 300; // Revalidate every 5 minutes to balance freshness and performance

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
 * Homepage - Server Component
 * Fetches data and passes to client component
 * Now inside customer route group to use customer layout with Header/Footer
 */
export default async function HomePage(): Promise<JSX.Element> {
  try {
    // Fetch data for homepage in parallel with timeout
    console.log('Fetching homepage data...');

    // Create a timeout promise that resolves with empty data instead of rejecting
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        console.warn('Fetch timeout, using empty data');
        resolve([{ success: false, data: [] }, { success: false, data: [] }]);
      }, 10000)
    );

    const fetchPromise = Promise.all([
      api.products.getFeatured(8).catch((e) => {
        console.error('Error fetching featured products:', e);
        return { success: false, data: [] };
      }),
      api.categories.getAll().catch((e) => {
        console.error('Error fetching categories:', e);
        return { success: false, data: [] };
      })
    ]);

    // Race between fetch and timeout - both resolve with same structure
    const [featuredProductsResponse, categoriesResponse] = await Promise.race([fetchPromise, timeoutPromise]) as [any, any];

    console.log('Featured Products Response:', JSON.stringify(featuredProductsResponse, null, 2));
    // console.log('Categories Response:', JSON.stringify(categoriesResponse, null, 2));

    // Type-safe extraction of products
    let featuredProducts: Product[] = [];

    // Handle different response formats consistently
    if (featuredProductsResponse && featuredProductsResponse.success && Array.isArray(featuredProductsResponse.data)) {
      // Standard API response: { success: true, data: [...] }
      featuredProducts = featuredProductsResponse.data;
    } else if (featuredProductsResponse && Array.isArray(featuredProductsResponse.data)) {
      // Direct data response: { data: [...] }
      featuredProducts = featuredProductsResponse.data;
    } else if (Array.isArray(featuredProductsResponse)) {
      // Direct array response
      featuredProducts = featuredProductsResponse;
    } else {
      console.warn('Unexpected featured products response format:', featuredProductsResponse);
      featuredProducts = [];
    }

    console.log(`Extracted ${featuredProducts.length} featured products`);

    // Type-safe extraction of categories
    let categories: Category[] = [];

    if (categoriesResponse && categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
      // Standard API response: { success: true, data: [...] }
      categories = categoriesResponse.data;
    } else if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
      // Direct data response: { data: [...] }
      categories = categoriesResponse.data;
    } else if (Array.isArray(categoriesResponse)) {
      // Direct array response
      categories = categoriesResponse;
    } else {
      console.warn('Unexpected categories response format:', categoriesResponse);
      categories = [];
    }

    // Fetch testimonials if available
    // const testimonials = await api.testimonials.getAll().catch(() => []);

    // Generate Organization structured data for SEO
    const organizationSchema = generateOrganizationStructuredData();

    return (
      <>
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
      </>
    );
  } catch (error: unknown) {
    console.error('Error fetching homepage data:', error);

    // Return homepage with empty data rather than error
    // This ensures the page still loads even if API fails
    const organizationSchema = generateOrganizationStructuredData();

    return (
      <>
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
      </>
    );
  }
}

