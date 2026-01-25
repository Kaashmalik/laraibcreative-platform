/**
 * Product Validation Schema Tests
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from '@jest/globals';
import { productFormSchema } from '@/lib/validations/product-schemas';
import { validProductData, invalidProductData } from '../__fixtures__/validation.fixtures';

describe('Product Validation Schemas', () => {
  describe('productFormSchema', () => {
    it('should validate correct product data', () => {
      const result = productFormSchema.safeParse(validProductData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(validProductData.title);
      }
    });

    it('should reject invalid product data', () => {
      const result = productFormSchema.safeParse(invalidProductData);
      expect(result.success).toBe(false);
    });
  });
});
