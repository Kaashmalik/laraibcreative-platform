/**
 * Product Validation Schemas
 * 
 * Comprehensive validation for product creation and updates
 * Uses Zod for type-safe validation with detailed error messages
 * 
 * @module utils/productValidation
 */

const { z } = require('zod');

// ============================================
// REUSABLE SCHEMAS
// ============================================

const objectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

const urlSchema = z.string()
  .url('Invalid URL format')
  .or(z.string().startsWith('https://res.cloudinary.com'))
  .or(z.string().startsWith('http://res.cloudinary.com'));

// ============================================
// FABRIC SCHEMA
// ============================================

const fabricTypes = [
  'Lawn', 'Chiffon', 'Silk', 'Cotton', 'Velvet', 'Organza',
  'Georgette', 'Jacquard', 'Linen', 'Khaddar', 'Karandi',
  'Cambric', 'Marina', 'Net', 'Banarsi', 'Raw Silk',
  'Jamawar', 'Other'
];

const fabricSchema = z.object({
  type: z.enum(fabricTypes, {
    errorMap: () => ({ message: `Fabric type must be one of: ${fabricTypes.join(', ')}` })
  }),
  composition: z.string().max(200, 'Fabric composition cannot exceed 200 characters').optional().default(''),
  weight: z.enum(['Light', 'Medium', 'Heavy', '']).optional().default(''),
  care: z.string().max(500, 'Care instructions cannot exceed 500 characters').optional().default(''),
  stretchable: z.boolean().optional().default(false),
  texture: z.enum(['Smooth', 'Textured', 'Embroidered', 'Printed', 'Plain', '']).optional().default('')
}).passthrough();

// ============================================
// PRICING SCHEMA
// ============================================

const discountSchema = z.object({
  percentage: z.number().min(0).max(100).optional().default(0),
  amount: z.number().min(0).optional().default(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional().default(false)
}).optional();

const pricingSchema = z.object({
  basePrice: z.number({
    required_error: 'Base price is required',
    invalid_type_error: 'Base price must be a number'
  }).positive('Base price must be greater than 0'),
  customStitchingCharge: z.number().min(0).optional().default(0),
  brandArticleCharge: z.number().min(0).optional().default(0),
  fabricProvidedByLC: z.number().min(0).optional().default(0),
  rushOrderFee: z.number().min(0).optional().default(0),
  discount: discountSchema,
  currency: z.enum(['PKR', 'USD']).optional().default('PKR')
}).passthrough();

// ============================================
// IMAGE SCHEMA
// ============================================

const imageTypeEnum = ['front', 'back', 'side', 'detail', 'closeup', 'dupatta', 'trouser', 'full-set', 'model', 'flat-lay', 'other'];

const imageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  publicId: z.string().optional().default(''),
  altText: z.string().optional().default(''),
  displayOrder: z.number().int().min(0).optional().default(0),
  imageType: z.enum(imageTypeEnum).optional().default('other'),
  caption: z.string().max(100, 'Image caption cannot exceed 100 characters').optional().default('')
}).or(z.string()); // Also allow plain string URLs

// ============================================
// EMBROIDERY DETAILS SCHEMA
// ============================================

const embroideryWorkTypes = [
  'hand-karhai', 'machine-embroidery', 'zardozi', 'aari', 'gota-kinari',
  'dabka', 'kora', 'sequins', 'beads', 'thread-work', 'resham',
  'tilla', 'mirror-work', 'applique', 'cutwork', 'shadow-work',
  'chikankari', 'phulkari', 'kashmiri', 'mixed', 'none'
];

const embroideryDetailsSchema = z.object({
  workType: z.enum(embroideryWorkTypes).optional().default('none'),
  complexity: z.enum(['simple', 'moderate', 'intricate', 'heavy', 'bridal']).optional().default('simple'),
  coverage: z.enum(['minimal', 'partial', 'full', 'heavy', 'all-over']).optional().default('minimal'),
  placement: z.array(z.enum(['front-panel', 'back-panel', 'sleeves', 'neckline', 'daman', 'dupatta', 'trouser', 'border', 'motifs'])).optional().default([]),
  estimatedHours: z.number().min(0).optional().default(0),
  additionalCost: z.number().min(0).optional().default(0),
  description: z.string().max(500, 'Embroidery description cannot exceed 500 characters').optional().default(''),
  threadColors: z.array(z.string()).optional().default([])
}).optional();

// ============================================
// SUIT COMPONENTS SCHEMA
// ============================================

const suitComponentSchema = z.object({
  included: z.boolean().optional().default(true),
  fabric: z.string().optional().default(''),
  length: z.string().optional().default(''),
  description: z.string().optional().default('')
}).optional();

const suitComponentsSchema = z.object({
  shirt: suitComponentSchema,
  dupatta: suitComponentSchema,
  trouser: suitComponentSchema
}).optional();

// ============================================
// AVAILABILITY SCHEMA
// ============================================

const availabilityStatuses = ['in-stock', 'made-to-order', 'out-of-stock', 'discontinued'];

const availabilitySchema = z.object({
  status: z.enum(availabilityStatuses).optional().default('made-to-order'),
  expectedRestockDate: z.date().optional()
}).or(z.enum(availabilityStatuses)); // Also allow string for backward compatibility

// ============================================
// SEO SCHEMA
// ============================================

const seoSchema = z.object({
  metaTitle: z.string().max(60, 'Meta title should not exceed 60 characters').optional().default(''),
  metaDescription: z.string().max(160, 'Meta description should not exceed 160 characters').optional().default(''),
  keywords: z.array(z.string()).optional().default([]),
  focusKeyword: z.string().optional().default(''),
  ogImage: z.string().optional()
}).optional();

