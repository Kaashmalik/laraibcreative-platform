export const dynamic = 'force-dynamic';
import { SITE_URL } from '@/lib/constants';
import FAQClient from './FAQClient';

/**
 * FAQ Page Metadata
 * Production-ready SEO metadata following Next.js 14 best practices
 */
export const metadata = {
  title: 'FAQ | Frequently Asked Questions | LaraibCreative',
  description: 'Find answers to common questions about custom stitching, measurements, delivery, returns, and orders at LaraibCreative. Get help with your fashion queries.',
  keywords: [
    'FAQ custom stitching',
    'stitching questions',
    'measurement guide',
    'delivery information',
    'return policy',
    'order tracking',
    'custom stitching help',
    'fashion FAQ Pakistan'
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
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    type: 'website',
    title: 'FAQ - Frequently Asked Questions | LaraibCreative',
    description: 'Find answers to common questions about custom stitching, measurements, delivery, returns, and orders at LaraibCreative.',
    url: `${SITE_URL}/faq`,
    siteName: 'LaraibCreative',
    locale: 'en_PK',
    images: [
      {
        url: `${SITE_URL}/images/og-faq.jpg`,
        width: 1200,
        height: 630,
        alt: 'LaraibCreative FAQ - Frequently Asked Questions',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Frequently Asked Questions | LaraibCreative',
    description: 'Find answers to common questions about custom stitching, measurements, delivery, returns, and orders.',
    images: [`${SITE_URL}/images/og-faq.jpg`],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
};

/**
 * FAQ Page - Server Component Wrapper
 * Renders client component for interactivity
 */
export default function FAQPage() {
  return <FAQClient />;
}