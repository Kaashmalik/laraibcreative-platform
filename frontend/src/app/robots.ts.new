/**
 * Robots.txt Generation
 * Controls crawler access for SEO
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com'}/sitemap.xml`,
  };
}
