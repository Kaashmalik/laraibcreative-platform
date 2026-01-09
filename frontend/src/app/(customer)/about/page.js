export const dynamic = 'force-dynamic';
import { SITE_URL } from '@/lib/constants';
import AboutClient from './AboutClient';

/**
 * About Page Metadata
 * Production-ready SEO metadata following Next.js 14 best practices
 */
export const metadata = {
  title: 'About Us | LaraibCreative',
  description: 'Learn about LaraibCreative - Pakistan\'s trusted custom stitching service. We turn your thoughts & emotions into beautiful reality. 5000+ happy customers, 5 years of excellence.',
  keywords: [
    'about LaraibCreative',
    'custom stitching Pakistan',
    'tailoring services Lahore',
    'Pakistani fashion brand',
    'designer wear Pakistan',
    'bridal wear stitching',
    'fashion company Pakistan'
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
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    type: 'website',
    title: 'About Us - LaraibCreative | Custom Stitching Excellence',
    description: 'Learn about LaraibCreative - Pakistan\'s trusted custom stitching service. We turn your thoughts & emotions into beautiful reality. 5000+ happy customers.',
    url: `${SITE_URL}/about`,
    siteName: 'LaraibCreative',
    locale: 'en_PK',
    images: [
      {
        url: `${SITE_URL}/images/og-about.jpg`,
        width: 1200,
        height: 630,
        alt: 'About LaraibCreative - Custom Stitching Services',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - LaraibCreative',
    description: 'Learn about LaraibCreative - Pakistan\'s trusted custom stitching service. 5000+ happy customers, 5 years of excellence.',
    images: [`${SITE_URL}/images/og-about.jpg`],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
};

/**
 * About Page - Server Component Wrapper
 * Renders client component for interactivity
 */
export default function AboutPage() {
  return <AboutClient />;
}