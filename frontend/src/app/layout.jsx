import "./globals.css"
import { Inter, Playfair_Display } from 'next/font/google';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// ==========================================
// FONT OPTIMIZATION
// ==========================================
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true,
});

// ==========================================
// METADATA CONFIGURATION
// ==========================================
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.studio';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LaraibCreative - Custom Ladies Suits Stitching Online | Designer Wear Pakistan',
    template: '%s | LaraibCreative'
  },
  description: 'Transform your vision into beautiful reality. Expert custom stitched ladies suits, bridal wear, party suits with perfect measurements. Fast delivery across Pakistan. 500+ happy customers. Order now!',
  keywords: [
    'custom stitching Pakistan',
    'ladies suit stitching online',
    'designer replica stitching',
    'bridal wear online Pakistan',
    'party suits Lahore',
    'custom tailoring Pakistan',
    'online stitching service',
    'ladies suit stitching Lahore',
    'designer wear Pakistan',
    'custom made suits Pakistan',
    'wedding dress stitching',
    'Pakistani suit stitching'
  ],
  authors: [{ name: 'LaraibCreative', url: siteUrl }],
  creator: 'LaraibCreative',
  publisher: 'LaraibCreative',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'LaraibCreative - Custom Ladies Suits Stitching Online | #1 in Pakistan',
    description: 'We turn your thoughts & emotions into reality and happiness. Get custom stitched designer suits delivered to your door. 98% customer satisfaction rate.',
    url: siteUrl,
    siteName: 'LaraibCreative',
    images: [
      {
        url: `${siteUrl}/images/og-homepage.jpg`,
        width: 1200,
        height: 630,
        alt: 'LaraibCreative - Custom Stitching Services',
      },
      {
        url: `${siteUrl}/images/og-homepage-square.jpg`,
        width: 800,
        height: 800,
        alt: 'LaraibCreative Services',
      }
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaraibCreative - Custom Ladies Suits Stitching',
    description: 'Transform your vision into beautiful reality with custom stitched designer suits. Fast delivery across Pakistan.',
    images: [`${siteUrl}/images/og-homepage.jpg`],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-PK': siteUrl,
      'ur-PK': `${siteUrl}/ur`,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
  },
  category: 'fashion',
  applicationName: 'LaraibCreative',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D946A6' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' },
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

// ==========================================
// ROOT LAYOUT COMPONENT
// ==========================================
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LaraibCreative',
              url: siteUrl,
              logo: `${siteUrl}/images/logo.svg`,
              description: 'Custom ladies suits stitching and designer wear in Pakistan',
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
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          {children}
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  )
}