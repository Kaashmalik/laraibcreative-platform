export const dynamic = 'force-dynamic';
import { SITE_URL } from '@/lib/constants';
import ContactClient from './ContactClient';

/**
 * Contact Page Metadata
 * Production-ready SEO metadata following Next.js 14 best practices
 */
export const metadata = {
  title: 'Contact Us | LaraibCreative',
  description: 'Get in touch with LaraibCreative. Have questions about custom stitching, measurements, or orders? Contact us via WhatsApp, phone, or email. We\'re here to help!',
  keywords: [
    'contact LaraibCreative',
    'custom stitching contact',
    'tailoring services Lahore',
    'fashion consultation',
    'order inquiry Pakistan',
    'WhatsApp fashion service',
    'custom stitching help'
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
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    type: 'website',
    title: 'Contact Us - LaraibCreative | Get in Touch',
    description: 'Get in touch with LaraibCreative. Have questions about custom stitching, measurements, or orders? Contact us via WhatsApp, phone, or email.',
    url: `${SITE_URL}/contact`,
    siteName: 'LaraibCreative',
    locale: 'en_PK',
    images: [
      {
        url: `${SITE_URL}/images/og-contact.jpg`,
        width: 1200,
        height: 630,
        alt: 'Contact LaraibCreative - Custom Stitching Services',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - LaraibCreative',
    description: 'Get in touch with LaraibCreative. Have questions about custom stitching? Contact us via WhatsApp, phone, or email.',
    images: [`${SITE_URL}/images/og-contact.jpg`],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
};

/**
 * Contact Page - Server Component Wrapper
 * Renders client component for interactivity
 */
export default function ContactPage() {
  return <ContactClient />;
}