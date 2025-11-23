'use client';


import React from 'react';
import type { ProductStructuredDataInput } from '@/types/product';
import { SITE_URL } from '@/lib/constants';

/**
 * Product Structured Data Component
 * 
 * Generates JSON-LD structured data for products following schema.org Product schema.
 * This component helps search engines understand product information for rich snippets.
 * 
 * @component
 * @example
 * ```tsx
 * <ProductStructuredData 
 *   product={productData}
 *   url="https://laraibcreative.studio/products/123"
 * />
 * ```
 * 
 * Features:
 * - Complete Product schema with all required fields
 * - Handles missing optional fields gracefully
 * - Includes AggregateRating if reviews exist
 * - Supports multiple images
 * - Proper error handling
 * - TypeScript type safety
 * 
 * @see https://schema.org/Product
 */
export default function ProductStructuredData({
  product,
  url,
  brandName = 'LaraibCreative',
  siteUrl = SITE_URL,
}: ProductStructuredDataInput): JSX.Element | null {
  // Early return if product is missing or invalid
  if (!product) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ProductStructuredData] Product data is missing');
    }
    return null;
  }

  try {
    // Extract product name (handle both title and name fields)
    const productName = product.title || product.name || '';
    if (!productName) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ProductStructuredData] Product name is missing');
      }
      return null;
    }

    // Extract product description
    const productDescription = product.description || product.shortDescription || '';

    // Extract product images
    // Handle both array of objects and array of strings
    const extractImageUrls = (): string[] => {
      const images: string[] = [];

      // Primary image (highest priority)
      if (product.primaryImage) {
        images.push(getAbsoluteUrl(product.primaryImage, siteUrl));
      } else if (product.image) {
        images.push(getAbsoluteUrl(product.image, siteUrl));
      }

      // Additional images from images array
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img) => {
          if (typeof img === 'string') {
            const absoluteUrl = getAbsoluteUrl(img, siteUrl);
            if (!images.includes(absoluteUrl)) {
              images.push(absoluteUrl);
            }
          } else if (img && typeof img === 'object' && 'url' in img) {
            const absoluteUrl = getAbsoluteUrl(img.url, siteUrl);
            if (!images.includes(absoluteUrl)) {
              images.push(absoluteUrl);
            }
          }
        });
      }

      // Fallback to placeholder if no images found
      if (images.length === 0) {
        images.push(`${siteUrl}/images/placeholder.png`);
      }

      return images;
    };

    const productImages = extractImageUrls();

    // Extract product price
    const productPrice = 
      product.pricing?.basePrice || 
      product.price || 
      0;

    // Extract SKU
    const productSku = product.sku || product._id || product.id || '';

    // Determine availability
    const getAvailability = (): string => {
      // Check availability.status first
      if (product.availability?.status) {
        switch (product.availability.status) {
          case 'in-stock':
            return 'https://schema.org/InStock';
          case 'out-of-stock':
            return 'https://schema.org/OutOfStock';
          case 'discontinued':
            return 'https://schema.org/Discontinued';
          case 'made-to-order':
            return 'https://schema.org/PreOrder';
          default:
            return 'https://schema.org/InStock';
        }
      }

      // Fallback to inStock boolean
      if (product.inStock !== undefined) {
        return product.inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock';
      }

      // Check stock quantity
      if (product.stockQuantity !== undefined) {
        return product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock';
      }

      // Default to InStock for made-to-order products
      return 'https://schema.org/InStock';
    };

    const availability = getAvailability();

    // Get current page URL or construct from product slug
    const productUrl = url || 
      (product.slug ? `${siteUrl}/products/${product.slug}` : '') ||
      (product._id ? `${siteUrl}/products/${product._id}` : '') ||
      (product.id ? `${siteUrl}/products/${product.id}` : '') ||
      typeof window !== 'undefined' ? window.location.href : '';

    // Build base Product schema
    const productSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      
      // Required fields
      name: productName,
      
      // Description (recommended)
      ...(productDescription && { description: productDescription }),
      
      // Images (at least one required)
      image: productImages.length === 1 ? productImages[0] : productImages,
      
      // SKU (recommended for e-commerce)
      ...(productSku && { sku: productSku }),
      
      // Brand information
      brand: {
        '@type': 'Brand',
        name: 
          (typeof product.brand === 'string' ? product.brand : product.brand?.name) || 
          brandName,
      },
      
      // Offer information (required for e-commerce)
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'PKR',
        price: productPrice,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // Valid for 30 days
        availability: availability,
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: brandName,
        },
      },
    };

    // Add AggregateRating if reviews exist
    const rating = 
      product.averageRating || 
      product.rating || 
      0;
    
    const reviewCount = 
      product.totalReviews || 
      product.reviewCount || 
      0;

    if (rating > 0 && reviewCount > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Math.min(Math.max(rating, 0), 5), // Clamp between 0-5
        reviewCount: Math.max(reviewCount, 0), // Ensure non-negative
        bestRating: 5,
        worstRating: 1,
      };
    }

    // Add individual reviews if available (optional, but enhances rich snippets)
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
      productSchema.review = product.reviews
        .slice(0, 5) // Limit to 5 reviews for performance
        .filter((review) => review && review.ratingValue && review.reviewBody)
        .map((review) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.author || 'Customer',
          },
          ...(review.datePublished && {
            datePublished: typeof review.datePublished === 'string' 
              ? review.datePublished 
              : new Date(review.datePublished).toISOString(),
          }),
          reviewBody: review.reviewBody || '',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: Math.min(Math.max(review.ratingValue || 0, 1), 5),
            bestRating: 5,
            worstRating: 1,
          },
        }));
    }

    // Add category if available (helps with categorization)
    if (product.category) {
      const categoryName = typeof product.category === 'string' 
        ? product.category 
        : product.category.name || '';
      
      if (categoryName) {
        productSchema.category = categoryName;
      }
    }

    // Add product features if available
    if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      productSchema.additionalProperty = product.features.map((feature) => ({
        '@type': 'PropertyValue',
        name: 'Feature',
        value: feature,
      }));
    }

    // Render JSON-LD script tag
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema, null, 0), // Compact JSON
        }}
      />
    );
  } catch (error) {
    // Error handling - log in development, fail silently in production
    if (process.env.NODE_ENV === 'development') {
      console.error('[ProductStructuredData] Error generating structured data:', error);
    }
    return null;
  }
}

/**
 * Helper function to convert relative URLs to absolute URLs
 * @param url - Image URL (can be relative or absolute)
 * @param siteUrl - Base site URL
 * @returns Absolute URL
 */
function getAbsoluteUrl(url: string, siteUrl: string = SITE_URL): string {
  if (!url) return `${siteUrl}/images/placeholder.png`;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Cloudinary URL (already absolute)
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    return url;
  }
  
  // Relative URL - make absolute
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${siteUrl}${cleanUrl}`;
}

/**
 * Export types for use in other components
 */
export type { Product, ProductStructuredDataInput } from '@/types/product';

