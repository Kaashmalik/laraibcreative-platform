# Product Structured Data Implementation

## Overview
This document describes the implementation of JSON-LD structured data for products using schema.org Product schema. The implementation follows Next.js 14 App Router conventions and includes comprehensive TypeScript types.

## Files Created

### 1. TypeScript Types (`frontend/src/types/product.ts`)
- **Product Interface**: Complete type definition matching backend schema
- **ProductImage**: Image structure with URL, alt text, and metadata
- **ProductPricing**: Pricing information structure
- **ProductAvailability**: Availability status and restock dates
- **ProductRating**: Rating and review information
- **ProductStructuredDataInput**: Input type for the component

### 2. Product Structured Data Component (`frontend/src/components/shared/ProductStructuredData.tsx`)

A reusable React component that generates JSON-LD structured data for products.

#### Features:
- ✅ Complete Product schema following schema.org standards
- ✅ Handles missing optional fields gracefully
- ✅ Includes AggregateRating when reviews exist
- ✅ Supports multiple images (array of objects or strings)
- ✅ Proper error handling with development warnings
- ✅ TypeScript type safety
- ✅ Converts relative URLs to absolute URLs
- ✅ Handles various product data structures (legacy support)

#### Usage:
```tsx
import ProductStructuredData from '@/components/shared/ProductStructuredData';

<ProductStructuredData 
  product={productData}
  url="https://laraibcreative.studio/products/123"
  brandName="LaraibCreative" // Optional, defaults to 'LaraibCreative'
  siteUrl="https://laraibcreative.studio" // Optional, uses SITE_URL constant
/>
```

## Schema.org Fields Implemented

### Required Fields
- ✅ `@context`: "https://schema.org"
- ✅ `@type`: "Product"
- ✅ `name`: Product title/name
- ✅ `offers`: Complete Offer object with price, currency, availability

### Recommended Fields
- ✅ `description`: Product description
- ✅ `image`: Product images (single or array)
- ✅ `sku`: Product SKU
- ✅ `brand`: Brand information (LaraibCreative)

### Optional Fields
- ✅ `aggregateRating`: Included when reviews exist
- ✅ `review`: Individual reviews (up to 5)
- ✅ `category`: Product category
- ✅ `additionalProperty`: Product features

## Offer Schema Details

The `offers` object includes:
- `url`: Product page URL
- `priceCurrency`: "PKR" (Pakistani Rupees)
- `price`: Product price (from pricing.basePrice or price)
- `priceValidUntil`: Valid for 30 days from generation
- `availability`: One of:
  - `https://schema.org/InStock`
  - `https://schema.org/OutOfStock`
  - `https://schema.org/Discontinued`
  - `https://schema.org/PreOrder` (for made-to-order)
- `itemCondition`: `https://schema.org/NewCondition`
- `seller`: Organization information

## AggregateRating Schema

Included when:
- `averageRating` > 0 AND
- `totalReviews` > 0

Fields:
- `ratingValue`: Average rating (0-5, clamped)
- `reviewCount`: Total number of reviews
- `bestRating`: 5
- `worstRating`: 1

## Error Handling

The component includes comprehensive error handling:

1. **Missing Product**: Returns `null` with development warning
2. **Missing Product Name**: Returns `null` with development warning
3. **Image Processing Errors**: Falls back to placeholder image
4. **JSON Serialization Errors**: Catches and logs in development
5. **Production Mode**: Fails silently (no console errors)

## TypeScript Support

Full TypeScript support with:
- Strict type checking
- IntelliSense support
- Type-safe props
- Exported types for reuse

## Integration

### Updated Files:
- ✅ `frontend/src/app/(customer)/products/[id]/ProductDetailClient.jsx`
  - Replaced inline structured data with component
  - Cleaner, more maintainable code

## Testing

### Manual Testing:
1. Open product detail page
2. View page source
3. Search for `application/ld+json`
4. Verify JSON-LD structure
5. Test with [Google Rich Results Test](https://search.google.com/test/rich-results)

### Validation:
- ✅ Schema.org validator: https://validator.schema.org/
- ✅ Google Rich Results Test
- ✅ Structured Data Testing Tool

## Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Custom Bridal Suit",
  "description": "Exquisite hand-embroidered bridal suit...",
  "image": [
    "https://laraibcreative.studio/images/product-1.jpg",
    "https://laraibcreative.studio/images/product-2.jpg"
  ],
  "sku": "LC-2025-001",
  "brand": {
    "@type": "Brand",
    "name": "LaraibCreative"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://laraibcreative.studio/products/123",
    "priceCurrency": "PKR",
    "price": 15000,
    "priceValidUntil": "2025-02-28",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "LaraibCreative"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 127,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

## Best Practices Implemented

1. ✅ **Graceful Degradation**: Handles missing fields without breaking
2. ✅ **Type Safety**: Full TypeScript support
3. ✅ **Error Handling**: Comprehensive error catching
4. ✅ **Performance**: Minimal runtime overhead
5. ✅ **Maintainability**: Reusable component, well-documented
6. ✅ **SEO Optimization**: Follows schema.org best practices
7. ✅ **Accessibility**: Proper image alt text support

## Future Enhancements

Potential improvements:
- [ ] Add support for Product Variants
- [ ] Include breadcrumb structured data
- [ ] Add FAQ structured data for product FAQs
- [ ] Support for multiple currencies
- [ ] Add VideoObject schema for product videos
- [ ] Include warranty information

## Support

For issues or questions:
1. Check [schema.org Product documentation](https://schema.org/Product)
2. Review component TypeScript types
3. Validate with Google Rich Results Test
4. Check browser console for development warnings

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

