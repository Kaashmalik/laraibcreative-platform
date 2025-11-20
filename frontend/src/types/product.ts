/**
 * Product Type Definitions
 * TypeScript types for product data structure matching backend schema
 * 
 * @module types/product
 */

/**
 * Product Image Structure
 * Represents a single product image with metadata
 */
export interface ProductImage {
  /** Image URL (required) */
  url: string;
  /** Cloudinary public ID (optional) */
  publicId?: string;
  /** Alt text for accessibility (optional) */
  altText?: string;
  /** Display order for sorting (optional) */
  displayOrder?: number;
}

/**
 * Product Pricing Structure
 * Represents product pricing information
 */
export interface ProductPricing {
  /** Base price in PKR (required) */
  basePrice: number;
  /** Compare price (original price before discount) */
  comparePrice?: number;
  /** Custom stitching charge */
  customStitchingCharge?: number;
  /** Brand article charge */
  brandArticleCharge?: number;
  /** Fabric provided by LC */
  fabricProvidedByLC?: number;
  /** Rush order fee */
  rushOrderFee?: number;
  /** Currency */
  currency?: 'PKR' | 'USD';
  /** Discount information */
  discount?: {
    percentage?: number;
    amount?: number;
  };
}

/**
 * Product Availability Status
 */
export type ProductAvailabilityStatus = 
  | 'in-stock' 
  | 'made-to-order' 
  | 'out-of-stock' 
  | 'discontinued';

/**
 * Product Availability Information
 */
export interface ProductAvailability {
  /** Current availability status */
  status: ProductAvailabilityStatus;
  /** Expected restock date (if applicable) */
  expectedRestockDate?: string | Date;
}

/**
 * Product Rating Information
 */
export interface ProductRating {
  /** Average rating (0-5) */
  averageRating?: number;
  /** Total number of reviews */
  totalReviews?: number;
  /** Rating distribution by stars */
  ratingDistribution?: {
    five?: number;
    four?: number;
    three?: number;
    two?: number;
    one?: number;
  };
}

/**
 * Product Review (for structured data)
 */
export interface ProductReview {
  /** Review author name */
  author?: string;
  /** Review date */
  datePublished?: string | Date;
  /** Review text/comment */
  reviewBody?: string;
  /** Rating value (1-5) */
  ratingValue?: number;
}

/**
 * Complete Product Interface
 * Matches the backend Product model structure
 */
export interface Product {
  /** Product unique identifier */
  _id?: string;
  id?: string;
  
  /** Product title/name (required) */
  title: string;
  name?: string; // Alternative field name
  
  /** Product slug for URL */
  slug?: string;
  
  /** Full product description */
  description?: string;
  
  /** Short description for listings */
  shortDescription?: string;
  
  /** Product SKU */
  sku?: string;
  
  /** Design code (format: LC-YYYY-XXX) */
  designCode?: string;
  
  /** Product images array */
  images?: ProductImage[] | string[];
  
  /** Primary/featured image URL */
  primaryImage?: string;
  image?: string; // Alternative field name
  
  /** Thumbnail image URL */
  thumbnailImage?: string;
  
  /** Product pricing information */
  pricing?: ProductPricing;
  price?: number; // Alternative field name (legacy support)
  
  /** Product availability */
  availability?: ProductAvailability;
  inStock?: boolean; // Alternative field name (legacy support)
  
  /** Stock quantity */
  stockQuantity?: number;
  
  /** Product category */
  category?: string | {
    _id?: string;
    name?: string;
    slug?: string;
  };
  
  /** Product subcategory */
  subcategory?: string;
  
  /** Product brand */
  brand?: string | {
    name?: string;
  };
  
  /** Fabric information */
  fabric?: {
    type?: string;
    name?: string;
    color?: string;
    pattern?: string;
    weight?: string;
    composition?: string;
    careInstructions?: string;
  };
  
  /** Inventory information */
  inventory?: {
    trackInventory?: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    sku?: string;
  };
  
  /** Product type */
  productType?: 'ready-made' | 'custom-only' | 'both';
  
  /** Size availability */
  sizeAvailability?: {
    availableSizes?: string[];
    customSizesAvailable?: boolean;
  };
  
  /** Available colors */
  availableColors?: Array<{
    name?: string;
    hexCode?: string;
    image?: string;
    inStock?: boolean;
  }>;
  
  /** Product rating and reviews */
  averageRating?: number;
  totalReviews?: number;
  rating?: number; // Alternative field name
  reviewCount?: number; // Alternative field name
  reviews?: ProductReview[];
  
  /** Product tags */
  tags?: string[];
  
  /** Product features */
  features?: string[];
  
  /** What's included */
  whatsIncluded?: string[];
  
  /** Occasion */
  occasion?: string;
  
  /** SEO information */
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  
  /** Product status flags */
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  
  /** Admin notes */
  adminNotes?: string;
  
  /** Additional metadata */
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Product Structured Data Input
 * Simplified interface for generating JSON-LD structured data
 */
export interface ProductStructuredDataInput {
  /** Product data */
  product: Product;
  /** Current page URL (for offers.url) */
  url?: string;
  /** Brand name override (defaults to 'LaraibCreative') */
  brandName?: string;
  /** Site URL for absolute image URLs */
  siteUrl?: string;
}

