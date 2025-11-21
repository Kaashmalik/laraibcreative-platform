import { Suspense } from 'react';
import HomePageClient from './(customer)/HomePageClient';
import api from '@/lib/api';
import { SITE_URL } from '@/lib/constants';

/**
 * ISR Configuration
 * Revalidate homepage every 600 seconds (10 minutes)
 * Homepage content (featured products, categories) changes frequently
 */
export const revalidate = 600;

/**
 * Generate metadata for homepage
 */
export async function generateMetadata() {
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
 */
export default async function HomePage() {
  try {
    // Fetch data for homepage in parallel
    const [featuredProductsResponse, categoriesResponse] = await Promise.all([
      api.products.getFeatured(8).catch(() => ({ products: [] })),
      api.categories.getAll().catch(() => ({ data: [] }))
    ]);

    const featuredProducts = featuredProductsResponse?.products || 
                            featuredProductsResponse?.data?.products || 
                            featuredProductsResponse || [];
    
    const categories = categoriesResponse?.data || 
                      categoriesResponse || [];

    // Fetch testimonials if available
    // const testimonials = await api.testimonials.getAll().catch(() => []);

    return (
      <HomePageClient
        featuredProducts={featuredProducts}
        categories={categories}
        testimonials={[]} // Add when testimonials API is available
      />
    );
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    // Return homepage with empty data rather than error
    // This ensures the page still loads even if API fails
    return (
      <HomePageClient
        featuredProducts={[]}
        categories={[]}
        testimonials={[]}
      />
    );
  }
}

