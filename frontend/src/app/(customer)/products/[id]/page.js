import { Suspense } from 'react';
import { generateProductMetadata } from '@/lib/seo-config';
import { SITE_URL } from '@/lib/constants';
import api from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';
import ProductDetailLoading from './loading';

/**
 * ISR Configuration with Partial Prerendering (PPR)
 * Revalidate product pages every 3600 seconds (1 hour)
 * This ensures product data stays fresh while maintaining fast page loads
 */
export const revalidate = 3600;

/**
 * Partial Prerendering (PPR) - Next.js 15
 * Enables streaming for dynamic parts while keeping static shell
 */
export const experimental_ppr = true;

/**
 * Generate static params for product pages at build time
 * TEMPORARILY DISABLED: Backend deployment pending on Render
 * Pages will be generated on-demand via ISR (revalidate: 3600s)
 */
export async function generateStaticParams() {
  // Return empty array - all pages generated on-demand until backend is available
  return [];
  
  /* Uncomment when backend is deployed and stable:
  try {
    const response = await api.products.getFeatured(50);
    const products = response?.products || response?.data?.products || response || [];
    return products
      .filter(product => product._id || product.id || product.slug)
      .map((product) => ({
        id: product.slug || product._id?.toString() || product.id?.toString(),
      }))
      .slice(0, 50);
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
  */
}

/**
 * Generate dynamic metadata for product detail pages
 * Next.js 14 App Router - Server Component
 */
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
      `Shop ${productTitle} at LaraibCreative. Premium quality Pakistani fashion with custom stitching options. Fast delivery across Pakistan.`;
    
    const productUrl = `${SITE_URL}/products/${params.id}`;
    const productImage = product.primaryImage || product.images?.[0] || `${SITE_URL}/images/og-default.jpg`;
    const productPrice = product.pricing?.basePrice || product.price || 0;

    // Ensure title is 50-60 characters
    const title = productTitle.length > 55 
      ? `${productTitle.substring(0, 52)}...` 
      : productTitle;
    
    // Ensure description is 150-160 characters
    const description = productDescription.length > 160
      ? productDescription.substring(0, 157) + '...'
      : productDescription;

    return {
      title: `${title} | LaraibCreative`,
      description,
      keywords: [
        productTitle,
        product.category,
        product.fabric?.type,
        product.occasion,
        'Pakistan fashion',
        'custom stitching',
        'Pakistani clothing',
        'ready to wear',
        'online shopping Pakistan'
      ].filter(Boolean).join(', '),
      authors: [{ name: 'LaraibCreative' }],
      creator: 'LaraibCreative',
      publisher: 'LaraibCreative',
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        type: 'product',
        title: `${title} | LaraibCreative`,
        description,
        url: productUrl,
        siteName: 'LaraibCreative',
        locale: 'en_PK',
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: productTitle,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | LaraibCreative`,
        description,
        images: [productImage],
        creator: '@laraibcreative',
        site: '@laraibcreative',
      },
      other: {
        'product:price:amount': productPrice.toString(),
        'product:price:currency': 'PKR',
        'product:availability': product.inStock ? 'in stock' : 'out of stock',
        'product:condition': 'new',
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product | LaraibCreative',
      description: 'Browse our collection of custom stitched ladies suits and designer wear.',
    };
  }
}

/**
 * Product Detail Page - Server Component with Streaming
 * Uses Suspense for progressive loading
 * Static shell with dynamic content streamed in
 */
export default async function ProductDetailPage({ params }) {
  return (
    <Suspense fallback={<ProductDetailLoading />}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
