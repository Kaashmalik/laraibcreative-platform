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
 * Homepage - Server Component
 * Fetches data and passes to client component
 * Now inside customer route group to use customer layout with Header/Footer
 */
export default async function HomePage(): Promise<JSX.Element> {
  try {
    // Fetch data for homepage in parallel
    console.log('Fetching homepage data...');
    const [featuredProductsResponse, categoriesResponse] = await Promise.all([
      api.products.getFeatured(8).catch((e) => {
        console.error('Error fetching featured products:', e);
        return { products: [] };
      }),
      api.categories.getAll().catch((e) => {
        console.error('Error fetching categories:', e);
        return { data: [] };
      })
    ]);

    console.log('Featured Products Response:', JSON.stringify(featuredProductsResponse, null, 2));
    // console.log('Categories Response:', JSON.stringify(categoriesResponse, null, 2));

    // Type-safe extraction of products
    let featuredProducts: Product[] = [];
    if (featuredProductsResponse && typeof featuredProductsResponse === 'object') {
      if ('products' in featuredProductsResponse && Array.isArray(featuredProductsResponse.products)) {
        featuredProducts = featuredProductsResponse.products;
      } else if ('data' in featuredProductsResponse && Array.isArray(featuredProductsResponse.data)) {
        // Handle { success: true, data: [...] } format from backend
        featuredProducts = featuredProductsResponse.data as Product[];
      } else if ('data' in featuredProductsResponse && featuredProductsResponse.data &&
        typeof featuredProductsResponse.data === 'object' &&
        'products' in featuredProductsResponse.data &&
        Array.isArray(featuredProductsResponse.data.products)) {
        featuredProducts = featuredProductsResponse.data.products;
      } else if (Array.isArray(featuredProductsResponse)) {
        featuredProducts = featuredProductsResponse as Product[];
      }
    }

    console.log(`Extracted ${featuredProducts.length} featured products`);

    // Type-safe extraction of categories
    let categories: Category[] = [];
    if (categoriesResponse && typeof categoriesResponse === 'object') {
      if ('data' in categoriesResponse && Array.isArray(categoriesResponse.data)) {
        categories = categoriesResponse.data;
      } else if (Array.isArray(categoriesResponse)) {
        categories = categoriesResponse as Category[];
      }
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

