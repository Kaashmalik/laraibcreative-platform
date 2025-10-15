/**
 * Validation Middleware
 * Handles request validation using Joi schemas
 * 
 * Features:
 * - Product validation
 * - Category validation
 * - Order validation
 * - User validation
 * - Measurement validation
 * - Comprehensive error messages
 * - Sanitization
 */

const Joi = require('joi');

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Product Creation Schema
 */
const productSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Product title is required',
      'string.min': 'Product title must be at least 3 characters',
      'string.max': 'Product title cannot exceed 200 characters'
    }),

  description: Joi.string()
    .trim()
    .min(20)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Product description is required',
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 5000 characters'
    }),

  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Category is required',
      'string.pattern.base': 'Invalid category ID format'
    }),

  subcategory: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),

  fabric: Joi.object({
    type: Joi.string().trim().max(100).optional(),
    composition: Joi.string().trim().max(500).optional(),
    care: Joi.string().trim().max(500).optional()
  }).optional(),

  pricing: Joi.object({
    basePrice: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'Base price must be a number',
        'number.min': 'Base price cannot be negative',
        'any.required': 'Base price is required'
      }),
    customStitchingCharge: Joi.number().min(0).optional().default(0),
    discount: Joi.number().min(0).max(100).optional().default(0)
  }).required(),

  availability: Joi.string()
    .valid('in-stock', 'out-of-stock', 'custom-only', 'pre-order')
    .optional()
    .default('in-stock'),

  featured: Joi.boolean().optional().default(false),

  seo: Joi.object({
    metaTitle: Joi.string().trim().max(60).optional(),
    metaDescription: Joi.string().trim().max(160).optional(),
    keywords: Joi.array().items(Joi.string().trim()).optional()
  }).optional(),

  occasion: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),

  colors: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  sizes: Joi.array()
    .items(Joi.string().trim())
    .optional()
});

/**
 * Product Update Schema (all fields optional)
 */
const productUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(20).max(5000).optional(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  subcategory: Joi.string().trim().max(100).optional().allow(''),
  fabric: Joi.object({
    type: Joi.string().trim().max(100).optional(),
    composition: Joi.string().trim().max(500).optional(),
    care: Joi.string().trim().max(500).optional()
  }).optional(),
  pricing: Joi.object({
    basePrice: Joi.number().min(0).optional(),
    customStitchingCharge: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).max(100).optional()
  }).optional(),
  availability: Joi.string()
    .valid('in-stock', 'out-of-stock', 'custom-only', 'pre-order')
    .optional(),
  featured: Joi.boolean().optional(),
  seo: Joi.object({
    metaTitle: Joi.string().trim().max(60).optional(),
    metaDescription: Joi.string().trim().max(160).optional(),
    keywords: Joi.array().items(Joi.string().trim()).optional()
  }).optional(),
  occasion: Joi.string().trim().max(100).optional().allow(''),
  colors: Joi.array().items(Joi.string().trim()).optional(),
  sizes: Joi.array().items(Joi.string().trim()).optional(),
  setPrimaryImage: Joi.boolean().optional()
}).min(1); // At least one field must be present

/**
 * Category Schema
 */
const categorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name cannot exceed 100 characters'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(''),

  parentCategory: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid parent category ID format'
    }),

  displayOrder: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),

  isActive: Joi.boolean()
    .optional()
    .default(true)
});

/**
 * Order Creation Schema
 */
