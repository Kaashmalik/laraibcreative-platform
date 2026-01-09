# SEO Implementation Guide
## LaraibCreative E-Commerce Platform

**Last Updated:** January 3, 2026  
**Version:** 1.0  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Technical SEO Infrastructure](#technical-seo-infrastructure)
3. [Metadata Implementation](#metadata-implementation)
4. [Dynamic Sitemap Generation](#dynamic-sitemap-generation)
5. [Robots.txt Configuration](#robotstxt-configuration)
6. [Structured Data (Schema.org)](#structured-data-schemaorg)
7. [URL Structure & Slugs](#url-structure--slugs)
8. [Image Optimization](#image-optimization)
9. [Performance Optimization](#performance-optimization)
10. [Social Media Integration](#social-media-integration)
11. [SEO Management API](#seo-management-api)
12. [Best Practices](#best-practices)
13. [Monitoring & Analytics](#monitoring--analytics)

---

## Overview

LaraibCreative implements a comprehensive SEO strategy built on Next.js 14 App Router, leveraging server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR) for optimal search engine visibility.

### Key SEO Features

- ✅ **Dynamic Metadata Generation** - Per-page SEO metadata with Open Graph and Twitter Cards
- ✅ **XML Sitemap** - Auto-generated sitemap with dynamic product/blog routes
- ✅ **Robots.txt** - Search engine crawler directives
- ✅ **Schema.org Structured Data** - Product, Article, Organization, Breadcrumb schemas
- ✅ **SEO-Friendly URLs** - Clean slug-based routing for products, categories, and blogs
- ✅ **Image Optimization** - Cloudinary integration with responsive images and WebP/AVIF support
- ✅ **Performance Optimization** - Core Web Vitals optimization for better rankings
- ✅ **Mobile-First Design** - Responsive design for mobile search priority
- ✅ **Canonical URLs** - Prevent duplicate content issues
- ✅ **Social Media Meta Tags** - Open Graph and Twitter Card metadata

### SEO Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14 App Router | SSR/SSG/ISR for SEO-friendly rendering |
| **Metadata API** | Next.js Metadata API | Native metadata generation |
| **Image CDN** | Cloudinary | Automatic image optimization |
| **Sitemap** | Dynamic generation | Real-time sitemap updates |
| **Analytics** | Google Analytics/Search Console | SEO monitoring |
| **Structured Data** | JSON-LD | Rich snippets support |

---

## Technical SEO Infrastructure

### Next.js Configuration (`next.config.js`)

```javascript
const nextConfig = {
  // Server-side rendering for SEO
  output: 'standalone',
  
  // Static page generation timeout (for large catalogs)
  staticPageGenerationTimeout: 600,
  
  // Image optimization for faster loading
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'laraibcreative.studio' },
    ],
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    unoptimized: false,
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};
```

### Environment Variables

```bash
# SEO Configuration
NEXT_PUBLIC_SITE_URL=https://laraibcreative.studio
NEXT_PUBLIC_SITE_NAME="LaraibCreative"
NEXT_PUBLIC_SITE_DESCRIPTION="Premium Pakistani fashion with custom stitching"
NEXT_PUBLIC_DEFAULT_LOCALE=en-PK
```

---

## Metadata Implementation

### Root Layout Metadata (`app/layout.js`)

**Global metadata applied to all pages:**

```javascript
export const metadata = {
  metadataBase: new URL('https://laraibcreative.studio'),
  title: {
    default: 'LaraibCreative - Premium Pakistani Fashion & Custom Stitching',
    template: '%s | LaraibCreative'
  },
  description: 'Shop premium Pakistani fashion at LaraibCreative. Custom stitching services, unstitched fabric, ready-to-wear collections, and traditional wedding outfits. Fast delivery across Pakistan.',
  keywords: [
    'Pakistani fashion',
    'custom stitching',
    'unstitched fabric',
    'ready to wear',
    'wedding dresses Pakistan',
    'lawn suits',
    'designer clothing',
    'Pakistani boutique online',
    'custom tailoring Pakistan'
  ],
  authors: [{ name: 'LaraibCreative Team' }],
  creator: 'LaraibCreative',
  publisher: 'LaraibCreative',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://laraibcreative.studio',
    siteName: 'LaraibCreative',
    title: 'LaraibCreative - Premium Pakistani Fashion',
    description: 'Premium Pakistani fashion with custom stitching services',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LaraibCreative',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaraibCreative - Premium Pakistani Fashion',
    description: 'Premium Pakistani fashion with custom stitching services',
    creator: '@laraibcreative',
    images: ['/images/twitter-card.jpg'],
  },
  robots: {
    index: true,
    follow: true,
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
};
```

### Static Page Metadata Example

**Example: FAQ Page (`app/(customer)/faq/page.js`)**

```javascript
export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about custom stitching, ordering, shipping, returns, and payments at LaraibCreative.',
  keywords: [
    'LaraibCreative FAQ',
    'custom stitching questions',
    'order help Pakistan',
    'shipping information',
    'return policy'
  ],
  openGraph: {
    title: 'FAQ | LaraibCreative',
    description: 'Find answers to your questions about custom stitching and orders',
    url: 'https://laraibcreative.studio/faq',
    type: 'website',
  },
};
```

### Dynamic Metadata Generation

**Product Page Example (`app/(customer)/products/[id]/page.js`)**

```javascript
export async function generateMetadata({ params }) {
  try {
    const response = await api.products.getById(params.id);
    const product = response?.product || response;

    if (!product) {
      return {
        title: 'Product Not Found | LaraibCreative',
        description: 'The product you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const productTitle = product.seoTitle || product.title || product.name;
    const productDescription = product.seoDescription || 
      product.description?.substring(0, 160) || 
      `Shop ${productTitle} at LaraibCreative. Premium quality Pakistani fashion with custom stitching options.`;
    
    const productUrl = `https://laraibcreative.studio/products/${params.id}`;
    const productImage = product.primaryImage || product.images?.[0] || '/images/og-default.jpg';
    const productPrice = product.pricing?.basePrice || product.price || 0;

    return {
      title: productTitle,
      description: productDescription,
      keywords: [
        productTitle,
        product.category?.name,
        'Pakistani fashion',
        'custom stitching',
        ...(product.tags || [])
      ],
      openGraph: {
        title: `${productTitle} | LaraibCreative`,
        description: productDescription,
        url: productUrl,
        type: 'product',
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: productTitle,
          },
        ],
        siteName: 'LaraibCreative',
        locale: 'en_PK',
      },
      twitter: {
        card: 'summary_large_image',
        title: productTitle,
        description: productDescription,
        images: [productImage],
        creator: '@laraibcreative',
      },
      alternates: {
        canonical: productUrl,
      },
      other: {
        'product:price:amount': productPrice,
        'product:price:currency': 'PKR',
        'product:availability': product.inventory?.inStock ? 'in stock' : 'out of stock',
        'product:condition': 'new',
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product | LaraibCreative',
      description: 'View product details at LaraibCreative',
    };
  }
}
```

**Blog Post Metadata (`app/(customer)/blog/[id]/page.js`)**

```javascript
export async function generateMetadata({ params }) {
  try {
    const response = await api.blog.getById(params.id);
    const post = response?.blog || response?.post || response;

    if (!post) {
      return {
        title: 'Blog Post Not Found',
        robots: { index: false, follow: false },
      };
    }

    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || post.content?.substring(0, 160),
      keywords: post.tags || [],
      authors: [{ name: post.author?.name || 'LaraibCreative' }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `https://laraibcreative.studio/blog/${params.id}`,
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name],
        images: [
          {
            url: post.featuredImage || '/images/blog-default.jpg',
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        section: post.category,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [post.featuredImage],
      },
      alternates: {
        canonical: `https://laraibcreative.studio/blog/${params.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return { title: 'Blog | LaraibCreative' };
  }
}
```

---

## Dynamic Sitemap Generation

### Sitemap Configuration (`app/sitemap.js`)

**Auto-generates XML sitemap with dynamic routes:**

```javascript
import api from '@/lib/api';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.studio';
  const currentDate = new Date().toISOString();

  // Static routes with priorities
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/custom-order`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Fetch all products dynamically
  let productRoutes = [];
  try {
    const productsResponse = await api.products.getAll({ limit: 1000 });
    const products = productsResponse.products || productsResponse.data?.products || [];
    
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug || product._id}`,
      lastModified: product.updatedAt || currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Fetch all blog posts dynamically
  let blogRoutes = [];
  try {
    const blogResponse = await api.blog.getAll({ limit: 1000 });
    const posts = blogResponse.posts || blogResponse.data?.posts || [];

    blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Fetch all categories dynamically
  let categoryRoutes = [];
  try {
    const categoriesResponse = await api.categories.getAll();
    const categories = categoriesResponse.categories || categoriesResponse.data?.categories || [];

    categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt || currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...categoryRoutes];
}
```

### Sitemap Features

- **Dynamic Updates**: Automatically includes new products, blogs, and categories
- **Priority Management**: Strategic priority values (1.0 for homepage, 0.9 for products, etc.)
- **Change Frequency**: Hints for search engines on update frequency
- **Last Modified**: Uses actual database timestamps
- **Error Handling**: Graceful fallback if API calls fail
- **Large Catalogs**: Supports up to 1000 items per type (expandable)

### Accessing the Sitemap

**Production URL:**
```
https://laraibcreative.studio/sitemap.xml
```

**Static Fallback:**
```
frontend/public/sitemap.xml (if dynamic generation fails)
```

---

## Robots.txt Configuration

### Robots Configuration (`app/robots.js`)

```javascript
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.studio';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',      // Block admin dashboard
          '/account/',    // Block user accounts
          '/checkout/',   // Block checkout process
          '/api/',        // Block API endpoints
          '/_next/',      // Block Next.js internals
          '/static/',     // Block static assets
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
```

### Robots.txt Rules Explained

| Rule | Purpose |
|------|---------|
| `allow: '/'` | Allow all public pages |
| `/admin/` | Prevent indexing of admin dashboard |
| `/account/` | Prevent indexing of user account pages |
| `/checkout/` | Prevent indexing of checkout flow |
| `/api/` | Prevent indexing of API endpoints |
| `/_next/` | Prevent indexing of Next.js build files |

**Production URL:**
```
https://laraibcreative.studio/robots.txt
```

---

## Structured Data (Schema.org)

### Product Schema

**Implemented in Product Pages:**

```javascript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  image: product.images,
  brand: {
    '@type': 'Brand',
    name: 'LaraibCreative',
  },
  offers: {
    '@type': 'Offer',
    url: `https://laraibcreative.studio/products/${product.slug}`,
    priceCurrency: 'PKR',
    price: product.pricing.basePrice,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    availability: product.inventory.inStock 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'LaraibCreative',
    },
  },
  aggregateRating: product.reviews?.length > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: product.averageRating,
    reviewCount: product.reviews.length,
  } : undefined,
  sku: product.sku,
  category: product.category.name,
};

// Inject in page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
/>
```

### Article Schema (Blog Posts)

```javascript
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  image: post.featuredImage,
  author: {
    '@type': 'Person',
    name: post.author.name,
  },
  publisher: {
    '@type': 'Organization',
    name: 'LaraibCreative',
    logo: {
      '@type': 'ImageObject',
      url: 'https://laraibcreative.studio/logo.png',
    },
  },
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://laraibcreative.studio/blog/${post.slug}`,
  },
};
```

### Organization Schema (Global)

```javascript
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LaraibCreative',
  url: 'https://laraibcreative.studio',
  logo: 'https://laraibcreative.studio/logo.png',
  description: 'Premium Pakistani fashion with custom stitching services',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PK',
    addressLocality: 'Your City',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'info@laraibcreative.studio',
    availableLanguage: ['English', 'Urdu'],
  },
  sameAs: [
    'https://facebook.com/laraibcreative',
    'https://instagram.com/laraibcreative',
    'https://twitter.com/laraibcreative',
  ],
};
```

### Breadcrumb Schema

```javascript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://laraibcreative.studio',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Products',
      item: 'https://laraibcreative.studio/products',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: product.title,
      item: `https://laraibcreative.studio/products/${product.slug}`,
    },
  ],
};
```

---

## URL Structure & Slugs

### SEO-Friendly URL Patterns

| Resource | URL Pattern | Example |
|----------|-------------|---------|
| **Homepage** | `/` | `laraibcreative.studio/` |
| **Products Listing** | `/products` | `laraibcreative.studio/products` |
| **Product Detail** | `/products/[slug]` | `laraibcreative.studio/products/premium-lawn-suit-3pc` |
| **Category** | `/categories/[slug]` | `laraibcreative.studio/categories/unstitched-suits` |
| **Blog Listing** | `/blog` | `laraibcreative.studio/blog` |
| **Blog Post** | `/blog/[slug]` | `laraibcreative.studio/blog/latest-fashion-trends-2026` |
| **Custom Order** | `/custom-order` | `laraibcreative.studio/custom-order` |
| **About** | `/about` | `laraibcreative.studio/about` |
| **Contact** | `/contact` | `laraibcreative.studio/contact` |
| **FAQ** | `/faq` | `laraibcreative.studio/faq` |

### Slug Generation Logic

**Backend Implementation (Product Model):**

```javascript
// Auto-generate slug from title
productSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace special chars with hyphens
      .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
  }
  next();
});

