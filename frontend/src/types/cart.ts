/**
 * Cart System TypeScript Types
 * Production-ready type definitions for shopping cart
 * 
 * @module types/cart
 */

import type { Product } from './product';

/**
 * Cart Item Customizations
 */
export interface CartItemCustomizations {
  fabric?: string;
  color?: string;
  size?: string;
  occasion?: string;
  measurements?: Record<string, number | string>;
  notes?: string;
  [key: string]: any;
}

/**
 * Cart Item
 */
export interface CartItem {
  /** Unique cart item ID */
  id: string;
  
  /** Product ID */
  productId: string;
  
  /** Full product object */
  product: Product;
  
  /** Quantity */
  quantity: number;
  
  /** Customizations (fabric, color, size, measurements, etc.) */
  customizations?: CartItemCustomizations;
  
  /** Whether this is a custom order */
  isCustom?: boolean;
  
  /** Date added to cart */
  addedAt: string;
  
  /** Stock availability at time of adding */
  stockAvailable?: number;
  
  /** Price at time of adding (for price protection) */
  priceAtAdd?: number;
}

/**
 * Cart State
 */
export interface CartState {
  /** Cart items */
  items: CartItem[];
  
  /** Total number of items */
  totalItems: number;
  
  /** Subtotal (before tax, shipping, discounts) */
  subtotal: number;
  
  /** Tax amount */
  tax: number;
  
  /** Shipping cost */
  shipping: number;
  
  /** Discount amount */
  discount: number;
  
  /** Applied promo code */
  promoCode?: string;
  
  /** Total amount */
  total: number;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error message */
  error: string | null;
  
  /** Last synced timestamp */
  lastSynced?: string;
}

/**
 * Cart Actions
 */
export interface CartActions {
  /** Add item to cart */
  addItem: (
    product: Product,
    quantity?: number,
    customizations?: CartItemCustomizations
  ) => Promise<void>;
  
  /** Remove item from cart */
  removeItem: (itemId: string) => Promise<void>;
  
  /** Update item quantity */
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  
  /** Clear entire cart */
  clearCart: () => Promise<void>;
  
  /** Check if product is in cart */
  isInCart: (productId: string) => boolean;
  
  /** Get cart item by product ID */
  getItem: (productId: string) => CartItem | undefined;
  
  /** Get total quantity for a product */
  getProductQuantity: (productId: string) => number;
  
  /** Apply promo code */
  applyPromoCode: (code: string) => Promise<{ success: boolean; discount: number; message?: string }>;
  
  /** Remove promo code */
  removePromoCode: () => void;
  
  /** Calculate shipping estimate */
  calculateShipping: (address?: ShippingAddress) => Promise<number>;
  
  /** Sync cart with backend */
  syncCart: () => Promise<void>;
  
  /** Load cart from backend */
  loadCart: () => Promise<void>;
  
  /** Validate cart items (check stock, prices) */
  validateCart: () => Promise<{ 
    valid: boolean; 
    errors: Array<{ itemId: string; productId: string; message: string }> 
  }>;

  /** Clear corrupted cart items */
  clearCorruptedCart: () => void;
}

/**
 * Shipping Address
 */
export interface ShippingAddress {
  city: string;
  province: string;
  postalCode?: string;
  country?: string;
}

/**
 * Promo Code Response
 */
export interface PromoCodeResponse {
  success: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  message?: string;
  code?: string;
  minPurchase?: number;
  maxDiscount?: number;
}

/**
 * Cart Sync Response
 */
export interface CartSyncResponse {
  success: boolean;
  items: CartItem[];
  message?: string;
}

/**
 * Cart Validation Result
 */
export interface CartValidationResult {
  valid: boolean;
  errors: Array<{
    itemId: string;
    productId: string;
    message: string;
  }>;
  warnings?: Array<{
    itemId: string;
    productId: string;
    message: string;
  }>;
}

/**
 * Cart Store (Zustand)
 */
export interface CartStore extends CartState, CartActions {}

/**
 * Cart Context Value
 */
export interface CartContextValue extends CartState, CartActions {}

/**
 * Add to Cart Options
 */
export interface AddToCartOptions {
  quantity?: number;
  customizations?: CartItemCustomizations;
  skipValidation?: boolean;
}

/**
 * Update Quantity Options
 */
export interface UpdateQuantityOptions {
  validateStock?: boolean;
  maxQuantity?: number;
}

