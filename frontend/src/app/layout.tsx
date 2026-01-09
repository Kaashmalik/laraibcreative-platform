import { Inter, Playfair_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import CartProvider from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import { Toaster } from 'react-hot-toast'
import GlobalErrorBoundary from '@/components/shared/GlobalErrorBoundary'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// Root metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://laraibcreative.studio'),
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
  authors: [{ name: 'LaraibCreative', url: 'https://laraibcreative.studio' }],
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
    url: 'https://laraibcreative.studio',
    siteName: 'LaraibCreative',
    images: [
      {
        url: 'https://laraibcreative.studio/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'LaraibCreative - Custom Stitching Services',
      },
      {
        url: 'https://laraibcreative.studio/images/og-homepage-square.jpg',
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
    images: ['https://laraibcreative.studio/images/og-homepage.jpg'],
    creator: '@laraibcreative',
    site: '@laraibcreative',
  },
  alternates: {
    canonical: 'https://laraibcreative.studio',
    languages: {
      'en-PK': 'https://laraibcreative.studio',
      'ur-PK': 'https://laraibcreative.studio/ur',
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

// Viewport configuration
export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D946A6' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  // For now, keep the original layout structure
  // i18n will be handled via middleware and [locale] routes
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>


        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LaraibCreative',
              url: 'https://laraibcreative.studio',
              logo: 'https://laraibcreative.studio/images/logo.svg',
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
                'https://wa.me/923038111297'
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased bg-white text-gray-900`}
        suppressHydrationWarning
      >
        <GlobalErrorBoundary>
          <ThemeProvider>
            <ToastProvider>
              <CartProvider>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50">
                  Skip to content
                </a>
                {children}
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
                </CartProvider>
              </ToastProvider>
              {process.env.NEXT_PUBLIC_GA_ID && (
                <>
                  <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                  />
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_path: window.location.pathname,
                      });
                      `,
                    }}
                  />
                </>
              )}
              {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n.arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                    fbq('track', 'PageView');
                  `,
                    }}
                />
              )}
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