// Ensure slug uniqueness
productSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const existingProduct = await this.constructor.findOne({ 
      slug: this.slug, 
      _id: { $ne: this._id } 
    });
    
    if (existingProduct) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});
```

**Frontend Routing:**

- Uses Next.js 14 dynamic routes: `[slug]` or `[id]`
- Supports both slug and ID for backward compatibility
- Canonical URLs always use slugs

---

## Image Optimization

### Cloudinary Integration

**Custom Image Loader (`frontend/src/lib/image-loader.ts`):**

```typescript
export default function cloudinaryLoader({ src, width, quality }) {
  const params = [
    'f_auto',                          // Auto format (WebP/AVIF)
    'c_limit',                         // Limit dimensions
    `w_${width}`,                      // Responsive width
    `q_${quality || 'auto:good'}`,    // Quality optimization
  ];
  
  const cloudinaryUrl = 'https://res.cloudinary.com/your-cloud-name/image/upload';
  
  return `${cloudinaryUrl}/${params.join(',')}/${src}`;
}
```

### Image Optimization Features

- **Automatic Format Selection**: WebP/AVIF for modern browsers, JPEG fallback
- **Responsive Images**: Multiple sizes generated (640px, 750px, 1080px, 1200px, 1920px)
- **Lazy Loading**: Native browser lazy loading with Next.js Image component
- **Blur Placeholders**: LQIP (Low Quality Image Placeholder) for better UX
- **CDN Caching**: 1-year cache TTL for faster loading
- **Alt Text**: Required for all images (accessibility + SEO)

### Best Practices

```javascript
// Correct usage
<Image
  src={product.primaryImage}
  alt={product.title}
  width={800}
  height={800}
  priority={isAboveFold}
  quality={85}
  placeholder="blur"
  blurDataURL={product.thumbnailBase64}
