/**
 * Zod Validation Schemas for Custom Order Wizard
 * Production-ready validation for each step
 * 
 * @module lib/validations/custom-order-schemas
 */

import { z } from 'zod';

/**
 * Step 1: Service Type Schema
 */
export const serviceTypeSchema = z.object({
  serviceType: z.enum(['fully-custom', 'brand-article'], {
    required_error: 'Please select a service type',
  }),
  designIdea: z.string().optional().refine(
    (val, ctx) => {
      const serviceType = ctx.parent?.serviceType;
      if (serviceType === 'fully-custom') {
        return val && val.trim().length >= 50;
      }
      return true;
    },
    {
      message: 'Design idea must be at least 50 characters for fully custom orders',
    }
  ),
});

/**
 * Step 2: Reference Images Schema
 */
export const referenceImagesSchema = z.object({
  referenceImages: z.array(z.any()).min(2, {
    message: 'Please upload at least 2 reference images',
  }).max(6, {
    message: 'Maximum 6 images allowed',
  }).optional(),
  serviceType: z.enum(['fully-custom', 'brand-article']),
}).refine(
  (data) => {
    // Skip validation if fully-custom
    if (data.serviceType === 'fully-custom') {
      return true;
    }
    return data.referenceImages && data.referenceImages.length >= 2;
  },
  {
    message: 'Please upload at least 2 reference images for brand article orders',
    path: ['referenceImages'],
  }
);

/**
 * Step 3: Fabric Selection Schema
 */
export const fabricSelectionSchema = z.object({
  fabricSource: z.enum(['lc-provides', 'customer-provides'], {
    required_error: 'Please select fabric source',
  }),
  selectedFabric: z.any().nullable().optional(),
  fabricDetails: z.string().optional(),
}).refine(
  (data) => {
    if (data.fabricSource === 'lc-provides') {
      return data.selectedFabric !== null && data.selectedFabric !== undefined;
    }
    if (data.fabricSource === 'customer-provides') {
      return data.fabricDetails && data.fabricDetails.trim().length >= 20;
    }
    return true;
  },
  {
    message: 'Please select a fabric or provide fabric details',
    path: ['selectedFabric'],
  }
).refine(
  (data) => {
    if (data.fabricSource === 'customer-provides') {
      return data.fabricDetails && data.fabricDetails.trim().length >= 20;
    }
    return true;
  },
  {
    message: 'Please describe the fabric you will provide (at least 20 characters)',
    path: ['fabricDetails'],
  }
);

/**
 * Measurements Schema
 */
export const measurementsSchema = z.object({
  shirtLength: z.union([z.string(), z.number()]).optional(),
  shoulderWidth: z.union([z.string(), z.number()]).optional(),
  sleeveLength: z.union([z.string(), z.number()]).optional(),
  armHole: z.union([z.string(), z.number()]).optional(),
  bust: z.union([z.string(), z.number()]).optional(),
  waist: z.union([z.string(), z.number()]).optional(),
  hip: z.union([z.string(), z.number()]).optional(),
  frontNeckDepth: z.union([z.string(), z.number()]).optional(),
  backNeckDepth: z.union([z.string(), z.number()]).optional(),
  wrist: z.union([z.string(), z.number()]).optional(),
  trouserLength: z.union([z.string(), z.number()]).optional(),
  trouserWaist: z.union([z.string(), z.number()]).optional(),
  trouserHip: z.union([z.string(), z.number()]).optional(),
  thigh: z.union([z.string(), z.number()]).optional(),
  bottom: z.union([z.string(), z.number()]).optional(),
  kneeLength: z.union([z.string(), z.number()]).optional(),
  dupattaLength: z.union([z.string(), z.number()]).optional(),
  dupattaWidth: z.union([z.string(), z.number()]).optional(),
  shirtStyle: z.enum(['normal', 'cape', 'with-shalwar', 'mgirl']).optional(),
});

/**
 * Step 4: Measurements Schema
 */
