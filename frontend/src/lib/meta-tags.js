/**
 * Dynamic Meta Tags Utility
 * Helper functions for generating SEO-optimized meta tags
 * Supports Next.js 14 metadata API and client-side Head component
 */

import { SITE_URL } from './constants';

/**
 * Generate metadata object for Next.js 14 pages
 * @param {Object} options - Meta tag options
 * @returns {Object} Metadata object
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  noindex = false,
  canonical
}) {
  const fullTitle = title ? `${title} | LaraibCreative` : 'LaraibCreative - Custom Ladies Suits Stitching Online';
  const fullDescription = description || 'Transform your vision into beautiful reality. Expert custom stitched ladies suits, ready-made suits, brand replicas, and hand-made karhai suits. Fast delivery across Pakistan.';
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const ogImage = image || `${SITE_URL}/images/og-default.jpg`;

  // Default keywords for suit types
  const defaultKeywords = [
    'ready-made ladies suits Pakistan',
    'brand replica stitching online',
    'hand-made karhai suits Lahore',
    'custom stitching Pakistan',
    'ladies suit stitching online',
    'designer replica stitching',
    'Pakistani fashion',
    'custom tailoring Pakistan'
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    alternates: {
      canonical: canonical || fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: 'LaraibCreative',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || 'LaraibCreative',
        },
      ],
      locale: 'en_PK',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
      creator: '@laraibcreative',
      site: '@laraibcreative',
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate meta tags for admin pages
 * @param {Object} options - Meta tag options
 * @returns {Object} Metadata object
 */
export function generateAdminMetadata({
  title,
  description,
  noindex = true
}) {
  const fullTitle = title ? `${title} | Admin | LaraibCreative` : 'Admin Dashboard | LaraibCreative';

  return {
    title: fullTitle,
    description: description || 'Admin dashboard for LaraibCreative management panel',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  };
}

/**
 * Generate category-specific metadata
 * @param {Object} category - Category object
 * @returns {Object} Metadata object
 */
export function generateCategoryMetadata(category) {
  if (!category) {
    return generateMetadata({
      title: 'Categories',
      description: 'Browse our collection of custom stitched ladies suits',
    });
  }

  const categoryName = category.name || 'Category';
  const keywords = [
    categoryName,
    `${categoryName} suits`,
    `${categoryName} stitching`,
    'custom stitching',
    'Pakistani fashion',
    ...(category.seo?.keywords || [])
  ];

  return generateMetadata({
    title: `${categoryName} Collection`,
    description: category.description || category.seo?.metaDescription || `Browse our ${categoryName.toLowerCase()} collection. Premium quality custom stitched suits.`,
    keywords,
    url: `/categories/${category.slug}`,
    image: category.image,
  });
}

/**
 * Generate product-specific metadata
 * @param {Object} product - Product object
 * @returns {Object} Metadata object
 */
export function generateProductMetadata(product) {
  if (!product) {
    return generateMetadata({
      title: 'Product',
      description: 'View product details',
    });
  }

  const productTitle = product.title || product.name || 'Product';
  const keywords = [
    productTitle,
    'custom stitching',
    'ladies suits',
    product.fabric?.type || '',
    product.occasion || '',
    ...(product.seo?.keywords || [])
  ].filter(Boolean);

  return generateMetadata({
    title: productTitle,
    description: product.description || product.shortDescription || product.seo?.metaDescription || `Shop ${productTitle} at LaraibCreative. Premium quality custom stitched suit.`,
    keywords,
    url: `/products/${product.slug || product._id}`,
    image: product.primaryImage || product.images?.[0],
    type: 'product',
  });
}

