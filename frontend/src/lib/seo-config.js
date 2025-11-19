/**
 * SEO Configuration and Helper Functions
 * Production-ready SEO utilities for optimal search engine visibility
 * Includes metadata generation, structured data, and SEO best practices
 */

import { SITE_URL, SEO_DEFAULTS, SITE_NAME } from './constants';

/**
 * Generate complete page metadata for Next.js
 * @param {Object} options - Page metadata options
 * @returns {Object} - Complete metadata object for Next.js
 */
export function generateMetadata(options = {}) {
  const {
    title,
    description = SEO_DEFAULTS.description,
    image = `${SITE_URL}/images/og-default.jpg`,
    url = SITE_URL,
    type = 'website',
    keywords = [],
    author,
    noindex = false,
    publishedTime,
    modifiedTime,
    section,
    tags = []
  } = options;

  const fullTitle = title 
    ? `${title} | ${SITE_NAME}` 
    : SEO_DEFAULTS.defaultTitle;

  const metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: !noindex,
      follow: !noindex,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_PK',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@laraibcreative',
      site: '@laraibcreative',
    },
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime || section || tags.length > 0)) {
    metadata.openGraph.article = {
      publishedTime,
      modifiedTime,
      section,
      tags,
      authors: author ? [author] : [],
    };
  }

  return metadata;
}

/**
 * Generate product metadata with rich snippets
 * @param {Object} product - Product data
 * @returns {Object} - Product metadata with structured data
 */
export function generateProductMetadata(product) {
  if (!product) return generateMetadata();

  const productUrl = `${SITE_URL}/products/${product.slug || product.id}`;
  const keywords = [
    product.title,
    product.category,
    product.fabric,
    product.occasion,
    'Pakistan fashion',
    'custom stitching',
    'Pakistani clothing',
    'ready to wear',
    'online shopping Pakistan'
  ].filter(Boolean);

  const metadata = generateMetadata({
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description?.substring(0, 160) || `Shop ${product.title} at LaraibCreative. Premium quality Pakistani fashion with custom stitching options.`,
    image: product.images?.[0] || `${SITE_URL}/images/placeholder.png`,
    url: productUrl,
    type: 'product',
    keywords
  });

  // Add Product structured data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images || [],
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      }
    }
  };

  // Add aggregate rating if available
  if (product.rating && product.reviewCount > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  // Add reviews if available
  if (product.reviews && product.reviews.length > 0) {
    structuredData.review = product.reviews.slice(0, 5).map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.customerName || 'Customer'
      },
      datePublished: review.createdAt,
      reviewBody: review.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      }
    }));
  }

  return {
    ...metadata,
    structuredData
  };
}

/**
 * Generate blog post metadata with article schema
 * @param {Object} post - Blog post data
 * @returns {Object} - Blog post metadata with structured data
 */
export function generateBlogMetadata(post) {
  if (!post) return generateMetadata();

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const keywords = [
    ...(post.tags || []),
    'fashion blog',
    'Pakistan fashion',
    'clothing guide',
    'style tips',
    'fashion trends'
  ];

  const metadata = generateMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.content?.substring(0, 160),
    image: post.featuredImage || `${SITE_URL}/images/blog-default.jpg`,
    url: postUrl,
    type: 'article',
    keywords,
    author: post.author || SITE_NAME,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    section: post.category,
    tags: post.tags || []
  });

  // Add BlogPosting structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author || SITE_NAME
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    keywords: keywords.join(', '),
    articleBody: post.content
  };

  // Add word count and reading time
  if (post.content) {
    const wordCount = post.content.split(/\s+/).length;
    structuredData.wordCount = wordCount;
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);
    metadata.readingTime = `${readingTime} min read`;
  }

  return {
    ...metadata,
    structuredData
  };
}

/**
 * Generate breadcrumb structured data
 * @param {Array} items - Breadcrumb items [{name, url}]
 * @returns {Object} - Breadcrumb JSON-LD
 */
export function generateBreadcrumbStructuredData(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined
    }))
  };
}