export const measurementsStepSchema = z.object({
  useStandardSize: z.boolean(),
  standardSize: z.enum(['XS', 'S', 'M', 'L', 'XL']).optional(),
  measurements: measurementsSchema,
  saveMeasurements: z.boolean().optional(),
  measurementLabel: z.string().optional(),
}).refine(
  (data) => {
    if (data.useStandardSize) {
      return !!data.standardSize;
    }
    // Validate required measurements for custom
    const required = ['shirtLength', 'shoulderWidth', 'bust', 'waist'];
    return required.every(field => {
      const value = data.measurements[field as keyof typeof data.measurements];
      return value !== undefined && value !== '' && value !== null;
    });
  },
  {
    message: 'Please select a standard size or fill required measurements',
    path: ['standardSize'],
  }
).refine(
  (data) => {
    if (!data.useStandardSize) {
      const required = ['shirtLength', 'shoulderWidth', 'bust', 'waist'];
      return required.every(field => {
        const value = data.measurements[field as keyof typeof data.measurements];
        return value !== undefined && value !== '' && value !== null;
      });
    }
    return true;
  },
  {
    message: 'Required measurements: Shirt Length, Shoulder Width, Bust, Waist',
    path: ['measurements'],
  }
).refine(
  (data) => {
    if (data.saveMeasurements && !data.measurementLabel?.trim()) {
      return false;
    }
    return true;
  },
  {
    message: 'Please provide a label for saved measurements',
    path: ['measurementLabel'],
  }
);

/**
 * Customer Info Schema
 */
export const customerInfoSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number is required').regex(
    /^(\+92[0-9]{10}|0[0-9]{10}|[0-9]{10})$/,
    'Invalid Pakistani phone number'
  ),
  whatsapp: z.string().optional(),
});

/**
 * Step 5: Review Schema
 */
export const reviewStepSchema = z.object({
  specialInstructions: z.string().max(1000, 'Instructions cannot exceed 1000 characters').optional(),
  rushOrder: z.boolean().optional(),
  customerInfo: customerInfoSchema,
});

/**
 * Complete Order Schema
 */
export const completeOrderSchema = z.object({
  serviceType: serviceTypeSchema.shape.serviceType,
  designIdea: serviceTypeSchema.shape.designIdea,
  referenceImages: referenceImagesSchema.shape.referenceImages,
  fabricSource: fabricSelectionSchema.shape.fabricSource,
  selectedFabric: z.any().nullable().optional(),
  fabricDetails: fabricSelectionSchema.shape.fabricDetails,
  useStandardSize: measurementsStepSchema.shape.useStandardSize,
  standardSize: measurementsStepSchema.shape.standardSize,
  measurements: measurementsSchema,
  saveMeasurements: measurementsStepSchema.shape.saveMeasurements,
  measurementLabel: measurementsStepSchema.shape.measurementLabel,
  specialInstructions: reviewStepSchema.shape.specialInstructions,
  rushOrder: reviewStepSchema.shape.rushOrder,
  customerInfo: customerInfoSchema,
});

/**
 * Step Validation Functions
 */
export const validateStep = {
  step1: (data: any) => {
    try {
      serviceTypeSchema.parse(data);
      return { valid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
      }
      return { valid: false, errors };
    }
  },
  
  step2: (data: any) => {
    try {
      referenceImagesSchema.parse(data);
      return { valid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
      }
      return { valid: false, errors };
    }
  },
  
  step3: (data: any) => {
    try {
      fabricSelectionSchema.parse(data);
      return { valid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
      }
      return { valid: false, errors };
    }
  },
  
  step4: (data: any) => {
    try {
      measurementsStepSchema.parse(data);
      return { valid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      return { valid: false, errors };
    }
  },
  
  step5: (data: any) => {
    try {
      reviewStepSchema.parse(data);
      return { valid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      return { valid: false, errors };
    }
  },
};

export default {
  serviceTypeSchema,
  referenceImagesSchema,
  fabricSelectionSchema,
  measurementsSchema,
  measurementsStepSchema,
  customerInfoSchema,
  reviewStepSchema,
  completeOrderSchema,
  validateStep,
};

