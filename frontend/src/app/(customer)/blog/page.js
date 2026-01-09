export const dynamic = 'force-dynamic';
import { SITE_URL } from '@/lib/constants';
import BlogClient from './BlogClient';

/**
 * Blog List Page Metadata
 * Production-ready SEO metadata following Next.js 14 best practices
 */
export const metadata = {
  title: 'Blog | Fashion Tips & Guides | LaraibCreative',
  description: 'Read expert fashion tips, stitching guides, fabric guides, and style inspiration on the LaraibCreative blog. Learn about custom stitching, measurements, and Pakistani fashion trends.',
  keywords: [
    'fashion blog Pakistan',
    'stitching tips',
    'fabric guide',
    'Pakistani fashion trends',
    'custom stitching guide',
    'style tips',
    'fashion blog',
    'clothing guide',
    'measurement guide',
    'bridal fashion tips'
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
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    type: 'website',
    title: 'Blog - Fashion Tips & Guides | LaraibCreative',
    description: 'Read expert fashion tips, stitching guides, fabric guides, and style inspiration on the LaraibCreative blog.',
    url: `${SITE_URL}/blog`,
    siteName: 'LaraibCreative',
    locale: 'en_PK',
    images: [
      {
        url: `${SITE_URL}/images/og-blog.jpg`,
        width: 1200,
        height: 630,
        alt: 'LaraibCreative Blog - Fashion Tips & Guides',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Fashion Tips & Guides | LaraibCreative',
    description: 'Read expert fashion tips, stitching guides, fabric guides, and style inspiration on the LaraibCreative blog.',
    images: [`${SITE_URL}/images/og-blog.jpg`],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
};

/**
 * Blog List Page - Server Component Wrapper
 * Renders client component for interactivity
 */
export default function BlogPage() {
  return <BlogClient />;
}