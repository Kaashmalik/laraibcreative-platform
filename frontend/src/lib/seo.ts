/**
 * SEO Utilities
 * Functions for generating meta tags, structured data, and SEO optimization
 */

import { Product } from '@/types/product';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com';
const SITE_NAME = 'LaraibCreative - Premium Pakistani Fashion';

/**
 * Generate meta tags for a product page
 */
export function generateProductMeta(product: Product) {
  const title = product.seo?.title || `${product.title} | ${SITE_NAME}`;
  const description = product.seo?.description || 
    product.description?.substring(0, 160) || 
    `Shop ${product.title} at LaraibCreative. Premium Pakistani fashion with custom stitching options.`;
  
  // Handle image URL from either string or ProductImage object
  let imageUrl = '';
  if (product.primaryImage) {
    if (typeof product.primaryImage === 'string') {
      imageUrl = product.primaryImage;
    } else {
      imageUrl = (product.primaryImage as any).url || '';
    }
  } else if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    } else {
      imageUrl = (firstImage as any).url || '';
    }
  } else if (product.image) {
    imageUrl = String(product.image);
  }
  
  const price = product.pricing?.basePrice || product.price || 0;
  const availability = product.availability?.status === 'in-stock' || product.inStock 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/OutOfStock';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      siteName: SITE_NAME,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': product.pricing?.currency || 'PKR',
      'product:availability': availability,
    },
  };
}

/**
 * Generate meta tags for category page
 */
export function generateCategoryMeta(category: string, description?: string) {
  const title = `${category} | ${SITE_NAME}`;
  const desc = description || `Browse our collection of ${category} at LaraibCreative. Premium Pakistani fashion with custom stitching.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/categories/${category.toLowerCase().replace(/\s+/g, '-')}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  };
}

/**
 * Generate meta tags for homepage
 */
export function generateHomeMeta() {
  return {
    title: `${SITE_NAME} - Premium Pakistani Fashion & Custom Stitching`,
    description: 'Discover exquisite Pakistani fashion at LaraibCreative. Custom stitching, designer replicas, bridal collection, and premium ladies suits.',
    openGraph: {
      title: SITE_NAME,
      description: 'Discover exquisite Pakistani fashion at LaraibCreative. Custom stitching, designer replicas, bridal collection.',
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: 'Discover exquisite Pakistani fashion at LaraibCreative.',
    },
  };
}

/**
 * Generate JSON-LD structured data for a product
 */
export function generateProductStructuredData(product: Product) {
  const price = product.pricing?.basePrice || product.price || 0;
  
  // Handle image URL from either string or ProductImage object
  let imageUrl = '';
  if (product.primaryImage) {
    if (typeof product.primaryImage === 'string') {
      imageUrl = product.primaryImage;
    } else {
      imageUrl = (product.primaryImage as any).url || '';
    }
  } else if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    } else {
      imageUrl = (firstImage as any).url || '';
    }
  } else if (product.image) {
    imageUrl = String(product.image);
  }
  
  const availability = product.availability?.status === 'in-stock' || product.inStock 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: imageUrl,
    description: product.description || product.shortDescription || '',
    sku: product.sku || product.designCode,
    brand: {
      '@type': 'Brand',
      name: 'LaraibCreative',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: product.pricing?.currency || 'PKR',
      price: price,
      availability,
      seller: {
        '@type': 'Organization',
        name: 'LaraibCreative',
        url: SITE_URL,
      },
    },
    aggregateRating: product.averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews || product.reviewCount || 0,
    } : undefined,
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LaraibCreative',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Premium Pakistani fashion and custom stitching services',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-XXX-XXXXXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Urdu'],
    },
    sameAs: [
      'https://www.facebook.com/laraibcreative',
      'https://www.instagram.com/laraibcreative',
    ],
  };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate JSON-LD structured data for breadcrumb
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate robots meta tags
 */
export function generateRobotsMeta(options: {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
} = {}) {
  const {
    index = true,
    follow = true,
    noarchive = false,
    nosnippet = false,
    noimageindex = false,
  } = options;

  const directives: string[] = [];
  if (!index) directives.push('noindex');
  if (!follow) directives.push('nofollow');
  if (noarchive) directives.push('noarchive');
  if (nosnippet) directives.push('nosnippet');
  if (noimageindex) directives.push('noimageindex');

  return {
    robots: directives.join(', ') || 'index, follow',
  };
}