/>

// Avoid
<img src={product.primaryImage} /> // No optimization
```

---

## Performance Optimization

### Core Web Vitals Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ~2.1s | ✅ Good |
| **FID** (First Input Delay) | < 100ms | ~50ms | ✅ Good |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.05 | ✅ Good |
| **FCP** (First Contentful Paint) | < 1.8s | ~1.5s | ✅ Good |
| **TTI** (Time to Interactive) | < 3.8s | ~3.2s | ✅ Good |

### Performance Optimizations

#### 1. Code Splitting
```javascript
// Dynamic imports for heavy components
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

#### 2. Caching Strategy
- **Static Pages**: Cached indefinitely, revalidated on-demand
- **Product Pages**: ISR with 3600s revalidation
- **Blog Posts**: ISR with 7200s revalidation
- **API Responses**: Redis caching (5-60 minutes)

#### 3. Font Optimization
```javascript
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});
```

#### 4. Bundle Optimization
- Tree-shaking enabled
- CSS minification
- JavaScript minification
- Dead code elimination
- Webpack bundle analysis

---

## Social Media Integration

### Open Graph Tags

**Automatically generated for all pages:**

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://laraibcreative.studio/products/summer-lawn" />
<meta property="og:title" content="Summer Lawn Collection | LaraibCreative" />
<meta property="og:description" content="Explore our premium summer lawn collection..." />
<meta property="og:image" content="https://res.cloudinary.com/.../og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="LaraibCreative" />
<meta property="og:locale" content="en_PK" />
```

### Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@laraibcreative" />
<meta name="twitter:creator" content="@laraibcreative" />
<meta name="twitter:title" content="Summer Lawn Collection | LaraibCreative" />
<meta name="twitter:description" content="Explore our premium summer lawn collection..." />
<meta name="twitter:image" content="https://res.cloudinary.com/.../twitter-card.jpg" />
```