// ============================================
// INVENTORY SCHEMA
// ============================================

const inventorySchema = z.object({
  trackInventory: z.boolean().optional().default(false),
  stockQuantity: z.number().int().min(0).optional().default(0),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
  sku: z.string().optional()
}).optional();

// ============================================
// SIZE AVAILABILITY SCHEMA
// ============================================

const sizeAvailabilitySchema = z.object({
  standardSizes: z.array(z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'])).optional().default(['S', 'M', 'L', 'XL']),
  customSizeOnly: z.boolean().optional().default(false),
  measurementGuide: z.string().max(1000).optional().default('')
}).optional();

// ============================================
// MAIN PRODUCT SCHEMA
// ============================================

const occasions = [
  'Bridal', 'Party Wear', 'Casual', 'Formal', 'Semi-Formal',
  'Mehndi', 'Walima', 'Engagement', 'Eid', 'Summer', 'Winter',
  'Everyday', 'Office Wear', 'Other'
];

const productTypes = ['ready-made', 'custom-only', 'both'];
const suitTypes = ['ready-made', 'replica', 'karhai', 'hand-karhai'];

/**
 * Create Product Validation Schema
 */
const createProductSchema = z.object({
  // Required fields
  title: z.string({
    required_error: 'Product title is required'
  })
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  
  description: z.string({
    required_error: 'Product description is required'
  })
    .min(20, 'Description must be at least 20 characters')
    .max(3000, 'Description cannot exceed 3000 characters')
    .trim(),
  
  category: objectIdSchema.describe('Category ID'),
  
  pricing: pricingSchema,
  
  fabric: fabricSchema,
  
  // Optional fields with defaults
  shortDescription: z.string().max(250).optional().default(''),
  designCode: z.string().optional(), // Auto-generated if not provided
  subcategory: z.string().optional().default(''),
  occasion: z.enum(occasions).optional(),
  tags: z.array(z.string()).optional().default([]),
  
  // Images
  images: z.array(imageSchema).min(1, 'At least one product image is required').max(15, 'Maximum 15 images allowed').optional().default([]),
  primaryImage: z.string().optional(),
  thumbnailImage: z.string().optional(),
  
  // Colors
  availableColors: z.array(z.object({
    name: z.string().min(1),
    hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    image: z.string().optional(),
    inStock: z.boolean().optional().default(true)
  })).optional().default([]),
  
  // Product classification
  productType: z.enum(productTypes).optional().default('both'),
  type: z.enum(suitTypes).optional().default('ready-made'),
  articleName: z.string().max(100).optional().default(''),
  articleCode: z.string().max(50).optional().default(''),
  
  // Embroidery & components
  embroideryDetails: embroideryDetailsSchema,
  suitComponents: suitComponentsSchema,
  
  // Inventory & availability
  inventory: inventorySchema,
  availability: availabilitySchema,
  sizeAvailability: sizeAvailabilitySchema,
  
  // Features
  features: z.array(z.string().max(100)).optional().default([]),
  whatsIncluded: z.array(z.string()).optional().default([]),
  
  // Flags
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isNewArrival: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  
  // SEO
  seo: seoSchema,
  
  // Admin
  adminNotes: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft')
}).passthrough(); // Allow additional fields

/**
 * Update Product Validation Schema
 * All fields optional for partial updates
 */
const updateProductSchema = createProductSchema.partial().extend({
  replaceImages: z.boolean().optional().default(false)
});

/**
 * Bulk Update Validation Schema
 */
const bulkUpdateSchema = z.object({
  productIds: z.array(objectIdSchema).min(1, 'At least one product ID required'),
  updates: z.record(z.any()).refine(
    (val) => Object.keys(val).length > 0,
    'At least one update field required'
  )
});

/**
 * Bulk Delete Validation Schema
 */
const bulkDeleteSchema = z.object({
  productIds: z.array(objectIdSchema).min(1, 'At least one product ID required')
});

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Validate product data for creation
 * @param {Object} data - Product data to validate
 * @returns {Object} { success: boolean, data?: Object, errors?: Object }
 */
const validateCreateProduct = (data) => {
  try {
    const validated = createProductSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    throw error;
  }
};

/**
 * Validate product data for update
 * @param {Object} data - Product data to validate
 * @returns {Object} { success: boolean, data?: Object, errors?: Object }
 */
const validateUpdateProduct = (data) => {
  try {
    const validated = updateProductSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    throw error;
  }
};

/**
 * Validate bulk update data
 * @param {Object} data - Bulk update data
 * @returns {Object} { success: boolean, data?: Object, errors?: Object }
 */
const validateBulkUpdate = (data) => {
  try {
    const validated = bulkUpdateSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    throw error;
  }
};

/**
 * Validate bulk delete data
 * @param {Object} data - Bulk delete data
 * @returns {Object} { success: boolean, data?: Object, errors?: Object }
 */
const validateBulkDelete = (data) => {
  try {
    const validated = bulkDeleteSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    throw error;
  }
};

/**
 * Safe parse with fallback - doesn't throw, returns parsed or original
 * @param {Object} data - Data to parse
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {Object} Parsed data or original with _parseError flag
 */
const safeParse = (data, schema) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return { ...data, _parseError: result.error };
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Schemas
  createProductSchema,
  updateProductSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  fabricSchema,
  pricingSchema,
  imageSchema,
  seoSchema,
  
  // Validators
  validateCreateProduct,
  validateUpdateProduct,
  validateBulkUpdate,
  validateBulkDelete,
  safeParse,
  
  // Constants
  fabricTypes,
  occasions,
  productTypes,
  suitTypes,
  imageTypeEnum,
  embroideryWorkTypes,
  availabilityStatuses
};

