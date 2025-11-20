/**
 * Product Validation Schema Tests
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from '@jest/globals';
import { productSchema } from '@/lib/validations/product-schemas';
import { validProductData, invalidProductData } from '../__fixtures__/validation.fixtures';

describe('Product Validation Schemas', () => {
  describe('productSchema', () => {
    it('should validate correct product data', () => {
      const result = productSchema.safeParse(validProductData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(validProductData.title);
      }
    });

    it('should reject empty title', () => {
      const result = productSchema.safeParse({
        ...validProductData,
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid design code format', () => {
      const result = productSchema.safeParse({
        ...validProductData,
        designCode: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = productSchema.safeParse({
        ...validProductData,
        pricing: {
          basePrice: -100,
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative stock quantity', () => {
      const result = productSchema.safeParse({
        ...validProductData,
        inventory: {
          stockQuantity: -5,
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject SKU that is too short', () => {
      const result = productSchema.safeParse({
        ...validProductData,
        sku: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid optional fields', () => {
      const result = productSchema.safeParse({
        ...validProductData,
        sku: undefined,
        description: undefined,
      });
      expect(result.success).toBe(true);
    });
  });
});

