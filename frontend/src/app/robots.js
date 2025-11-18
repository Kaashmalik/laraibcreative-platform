// ==========================================
// ROBOTS.TXT GENERATION
// ==========================================
// Generates robots.txt for search engine crawlers
// ==========================================

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.studio';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/account/',
          '/checkout/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/account/',
          '/checkout/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

