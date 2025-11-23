/**
 * Product Management Type Definitions
 * Types for admin product management system
 */

import { Product, ProductImage } from './product';

/**
 * Product Form Data
 * Complete form data structure for creating/editing products
 */
export interface ProductFormData {
  // Basic Info
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  designCode: string;
  sku?: string;

  // Category & Classification
  category: string; // Category ID
  subcategory?: string;
  occasion?: string;
  tags?: string[];

  // Pricing
  pricing: {
    basePrice: number;
    customStitchingCharge?: number;
    brandArticleCharge?: number;
    fabricProvidedByLC?: number;
    rushOrderFee?: number;
    discount?: {
      percentage?: number;
      amount?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
    };
    currency?: 'PKR' | 'USD';
  };

  // Images
  images: ProductImage[];
  primaryImage?: string;
  thumbnailImage?: string;

  // Fabric
  fabric: {
    type: string;
    name?: string;
    color?: string;
    pattern?: string;
    weight?: string;
    composition?: string;
    careInstructions?: string;
  };

  // Inventory
  inventory: {
    trackInventory: boolean;
    stockQuantity: number;
    lowStockThreshold: number;
    sku?: string;
  };

  // Availability
  availability: {
    status: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued';
    expectedRestockDate?: string;
  };

  // Product Type
  productType: 'ready-made' | 'custom-only' | 'both';

  // Size Availability
  sizeAvailability: {
    availableSizes: string[];
    customSizesAvailable: boolean;
  };

  // Colors
  availableColors?: Array<{
    name: string;
    hexCode?: string;
    image?: string;
    inStock?: boolean;
  }>;

  // Features & Content
  features?: string[];
  whatsIncluded?: string[];

  // Status Flags
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;

  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };

  // Admin
  adminNotes?: string;
}

/**
 * Product Table Filters
 */
export interface ProductTableFilters {
  search?: string;
  category?: string;
  status?: 'all' | 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued';
  featured?: boolean;
  productType?: 'ready-made' | 'custom-only' | 'both';
  minPrice?: number;
  maxPrice?: number;
  occasion?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Product Table Sort Options
 */
export type ProductSortField = 
  | 'title'
  | 'createdAt'
  | 'updatedAt'
  | 'pricing.basePrice'
  | 'views'
  | 'purchased'
  | 'averageRating';

/**
 * Bulk Action Type
 */
export type BulkActionType = 
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'feature'
  | 'unfeature'
  | 'export';

/**
 * Bulk Action Request
 */
export interface BulkActionRequest {
  productIds: string[];
  action: BulkActionType;
  data?: Record<string, any>;
}

/**
 * Product Table Row
 */
export interface ProductTableRow extends Product {
  _id: string;
  selected?: boolean;
}

/**
 * Image Upload State
 */
export interface ImageUploadState {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  error?: string;
  uploadedUrl?: string;
  publicId?: string;
}

/**
 * Draft Save State
 */
export interface ProductDraft {
  formData: Partial<ProductFormData>;
  savedAt: string;
  version: number;
}

/**
 * Product Preview Data
 */
export interface ProductPreviewData extends ProductFormData {
  previewMode: boolean;
}