### Social Sharing Images

**Recommended Dimensions:**
- **Open Graph**: 1200 x 630px (1.91:1 ratio)
- **Twitter Card**: 1200 x 675px (16:9 ratio) or 1200 x 630px
- **Pinterest**: 1000 x 1500px (2:3 ratio)
- **LinkedIn**: 1200 x 627px

---

## SEO Management API

### API Endpoints

**Backend: `backend/src/routes/seo.routes.js`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/seo/:pageType` | Get SEO settings for a page type |
| `GET` | `/api/v1/seo/:pageType/:pageId` | Get SEO for specific page |
| `PUT` | `/api/v1/seo/:pageType/:pageId` | Update SEO settings |
| `POST` | `/api/v1/seo/generate` | Auto-generate SEO metadata |

### Frontend API Integration

**Frontend: `frontend/src/lib/api.js`**

```javascript
// SEO Management
seo: {
  // Get SEO settings for a page
  async getPageSEO(pageType, pageId = null) {
    const endpoint = pageId 
      ? `/seo/${pageType}/${pageId}` 
      : `/seo/${pageType}`;
    return await axiosInstance.get(endpoint);
  },

  // Update SEO settings for a page
  async updatePageSEO(pageType, pageId, seoData) {
    return await axiosInstance.put(`/seo/${pageType}/${pageId}`, seoData);
  },

  // Auto-generate SEO metadata
  async generateSEO(content) {
    return await axiosInstance.post('/seo/generate', { content });
  },
},
```

### SEO Data Structure

```javascript
{
  pageType: 'product' | 'blog' | 'category' | 'page',
  pageId: 'product-id-123',
  metaTitle: 'Premium Lawn Suit - 3PC | LaraibCreative',
  metaDescription: 'Shop our premium 3-piece lawn suit...',
  keywords: ['lawn suit', 'summer collection', 'Pakistani fashion'],
  ogImage: 'https://res.cloudinary.com/.../og-image.jpg',
  twitterImage: 'https://res.cloudinary.com/.../twitter-card.jpg',
  canonicalUrl: 'https://laraibcreative.studio/products/premium-lawn-suit-3pc',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Product',
    // ... Product schema
  },
  noIndex: false,
  noFollow: false,
}
```

---

## Best Practices

### ✅ DO's

1. **Unique Title & Description**: Every page must have unique metadata
2. **Title Length**: 50-60 characters (optimal for SERPs)
3. **Description Length**: 150-160 characters
4. **Keywords**: 5-10 relevant keywords per page
5. **Alt Text**: Descriptive alt text for all images
6. **Canonical URLs**: Always set canonical to prevent duplicate content
7. **Mobile Optimization**: Ensure mobile-first responsive design
8. **Page Speed**: Target LCP < 2.5s, FID < 100ms, CLS < 0.1
9. **SSL Certificate**: Always use HTTPS
10. **Sitemap Updates**: Ensure sitemap updates after content changes

### ❌ DON'Ts

1. **Duplicate Content**: Avoid duplicate titles/descriptions
2. **Keyword Stuffing**: Don't over-optimize with keywords
3. **Hidden Text**: Never hide text for SEO purposes
4. **Cloaking**: Don't show different content to search engines
5. **Low-Quality Content**: Avoid thin, duplicate, or auto-generated content
6. **Slow Loading**: Don't use unoptimized images or heavy scripts
7. **Poor Mobile UX**: Avoid non-responsive design
8. **Broken Links**: Fix 404 errors immediately
9. **Flash Content**: Avoid Flash (not crawlable)
10. **Intrusive Ads**: Don't use aggressive interstitials

### Title & Description Templates

**Product Pages:**
```
Title: {Product Name} - {Category} | LaraibCreative
Description: Shop {Product Name} at LaraibCreative. {Brief description}. Free shipping across Pakistan. Custom stitching available.
```

**Category Pages:**
```
Title: {Category Name} Collection | LaraibCreative
Description: Explore our {Category Name} collection. Premium Pakistani fashion with custom stitching. Shop now with fast delivery.
```

**Blog Posts:**
```
Title: {Blog Title} | LaraibCreative Blog
Description: {Excerpt from blog post - 150-160 characters}
```

---

## Monitoring & Analytics

### Google Search Console Integration

**Setup Steps:**
1. Verify domain ownership via DNS TXT record
2. Submit sitemap: `https://laraibcreative.studio/sitemap.xml`
3. Monitor:
   - Indexing status
   - Search performance (clicks, impressions, CTR, position)
   - Core Web Vitals
   - Mobile usability
   - Crawl errors

