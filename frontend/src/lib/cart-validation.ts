/**
 * Cart Validation Utilities
 * Production-ready validation functions for cart operations
 * 
 * @module lib/cart-validation
 */

import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

/**
 * Validate quantity
 */
export function validateQuantity(quantity: number, maxQuantity: number = 99): {
  valid: boolean;
  error?: string;
} {
  if (quantity < 1) {
    return { valid: false, error: 'Quantity must be at least 1' };
  }

  if (quantity > maxQuantity) {
    return { valid: false, error: `Maximum quantity is ${maxQuantity}` };
  }

  if (!Number.isInteger(quantity)) {
    return { valid: false, error: 'Quantity must be a whole number' };
  }

  return { valid: true };
}

/**
 * Validate stock availability
 */
export function validateStock(
  quantity: number,
  stockAvailable: number,
  currentQuantity: number = 0
): {
  valid: boolean;
  error?: string;
  available: number;
} {
  if (stockAvailable <= 0) {
    return {
      valid: false,
      error: 'Product is out of stock',
      available: 0,
    };
  }

  const totalQuantity = currentQuantity + quantity;
  if (totalQuantity > stockAvailable) {
    return {
      valid: false,
      error: `Only ${stockAvailable} items available in stock`,
      available: stockAvailable,
    };
  }

  return {
    valid: true,
    available: stockAvailable,
  };
}

/**
 * Validate product for cart
 */
export function validateProduct(product: Product): {
  valid: boolean;
  error?: string;
} {
  if (!product) {
    return { valid: false, error: 'Product is required' };
  }

  if (!product._id && !product.id) {
    return { valid: false, error: 'Product ID is required' };
  }

  const price = product.pricing?.basePrice || product.price;
  if (!price || price <= 0) {
    return { valid: false, error: 'Product price is invalid' };
  }

  // Check if product is active
  if (product.isActive === false) {
    return { valid: false, error: 'Product is no longer available' };
  }

  return { valid: true };
}

/**
 * Validate cart item
 */
export function validateCartItem(item: CartItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate product
  const productValidation = validateProduct(item.product);
  if (!productValidation.valid) {
    errors.push(productValidation.error || 'Invalid product');
  }

  // Validate quantity
  const quantityValidation = validateQuantity(item.quantity);
  if (!quantityValidation.valid) {
    errors.push(quantityValidation.error || 'Invalid quantity');
  }

  // Validate stock
  const stockAvailable = item.stockAvailable || item.product.inventory?.stockQuantity || item.product.stockQuantity || 0;
  if (stockAvailable > 0) {
    const stockValidation = validateStock(item.quantity, stockAvailable);
    if (!stockValidation.valid) {
      errors.push(stockValidation.error || 'Insufficient stock');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate entire cart
 */
export function validateCart(items: CartItem[]): {
  valid: boolean;
  errors: Array<{
    itemId: string;
    productId: string;
    message: string;
  }>;
} {
  const errors: Array<{
    itemId: string;
    productId: string;
    message: string;
  }> = [];

  items.forEach((item) => {
    const validation = validateCartItem(item);
    if (!validation.valid) {
      validation.errors.forEach((error) => {
        errors.push({
          itemId: item.id,
          productId: item.productId,
          message: error,
        });
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if cart item can be updated
 */
export function canUpdateQuantity(
  item: CartItem,
  newQuantity: number
): {
  canUpdate: boolean;
  error?: string;
} {
  // Validate quantity
  const quantityValidation = validateQuantity(newQuantity);
  if (!quantityValidation.valid) {
    return {
      canUpdate: false,
      error: quantityValidation.error,
    };
  }

  // Validate stock
  const stockAvailable = item.stockAvailable || item.product.inventory?.stockQuantity || item.product.stockQuantity || 0;
  if (stockAvailable > 0) {
    const stockValidation = validateStock(newQuantity, stockAvailable);
    if (!stockValidation.valid) {
      return {
        canUpdate: false,
        error: stockValidation.error,
      };
    }
  }

  return { canUpdate: true };
}

/**
 * Calculate maximum allowed quantity
 */
export function getMaxQuantity(item: CartItem): number {
  const stockAvailable = item.stockAvailable || item.product.inventory?.stockQuantity || item.product.stockQuantity || 0;
  
  if (stockAvailable > 0) {
    return Math.min(stockAvailable, 99);
  }

  return 99; // No stock limit
}

export default {
  validateQuantity,
  validateStock,
  validateProduct,
  validateCartItem,
  validateCart,
  canUpdateQuantity,
  getMaxQuantity,
};

