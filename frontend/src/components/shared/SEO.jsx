'use client';

import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';

/**
 * Comprehensive SEO Component for LaraibCreative
 * Handles all meta tags, Open Graph, Twitter Cards, and Structured Data
 * Optimized for Google, Bing, and social media platforms
 * 
 * @component
 * @example
 * // Basic page SEO
 * <SEO
 *   title="Custom Stitching Services"
 *   description="Get your custom suits stitched online with perfect measurements"
 * />
 * 
 * // Product page with structured data
 * <SEO
 *   title={product.title}
 *   description={product.description}
 *   image={product.images[0]}
 *   type="product"
 *   structuredData={generateProductSchema(product)}
 * />
 * 
 * // Blog article with full metadata
 * <SEO
 *   title={article.title}
 *   description={article.excerpt}
 *   image={article.featuredImage}
 *   type="article"
 *   author={article.author.name}
 *   publishedTime={article.publishDate}
 *   structuredData={generateArticleSchema(article)}
 * />
 */
const SEO = ({
  title,
  description,
  canonical,
  image = '/images/og-default.jpg',
  type = 'website',
  structuredData,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  category,
  tags = [],
  price,
  currency = 'PKR',
  availability = 'in stock'
}) => {
  const pathname = usePathname();
  
  // Site configuration
  const siteConfig = {
    name: 'LaraibCreative',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com',
    defaultTitle: 'LaraibCreative - Custom Ladies Suits Stitching Online',
    titleTemplate: '%s | LaraibCreative',
    description: 'Transform your vision into beautiful reality. Custom ladies suits, designer replicas, and bridal wear with perfect measurements. Fast delivery across Pakistan.',
    social: {
      twitter: '@laraibcreative',
      facebook: 'https://facebook.com/laraibcreative',
      instagram: 'https://instagram.com/laraibcreative',
      pinterest: 'https://pinterest.com/laraibcreative'
    },
    locale: 'en_US',
    alternateLocale: 'ur_PK',
    businessPhone: '+92-XXX-XXXXXXX',
    businessEmail: 'laraibcreative.business@gmail.com'
  };

  // Generate full title
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}` 
    : siteConfig.defaultTitle;

  // Generate canonical URL
  const canonicalUrl = canonical || `${siteConfig.url}${pathname}`;

  // Generate absolute image URL
  const absoluteImage = image?.startsWith('http') 
    ? image 
    : `${siteConfig.url}${image}`;

  // Robots meta content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1'
  ].join(', ');

  // Default keywords for Pakistani market
  const defaultKeywords = [
    'custom stitching',
    'ladies suits pakistan',
    'designer replica',
    'bridal wear',
    'online tailoring',
    'stitching services',
    'lahore fashion'
  ];

  // Combine keywords
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];
  const keywordsString = allKeywords.join(', ');

  return (
    <>
      {/* ==================== Basic Meta Tags ==================== */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Viewport & Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#D946A6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="LaraibCreative" />

      {/* Format Detection */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="format-detection" content="email=yes" />
      <meta name="format-detection" content="address=yes" />

      {/* ==================== Open Graph / Facebook ==================== */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:secure_url" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || siteConfig.name} />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:locale:alternate" content={siteConfig.alternateLocale} />

      {/* Article-specific OG tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {category && <meta property="article:section" content={category} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product-specific OG tags */}
      {type === 'product' && (
        <>
          {price && (
            <>
              <meta property="product:price:amount" content={price} />
              <meta property="product:price:currency" content={currency} />
            </>
          )}
          {availability && <meta property="product:availability" content={availability} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* ==================== Twitter Card ==================== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.social.twitter} />
      <meta name="twitter:creator" content={siteConfig.social.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={title || siteConfig.name} />

      {/* ==================== Geographic & Language ==================== */}
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />
      <meta name="geo.position" content="31.5204;74.3587" /> {/* Lahore coords */}
      <meta name="ICBM" content="31.5204, 74.3587" />
      <meta name="language" content="English" />
      <meta httpEquiv="content-language" content="en-PK" />

      {/* ==================== Additional SEO Meta Tags ==================== */}
      <meta name="rating" content="General" />
      <meta name="distribution" content="Global" />
      <meta name="revisit-after" content="7 days" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />

      {/* ==================== Favicon & Icons ==================== */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#D946A6" />
      <meta name="msapplication-TileColor" content="#D946A6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* ==================== Performance Optimization ==================== */}
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://res.cloudinary.com" />
      
      {/* DNS Prefetch for analytics and CDNs */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

      {/* ==================== Structured Data (JSON-LD) ==================== */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Base Organization Schema (always included) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${siteConfig.url}/#organization`,
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
              '@type': 'ImageObject',
              url: `${siteConfig.url}/images/logo.svg`,
              width: 250,
              height: 60
            },
            description: siteConfig.description,
            email: siteConfig.businessEmail,
            telephone: siteConfig.businessPhone,
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'PK',
              addressRegion: 'Punjab',
              addressLocality: 'Lahore'
            },
            sameAs: [
              siteConfig.social.facebook,
              siteConfig.social.instagram,
              siteConfig.social.pinterest
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              telephone: siteConfig.businessPhone,
              email: siteConfig.businessEmail,
              availableLanguage: ['English', 'Urdu'],
              areaServed: 'PK'
            }
          }),
        }}
      />

      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${siteConfig.url}/#website`,
            url: siteConfig.url,
            name: siteConfig.name,
            description: siteConfig.description,
            publisher: {
              '@id': `${siteConfig.url}/#organization`
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          }),
        }}
      />
    </>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  canonical: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.oneOf(['website', 'article', 'product', 'profile']),
  structuredData: PropTypes.object,
  keywords: PropTypes.arrayOf(PropTypes.string),
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
  category: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  availability: PropTypes.string
};