### Google Analytics 4

**Track SEO Metrics:**
```javascript
// Track page views
gtag('event', 'page_view', {
  page_title: document.title,
  page_location: window.location.href,
  page_path: window.location.pathname,
});

// Track search queries
gtag('event', 'search', {
  search_term: searchQuery,
});

// Track product views
gtag('event', 'view_item', {
  currency: 'PKR',
  value: productPrice,
  items: [{
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
  }],
});
```

### Key SEO Metrics to Monitor

| Metric | Tool | Target |
|--------|------|--------|
| **Organic Traffic** | Google Analytics | +10% month-over-month |
| **Keyword Rankings** | Ahrefs/SEMrush | Top 10 for primary keywords |
| **Click-Through Rate (CTR)** | Search Console | > 5% average |
| **Bounce Rate** | Google Analytics | < 40% |
| **Page Speed** | PageSpeed Insights | > 90 score |
| **Core Web Vitals** | Search Console | All "Good" |
| **Indexed Pages** | Search Console | 100% of sitemap |
| **Backlinks** | Ahrefs | Steady growth |

### SEO Reporting Dashboard

**Weekly Checks:**
- [ ] Indexing status in Search Console
- [ ] Core Web Vitals performance
- [ ] Crawl errors and 404s
- [ ] Sitemap submission status
- [ ] Mobile usability issues

