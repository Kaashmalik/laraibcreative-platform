/**
 * Product Validation Schemas
 * Zod schemas for product form validation
 */

import { z } from 'zod';

/**
 * Design Code Validation
 * Format: LC-YYYY-XXX (e.g., LC-2024-001)
 */
const designCodeSchema = z.string()
  .regex(/^LC-\d{4}-\d{3,4}$/, 'Invalid design code format. Use LC-YYYY-XXX')
  .transform(val => val.toUpperCase());

/**
 * SKU Validation
 */
const skuSchema = z.string()
  .min(3, 'SKU must be at least 3 characters')
  .max(50, 'SKU cannot exceed 50 characters')
  .regex(/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens')
  .optional()
  .or(z.literal(''));

/**
 * Product Image Schema
 */
const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  publicId: z.string().optional(),
  altText: z.string().max(200, 'Alt text cannot exceed 200 characters').optional(),
  displayOrder: z.number().min(0).optional(),
});

/**
 * Pricing Schema
 */
const pricingSchema = z.object({
  basePrice: z.number()
    .min(0, 'Base price must be at least 0')
    .max(10000000, 'Price cannot exceed 10,000,000'),
  customStitchingCharge: z.number().min(0).optional().default(0),
  brandArticleCharge: z.number().min(0).optional().default(0),
  fabricProvidedByLC: z.number().min(0).optional().default(0),
  rushOrderFee: z.number().min(0).optional().default(0),
  discount: z.object({
    percentage: z.number().min(0).max(100).optional(),
    amount: z.number().min(0).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
  }).optional(),
  currency: z.enum(['PKR', 'USD']).optional().default('PKR'),
});

/**
 * Fabric Schema
 */
const fabricSchema = z.object({
  type: z.string().min(1, 'Fabric type is required'),
  name: z.string().optional(),
  color: z.string().optional(),
  pattern: z.string().optional(),
  weight: z.string().optional(),
  composition: z.string().optional(),
  careInstructions: z.string().optional(),
});

/**
 * Inventory Schema
 */
const inventorySchema = z.object({
  trackInventory: z.boolean().default(false),
  stockQuantity: z.number()
    .min(0, 'Stock quantity cannot be negative')
    .default(0),
  lowStockThreshold: z.number()
    .min(0, 'Low stock threshold cannot be negative')
    .default(5),
  sku: skuSchema,
});

/**
 * Availability Schema
 */
const availabilitySchema = z.object({
  status: z.enum(['in-stock', 'made-to-order', 'out-of-stock', 'discontinued']),
  expectedRestockDate: z.string().optional(),
});

/**
 * Size Availability Schema
 */
const sizeAvailabilitySchema = z.object({
  availableSizes: z.array(z.string()).default([]),
  customSizesAvailable: z.boolean().default(false),
});

/**
 * Color Schema
 */
const colorSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').optional(),
  image: z.string().url().optional(),
  inStock: z.boolean().optional().default(true),
});

/**
 * SEO Schema
 */
const seoSchema = z.object({
  metaTitle: z.string()
    .max(60, 'Meta title should not exceed 60 characters')
    .optional(),
  metaDescription: z.string()
    .max(160, 'Meta description should not exceed 160 characters')
    .optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
});

/**
 * Complete Product Form Schema
 */
export const productFormSchema = z.object({
  // Basic Info
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(3000, 'Description cannot exceed 3000 characters')
    .trim(),
  shortDescription: z.string()
    .max(250, 'Short description cannot exceed 250 characters')
    .optional()
    .or(z.literal('')),
  designCode: designCodeSchema,
  sku: skuSchema,

  // Category & Classification
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().or(z.literal('')),
  occasion: z.enum([
    'Bridal', 'Party Wear', 'Casual', 'Formal', 'Semi-Formal',
    'Mehndi', 'Walima', 'Engagement', 'Eid', 'Summer', 'Winter',
    'Everyday', 'Office Wear', 'Other'
  ]).optional(),
  tags: z.array(z.string()).optional().default([]),

  // Pricing
  pricing: pricingSchema,

  // Images
  images: z.array(productImageSchema)
    .min(1, 'At least one product image is required')
    .max(10, 'Cannot upload more than 10 images'),
  primaryImage: z.string().url().optional(),
  thumbnailImage: z.string().url().optional(),

  // Fabric
  fabric: fabricSchema,

  // Inventory
  inventory: inventorySchema,

  // Availability
  availability: availabilitySchema,

  // Product Type
  productType: z.enum(['ready-made', 'custom-only', 'both']).default('both'),

  // Size Availability
  sizeAvailability: sizeAvailabilitySchema,

  // Colors
  availableColors: z.array(colorSchema).optional().default([]),

  // Features & Content
  features: z.array(z.string().max(100, 'Feature description too long')).optional().default([]),
  whatsIncluded: z.array(z.string()).optional().default([]),

  // Status Flags
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),

  // SEO
  seo: seoSchema.optional().default({}),

  // Admin
  adminNotes: z.string().max(500, 'Admin notes cannot exceed 500 characters').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // Validate that primary image exists in images array
  if (data.primaryImage && data.images.length > 0) {
    const primaryExists = data.images.some(img => img.url === data.primaryImage);
    if (!primaryExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Primary image must be one of the uploaded images',
        path: ['primaryImage'],
      });
    }
  }

  // Validate discount dates
  if (data.pricing.discount?.startDate && data.pricing.discount?.endDate) {
    const startDate = new Date(data.pricing.discount.startDate);
    const endDate = new Date(data.pricing.discount.endDate);
    if (endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Discount end date must be after start date',
        path: ['pricing', 'discount', 'endDate'],
      });
    }
  }

  // Validate stock quantity if tracking inventory
  if (data.inventory.trackInventory && data.availability.status === 'in-stock') {
    if (data.inventory.stockQuantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Stock quantity must be greater than 0 for in-stock products',
        path: ['inventory', 'stockQuantity'],
      });
    }
  }
});

/**
 * Product Table Filter Schema
 */
export const productTableFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['all', 'in-stock', 'made-to-order', 'out-of-stock', 'discontinued']).optional(),
  featured: z.boolean().optional(),
  productType: z.enum(['ready-made', 'custom-only', 'both']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  occasion: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Bulk Action Schema
 */
export const bulkActionSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product must be selected'),
  action: z.enum(['delete', 'activate', 'deactivate', 'feature', 'unfeature', 'export']),
  data: z.record(z.any()).optional(),
});

/**
 * Type exports for form data
 */
export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductTableFilters = z.infer<typeof productTableFilterSchema>;
export type BulkActionRequest = z.infer<typeof bulkActionSchema>;