/**
 * Generate organization structured data
 * @returns {Object} - Organization JSON-LD
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: SEO_DEFAULTS.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      addressCountry: 'PK'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+92-302-0718182',
        contactType: 'Customer Service',
        availableLanguage: ['English', 'Urdu'],
        areaServed: 'PK'
      },
      {
        '@type': 'ContactPoint',
        telephone: '+92-302-0718182',
        contactType: 'Sales',
        availableLanguage: ['English', 'Urdu'],
        areaServed: 'PK'
      }
    ],
    sameAs: [
      'https://facebook.com/laraibcreative',
      'https://instagram.com/laraibcreative',
      'https://twitter.com/laraibcreative',
      'https://pinterest.com/laraibcreative'
    ]
  };
}

/**
 * Generate website structured data
 * @returns {Object} - WebSite JSON-LD with sitelinks search box
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SEO_DEFAULTS.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generate FAQ structured data
 * @param {Array} faqs - FAQ items [{question, answer}]
 * @returns {Object} - FAQ JSON-LD
 */
export function generateFAQStructuredData(faqs) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate local business structured data
 * @returns {Object} - LocalBusiness JSON-LD
 */
export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: SITE_NAME,
    image: `${SITE_URL}/images/logo.png`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: '+92-300-1234567',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Your Street Address',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      postalCode: '54000',
      addressCountry: 'PK'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 31.5204,
      longitude: 74.3587
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        opens: '10:00',
        closes: '20:00'
      }
    ],
    sameAs: [
      'https://facebook.com/laraibcreative',
      'https://instagram.com/laraibcreative'
    ]
  };
}

/**
 * Generate sitemap URLs for products
 * @param {Array} products - Array of products
 * @returns {Array} - Sitemap URL objects
 */
export function generateProductSitemapUrls(products) {
  return products.map(product => ({
    url: `/products/${product.slug || product.id}`,
    lastModified: product.updatedAt || product.createdAt || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
    images: product.images?.map(img => ({
      url: img,
      title: product.title,
      caption: product.description?.substring(0, 100)
    })) || []
  }));
}

/**
 * Generate canonical URL (removes query params)
 * @param {string} path - URL path
 * @returns {string} - Canonical URL
 */
export function generateCanonicalUrl(path) {
  const cleanPath = path.split('?')[0].split('#')[0];
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Extract keywords from text using basic NLP
 * @param {string} text - Text to extract keywords from
 * @param {number} limit - Maximum number of keywords
 * @returns {Array} - Array of keywords
 */
export function extractKeywords(text, limit = 10) {
  if (!text) return [];

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'much', 'now'
  ]);

  // Extract words, remove stop words, and count frequency
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Optimize image alt text for SEO
 * @param {string} filename - Image filename
 * @param {string} context - Context/description
 * @returns {string} - Optimized alt text
 */
export function generateImageAlt(filename, context = '') {
  if (!filename) return context || 'Image';

  const name = filename
    .replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\d+/g, '')
    .trim();

  if (context && name) {
    return `${context} - ${name}`;
  }

  return context || name || 'Image';
}

/**
 * Generate robots meta tag content
 * @param {Object} options - Robot options
 * @returns {string} - Robots content string
 */
export function generateRobots(options = {}) {
  const {
    index = true,
    follow = true,
    noarchive = false,
    nosnippet = false,
    noimageindex = false,
    maxSnippet,
    maxImagePreview = 'large',
    maxVideoPreview
  } = options;

  const directives = [
    index ? 'index' : 'noindex',
    follow ? 'follow' : 'nofollow'
  ];

  if (noarchive) directives.push('noarchive');
  if (nosnippet) directives.push('nosnippet');
  if (noimageindex) directives.push('noimageindex');
  if (maxSnippet) directives.push(`max-snippet:${maxSnippet}`);
  if (maxImagePreview) directives.push(`max-image-preview:${maxImagePreview}`);
  if (maxVideoPreview) directives.push(`max-video-preview:${maxVideoPreview}`);

  return directives.join(', ');
}

/**
 * Generate social media share URLs
 * @param {string} url - Page URL
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @returns {Object} - Social share URLs
 */
export function generateShareUrls(url, title, description = '') {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`
  };
}

/**
 * Calculate reading time for content
 * @param {string} content - Content text
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {Object} - Reading time info
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return { minutes: 0, words: 0 };

  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return {
    minutes,
    words,
    text: `${minutes} min read`
  };
}

const seoConfig = {
  generateMetadata,
  generateProductMetadata,
  generateBlogMetadata,
  generateBreadcrumbStructuredData,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
  generateFAQStructuredData,
  generateLocalBusinessStructuredData,
  generateProductSitemapUrls,
  generateCanonicalUrl,
  extractKeywords,
  generateImageAlt,
  generateRobots,
  generateShareUrls,
  calculateReadingTime
};

export default seoConfig;