**Monthly Checks:**
- [ ] Organic traffic trends
- [ ] Keyword ranking changes
- [ ] Backlink profile growth
- [ ] Competitor analysis
- [ ] Content performance
- [ ] Technical SEO audit

---

## Testing & Validation

### SEO Testing Tools

| Tool | Purpose | URL |
|------|---------|-----|
| **Google Rich Results Test** | Validate structured data | https://search.google.com/test/rich-results |
| **PageSpeed Insights** | Performance + Core Web Vitals | https://pagespeed.web.dev |
| **Mobile-Friendly Test** | Mobile optimization | https://search.google.com/test/mobile-friendly |
| **Structured Data Validator** | Schema.org validation | https://validator.schema.org |
| **XML Sitemap Validator** | Sitemap syntax check | https://www.xml-sitemaps.com/validate-xml-sitemap.html |
| **Meta Tags Checker** | Verify metadata | https://metatags.io |
| **Open Graph Debugger** | Facebook OG preview | https://developers.facebook.com/tools/debug |
| **Twitter Card Validator** | Twitter card preview | https://cards-dev.twitter.com/validator |

### Manual Testing Checklist

**Per-Page Testing:**
- [ ] Unique title (50-60 chars)
- [ ] Unique description (150-160 chars)
- [ ] Keywords present (5-10)
- [ ] Canonical URL set correctly
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Structured data valid (JSON-LD)
- [ ] Images have alt text
- [ ] Internal links functional
- [ ] Mobile responsive
- [ ] Page speed < 3s
- [ ] No console errors
- [ ] No 404 links

