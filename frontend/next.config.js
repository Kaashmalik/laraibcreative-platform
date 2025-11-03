/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Increase timeout significantly
  staticPageGenerationTimeout: 300,
  // Enable standalone output
  output: 'standalone',
  // Optimize images
  images: {
    domains: ['localhost'],
    unoptimized: true, // Temporarily disable image optimization during build
  },
}

module.exports = nextConfig
