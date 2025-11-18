/** @type {import('next').NextConfig} */
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
    // Optimize images on-demand (ISR)
    unoptimized: false,
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Use AVIF format for smaller sizes
    formats: ['image/avif', 'image/webp'],
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
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_API_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
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
        // Rewrite API calls to backend
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
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
    // Continue build even with lint errors (set to false in production)
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