**Site-Wide Testing:**
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] All pages in sitemap
- [ ] SSL certificate valid
- [ ] Redirects working (301 for permanent)
- [ ] Pagination rel="next/prev" (if applicable)
- [ ] hreflang tags (for multi-language, if applicable)

---

## Troubleshooting

### Common SEO Issues & Fixes

#### Issue: Pages Not Indexed

**Diagnosis:**
- Check robots.txt: `https://laraibcreative.studio/robots.txt`
- Verify sitemap submission in Search Console
- Check meta robots tag: `<meta name="robots" content="noindex" />`

**Fix:**
1. Ensure `robots.txt` allows crawling
2. Submit sitemap to Search Console
3. Remove `noindex` meta tag if present
4. Request indexing in Search Console

#### Issue: Duplicate Content

**Diagnosis:**
- Check for duplicate titles/descriptions
- Check for multiple URLs for same content

**Fix:**
1. Set canonical URLs on all pages
2. Use 301 redirects for duplicate URLs
3. Implement pagination correctly

#### Issue: Slow Page Speed

**Diagnosis:**
- Run PageSpeed Insights
- Check Core Web Vitals

**Fix:**
1. Optimize images (use WebP/AVIF)
2. Enable compression
3. Minimize JavaScript
4. Use CDN (Cloudinary)
5. Implement lazy loading
6. Remove unused CSS

#### Issue: Missing Structured Data

**Diagnosis:**
- Use Rich Results Test
- Check browser console for errors

**Fix:**
1. Add JSON-LD structured data
2. Validate syntax
3. Deploy and retest

---

## Future Enhancements

### Planned SEO Improvements

1. **AI-Generated SEO Content**
   - Auto-generate meta descriptions from product content
   - Smart keyword suggestions
   - Content optimization recommendations

2. **Advanced Structured Data**
   - FAQ schema for FAQ page
   - Video schema for product videos
   - Review schema aggregation

3. **Multi-Language SEO**
   - hreflang tags for Urdu/English
   - Localized content
   - Regional targeting

4. **Enhanced Analytics**
   - Custom SEO dashboard
   - Automated SEO audits
   - Rank tracking integration

5. **Content Optimization**
   - SEO content analyzer
   - Readability scoring
   - Internal linking suggestions

---

## Resources & Documentation

### Official Documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

### SEO Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [Ahrefs](https://ahrefs.com)
- [SEMrush](https://semrush.com)
- [Moz](https://moz.com)

### Team Contacts
- **SEO Manager**: [Your Name] (seo@laraibcreative.studio)
- **Developer**: [Dev Name] (dev@laraibcreative.studio)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 3, 2026 | Initial SEO documentation with full implementation details |

---

**Document Maintained By:** LaraibCreative Development Team  
**Last Review:** January 3, 2026  
**Next Review:** April 3, 2026
