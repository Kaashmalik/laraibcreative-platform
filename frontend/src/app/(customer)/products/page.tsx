export const dynamic = 'force-dynamic';
import { SITE_URL } from '@/lib/constants';
import ProductsClient from './ProductsClient';

// Force dynamic rendering to avoid build hanging
/**
 * Products List Page Metadata
 * Production-ready SEO metadata following Next.js 14 best practices
 */
export const metadata = {
  title: 'Products | Browse Collection | LaraibCreative',
  description: 'Browse our complete collection of custom stitched ladies suits, ready-made suits, brand replicas, hand-made karhai suits, bridal wear, and party suits. Premium quality fabrics with perfect measurements. Shop now!',
  keywords: [
    'ready-made ladies suits Pakistan',
    'brand replica stitching online',
    'hand-made karhai suits Lahore',
    'ladies suits Pakistan',
    'bridal wear online',
    'party suits',
    'custom stitching',
    'designer replicas',
    'Pakistani fashion',
    'ready to wear',
    'online shopping Pakistan',
    'custom stitched suits',
    'designer wear'
  ].join(', '),
  authors: [{ name: 'LaraibCreative' }],
  creator: 'LaraibCreative',
  publisher: 'LaraibCreative',
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    type: 'website',
    title: 'Products - Browse Our Collection | LaraibCreative',
    description: 'Browse our complete collection of custom stitched ladies suits, bridal wear, party suits, and designer replicas. Premium quality fabrics.',
    url: `${SITE_URL}/products`,
    siteName: 'LaraibCreative',
    locale: 'en_PK',
    images: [
      {
        url: `${SITE_URL}/images/og-products.jpg`,
        width: 1200,
        height: 630,
        alt: 'LaraibCreative Products - Custom Stitched Suits Collection',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products - Browse Collection | LaraibCreative',
    description: 'Browse our complete collection of custom stitched ladies suits, bridal wear, party suits, and designer replicas.',
    images: [`${SITE_URL}/images/og-products.jpg`],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
};

/**
 * Products List Page - Server Component Wrapper
 * Renders client component for interactivity
 */
export default function ProductsPage() {
  return <ProductsClient />;
}