export default SEO;

// ==================== Helper Functions ====================

/**
 * Generate Product Schema for e-commerce products
 */
export const generateProductSchema = (product) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/products/${product.slug}#product`,
    name: product.title,
    description: product.description,
    image: product.images || [],
    sku: product.sku || product.id,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'LaraibCreative'
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.pricing?.basePrice || product.price || 0,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.availability === 'in-stock' || product.inStock
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'LaraibCreative'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PKR'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 14,
            unitCode: 'DAY'
          }
        }
      }
    },
    ...(product.reviews && product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: calculateAverageRating(product.reviews),
        reviewCount: product.reviews.length,
        bestRating: 5,
        worstRating: 1
      },
      review: product.reviews.slice(0, 5).map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.userName || 'Anonymous'
        },
        datePublished: review.createdAt,
        reviewBody: review.comment,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        }
      }))
    }),
    ...(product.category && {
      category: product.category
    })
  };
};

/**
 * Generate Article Schema for blog posts
 */
export const generateArticleSchema = (article) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${baseUrl}/blog/${article.slug}#article`,
    headline: article.title,
    description: article.excerpt || article.description,
    image: article.featuredImage || article.image,
    datePublished: article.publishDate || article.createdAt,
    dateModified: article.updatedAt || article.publishDate || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'LaraibCreative Team',
      url: article.author?.url
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'LaraibCreative',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.svg`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`
    },
    ...(article.category && {
      articleSection: article.category
    }),
    ...(article.tags && {
      keywords: article.tags.join(', ')
    }),
    wordCount: article.content?.split(/\s+/).length || 0,
    inLanguage: 'en-PK'
  };
};

/**
 * Generate BreadcrumbList Schema for navigation
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label || crumb.name,
      item: `${baseUrl}${crumb.href || crumb.path}`
    }))
  };
};

/**
 * Generate FAQPage Schema for FAQ sections
 */
export const generateFAQSchema = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Generate LocalBusiness Schema
 */
export const generateLocalBusinessSchema = (business = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#localbusiness`,
    name: 'LaraibCreative',
    image: `${baseUrl}/images/logo.svg`,
    url: baseUrl,
    telephone: business.phone || '+92-XXX-XXXXXXX',
    email: business.email || 'laraibcreative.business@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || 'Lahore',
      addressLocality: business.city || 'Lahore',
      addressRegion: business.province || 'Punjab',
      postalCode: business.postalCode || '54000',
      addressCountry: 'PK'
    },
    ...(business.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.coordinates.lat,
        longitude: business.coordinates.lng
      }
    }),
    ...(business.hours && {
      openingHoursSpecification: business.hours.map(hour => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hour.day,
        opens: hour.open,
        closes: hour.close
      }))
    }),
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, COD',
    currenciesAccepted: 'PKR'
  };
};

/**
 * Generate Review Schema
 */
export const generateReviewSchema = (reviews, itemName) => {
  if (!reviews || reviews.length === 0) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: calculateAverageRating(reviews),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1
    }
  };
};

/**
 * Helper: Calculate average rating
 */
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return (total / reviews.length).toFixed(1);
};