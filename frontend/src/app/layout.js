import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import SEO from '@/components/shared/SEO'

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
export const metadata = {
  metadataBase: new URL('https://laraibcreative.com'),
  title: {
    default: 'LaraibCreative - Custom Ladies Suits Stitching Online | Designer Wear Pakistan',
    template: '%s | LaraibCreative'
  },
  description: 'Get custom stitched ladies suits online. Designer replicas, bridal wear, party suits with perfect measurements. Fast delivery across Pakistan.',
  keywords: ['custom stitching Pakistan', 'ladies suit stitching', 'designer replica stitching', 'bridal wear Pakistan', 'online tailoring Lahore'],
  authors: [{ name: 'LaraibCreative' }],
  creator: 'LaraibCreative',
  publisher: 'LaraibCreative',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://laraibcreative.com',
    title: 'LaraibCreative - Transform Your Vision Into Beautiful Reality',
    description: 'Custom stitched ladies suits with perfect fit. Designer replicas, bridal & party wear. Order online with easy payment.',
    siteName: 'LaraibCreative',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LaraibCreative - Custom Stitching Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaraibCreative - Custom Ladies Suits Stitching',
    description: 'Get custom stitched ladies suits online. Designer replicas, bridal wear, party suits.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D946A6' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' },
  ],
}

/**
 * Root Layout Component
 * 
 * Features:
 * - Context Providers (Auth, Cart, Toast)
 * - Font optimization with next/font
 * - SEO metadata configuration
 * - Global styles
 * - Accessibility setup
 */
export default function RootLayout({ children }) {
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
        
        {/* DNS Prefetch for faster connections */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className="font-sans antialiased bg-white text-gray-900"
        suppressHydrationWarning
      >
        {/* Context Providers */}
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {/* Skip to main content for accessibility */}
              <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
              >
                Skip to main content
              </a>

              {/* Main application content */}
              {children}

              {/* Global scripts */}
              {/* Google Analytics - Replace with your GA4 ID */}
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

              {/* Facebook Pixel - Replace with your Pixel ID */}
              {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      !function(f,b,e,v,n,t,s)
                      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
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
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}