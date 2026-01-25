/** @type {import('next').NextConfig} */
// Temporarily disabled next-intl as [locale] routing is disabled
// const createNextIntlPlugin = require('next-intl/plugin');
// const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  // ==================================================
  // PRODUCTION-READY NEXT.JS CONFIGURATION
  // ==================================================

  // Output format for deployment
  output: 'standalone',

  // ==================================================
  // PAGE GENERATION SETTINGS
  // ==================================================
  // Increase timeout to 10 minutes for initial build
  staticPageGenerationTimeout: 600,

  // Dynamic rendering strategy
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    esmExternals: true,
    // Partial Prerendering (PPR) - Only available in Next.js 15 canary
    // ppr: true, // Disabled for Next.js 14 compatibility
  },

  // ==================================================
  // IMAGE OPTIMIZATION
  // ==================================================
  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'laraibcreative.studio' },
      { protocol: 'https', hostname: 'www.laraibcreative.studio' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'laraibcreative.com' },
      { protocol: 'https', hostname: 'www.laraibcreative.com' },
      { protocol: 'https', hostname: 'laraibcreative-backend.onrender.com' },
      { protocol: 'https', hostname: 'api.laraibcreative.com' },
    ],
    // Cloudinary loader for automatic optimization
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    // Optimize images on-demand (ISR)
    unoptimized: false,
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Use AVIF format for smaller sizes (better compression)
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Content Disposition
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ==================================================
  // COMPRESSION & PERFORMANCE
  // ==================================================
  compress: true,

  // ==================================================
  // ENVIRONMENT VARIABLES
  // ==================================================
  env: {
    // These variables are available in Node.js
    BUILD_TIME: new Date().toISOString(),
    API_VERSION: 'v1',
  },

  // ==================================================
  // HEADERS & SECURITY
  // ==================================================
  async headers() {
    return [
      // API CORS headers
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_API_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // Static assets - aggressive caching (1 year)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Images - cache for 1 week
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      // Fonts - cache for 1 year
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Product pages - cache for 5 minutes, revalidate in background
      {
        source: '/products/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' },
        ],
      },
      // Category pages - cache for 10 minutes
      {
        source: '/category/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, stale-while-revalidate=1200' },
        ],
      },
      // Home page - cache for 2 minutes
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=120, stale-while-revalidate=300' },
        ],
      },
      // Security headers for all pages
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
    ];
  },

  // ==================================================
  // REDIRECTS & REWRITES
  // ==================================================
  async redirects() {
    return [
      // Redirect old URLs to new ones if needed
      {
        source: '/shop',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/custom-order',
        permanent: true,
      },
    ];
  },

  // ==================================================
  // REWRITES FOR API PROXY
  // ==================================================
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite API calls to backend EXCEPT /api/trpc (which is handled by Next.js)
        {
          source: '/api/v1/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}/api/v1/:path*`,
        },
      ],
    };
  },

  // ==================================================
  // WEBPACK OPTIMIZATION
  // ==================================================
  webpack: (config, { isServer }) => {
    // Simplify chunk splitting to avoid conflicts
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              test: /node_modules/,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // ==================================================
  // LOGGING
  // ==================================================
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // ==================================================
  // TRAILING SLASH
  // ==================================================
  trailingSlash: false,

  // ==================================================
  // SWCMINIFY (enabled by default in Next.js 13+)
  // ==================================================
  swcMinify: true,

  // ==================================================
  // REACT STRICT MODE
  // ==================================================
  reactStrictMode: true,

  // ==================================================
  // INTERNATIONALIZATION (if needed)
  // ==================================================
  // i18n: {
  //   locales: ['en', 'ur'],
  //   defaultLocale: 'en',
  // },

  // ==================================================
  // TYPESCRIPT
  // ==================================================
  typescript: {
    // Continue build even with type errors (set to false in production)
    ignoreBuildErrors: false,
  },

  // ==================================================
  // ESLINT
  // ==================================================
  eslint: {
    // Disable linting during production builds to allow deployment
    // Lint errors should be caught in CI/CD pipeline
    ignoreDuringBuilds: true,
  },
};

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Temporarily disabled next-intl wrapper
module.exports = withBundleAnalyzer(nextConfig);