const orderSchema = Joi.object({
  customerInfo: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().pattern(/^(\+92|0)?[0-9]{10}$/).required()
      .messages({
        'string.pattern.base': 'Invalid phone number format. Use Pakistani format (03XXXXXXXXX)'
      }),
    whatsapp: Joi.string().trim().pattern(/^(\+92|0)?[0-9]{10}$/).optional()
  }).required(),

  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        isCustom: Joi.boolean().optional().default(false),
        measurements: Joi.when('isCustom', {
          is: true,
          then: Joi.object().required(),
          otherwise: Joi.optional()
        }),
        referenceImages: Joi.array().items(Joi.string().uri()).optional(),
        specialInstructions: Joi.string().trim().max(1000).optional().allow(''),
        fabric: Joi.string().trim().max(200).optional().allow(''),
        quantity: Joi.number().integer().min(1).optional().default(1)
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Order must contain at least one item'
    }),

  shippingAddress: Joi.object({
    fullAddress: Joi.string().trim().min(10).max(500).required(),
    city: Joi.string().trim().min(2).max(100).required(),
    province: Joi.string().trim().min(2).max(100).required(),
    postalCode: Joi.string().trim().optional().allow(''),
    landmark: Joi.string().trim().max(200).optional().allow('')
  }).required(),

  payment: Joi.object({
    method: Joi.string()
      .valid('bank-transfer', 'jazzcash', 'easypaisa', 'cod')
      .required(),
    transactionId: Joi.string().trim().when('method', {
      is: Joi.valid('bank-transfer', 'jazzcash', 'easypaisa'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    transactionDate: Joi.date().when('method', {
      is: Joi.valid('bank-transfer', 'jazzcash', 'easypaisa'),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }).required()
});

/**
 * Measurement Schema
 */
const measurementSchema = Joi.object({
  label: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Measurement label is required',
      'string.min': 'Label must be at least 2 characters'
    }),

  measurements: Joi.object({
    // Upper body measurements
    shirtLength: Joi.number().min(10).max(100).optional(),
    shoulderWidth: Joi.number().min(5).max(50).optional(),
    sleeveLength: Joi.number().min(10).max(80).optional(),
    armHole: Joi.number().min(5).max(50).optional(),
    bust: Joi.number().min(20).max(100).optional(),
    waist: Joi.number().min(15).max(100).optional(),
    hip: Joi.number().min(20).max(120).optional(),
    frontNeckDepth: Joi.number().min(2).max(30).optional(),
    backNeckDepth: Joi.number().min(2).max(30).optional(),
    wrist: Joi.number().min(3).max(20).optional(),

    // Lower body measurements
    trouserLength: Joi.number().min(20).max(120).optional(),
    trouserWaist: Joi.number().min(15).max(100).optional(),
    trouserHip: Joi.number().min(20).max(120).optional(),
    thigh: Joi.number().min(10).max(80).optional(),
    bottom: Joi.number().min(5).max(50).optional(),
    kneeLength: Joi.number().min(10).max(80).optional(),

    // Dupatta measurements
    dupattaLength: Joi.number().min(50).max(300).optional(),
    dupattaWidth: Joi.number().min(20).max(150).optional()
  })
    .min(1)
    .required()
    .messages({
      'object.min': 'At least one measurement is required'
    }),

  unit: Joi.string()
    .valid('inches', 'cm')
    .optional()
    .default('inches')
});

/**
 * User Registration Schema
 */
const userRegistrationSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Name must be at least 2 characters'
    }),

  email: Joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format'
    }),

  whatsapp: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?[0-9]{10}$/)
    .optional()
});

/**
 * User Login Schema
 */
const userLoginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

/**
 * Contact Form Schema
 */
const contactFormSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  email: Joi.string()
    .trim()
    .email()
    .required(),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?[0-9]{10}$/)
    .optional(),

  subject: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required(),

  message: Joi.string()
    .trim()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Message must be at least 20 characters'
    })
});

/**
 * Review Schema
 */
const reviewSchema = Joi.object({
  product: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),

  order: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5'
    }),

  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required(),

  comment: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Review must be at least 10 characters'
    })
});

// ============================================
// VALIDATION MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Generic validation middleware
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Get all errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

/**
 * Validate Product Creation
 */
const validateProduct = validate(productSchema);

/**
 * Validate Product Update
 */
const validateProductUpdate = validate(productUpdateSchema);

/**
 * Validate Category
 */
const validateCategory = validate(categorySchema);

/**
 * Validate Order Creation
 */
const validateOrder = validate(orderSchema);

/**
 * Validate Measurement
 */
const validateMeasurement = validate(measurementSchema);

/**
 * Validate User Registration
 */
const validateUserRegistration = validate(userRegistrationSchema);

/**
 * Validate User Login
 */
const validateUserLogin = validate(userLoginSchema);

/**
 * Validate Contact Form
 */
const validateContactForm = validate(contactFormSchema);

/**
 * Validate Review
 */
const validateReview = validate(reviewSchema);

/**
 * Validate ObjectId parameter
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

/**
 * Validate query parameters
 */
const validateQueryParams = (allowedParams) => {
  return (req, res, next) => {
    const invalidParams = Object.keys(req.query).filter(
      param => !allowedParams.includes(param)
    );

    if (invalidParams.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${invalidParams.join(', ')}`,
        allowedParams
      });
    }

    next();
  };
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove HTML tags and scripts
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Validation middleware
  validateProduct,
  validateProductUpdate,
  validateCategory,
  validateOrder,
  validateMeasurement,
  validateUserRegistration,
  validateUserLogin,
  validateContactForm,
  validateReview,
  validateObjectId,
  validateQueryParams,
  sanitizeInput,
  
  // Schemas (for custom validation)
  productSchema,
  productUpdateSchema,
  categorySchema,
  orderSchema,
  measurementSchema,
  userRegistrationSchema,
  userLoginSchema,
  contactFormSchema,
  reviewSchema,
  
  // Generic validator
  validate
};