import "./globals.css"

// Disable static generation for pages with interactive content
export const dynamic = 'force-dynamic';

export const metadata = {
  title: {
    default: 'LaraibCreative - Custom Ladies Suits Stitching Online | Designer Wear Pakistan',
    template: '%s | LaraibCreative'
  },
  metadataBase: new URL('https://laraibcreative.studio'),
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
  authors: [{ name: 'LaraibCreative' }],
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
        url: '/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'LaraibCreative - Custom Stitching Services',
      },
      {
        url: '/images/og-homepage-square.jpg',
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
    images: ['/images/og-homepage.jpg'],
    creator: '@laraibcreative',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'fashion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}