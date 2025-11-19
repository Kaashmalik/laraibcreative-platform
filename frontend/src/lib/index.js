/**
 * LaraibCreative Utilities Library
 * Central export point for all utility functions, constants, and helpers
 * 
 * @module lib
 * @version 1.0.0
 * @description Production-ready utility library for LaraibCreative e-commerce platform
 */

// Core utility functions
export {
  cn,
  formatCurrency,
  formatDate,
  truncateText,
  generateSlug,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  capitalize,
  generateId
} from './utils';

// Application constants
export {
  API_BASE_URL,
  SITE_URL,
  CLOUDINARY_CLOUD_NAME,
  IMAGE_QUALITY,
  IMAGE_SIZES,
  MEASUREMENT_FIELDS,
  ORDER_STATUSES,
  ORDER_STATUS_SEQUENCE,
  PAYMENT_METHODS,
  CITIES_PAKISTAN,
  ALL_CITIES,
  FABRIC_TYPES,
  OCCASIONS,
  PRODUCT_CATEGORIES,
  SORT_OPTIONS,
  PAGINATION,
  CONTACT_INFO,
  SOCIAL_LINKS,
  FILE_UPLOAD,
  SEO_DEFAULTS,
  ROUTES
} from './constants';

// Data formatters
export {
  formatPhoneNumber,
  formatOrderNumber,
  formatFileSize,
  formatTimeAgo,
  formatMeasurement,
  formatPercentage,
  formatNumber,
  formatDateRange,
  formatAddress,
  formatCardNumber,
  formatName,
  formatPriceRange
} from './formatters';

// Validation schemas
export {
  loginSchema,
  registerSchema,
  addressSchema,
  measurementSchema,
  productSchema,
  orderSchema,
  contactFormSchema,
  customOrderSchema,
  reviewSchema,
  resetPasswordSchema,
  newsletterSchema,
  profileSchema
} from './validations';

// Storage utilities (as namespace)
export * as storage from './storage';

// Also export storage as default export for convenience
import storageUtils from './storage';
export { storageUtils };

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Library metadata
 */
export const LIBRARY_INFO = {
  name: 'LaraibCreative Utils',
  version: VERSION,
  description: 'Utility library for LaraibCreative e-commerce platform',
  author: 'LaraibCreative Team'
};

/**
 * Utility function to check if running in browser
 * @returns {boolean}
 */
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Utility function to check if running in development
 * @returns {boolean}
 */
export const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * Utility function to check if running in production
 * @returns {boolean}
 */
export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Initialize library (cleanup expired storage items, etc.)
 * Call this once when your app starts
 */
export const initializeLib = () => {
  if (isBrowser()) {
    try {
      // Cleanup expired storage items
      storageUtils.cleanupExpiredItems();
      
      // Log storage usage in development
      if (isDevelopment()) {
        const usage = storageUtils.getStorageUsage();
        const size = storageUtils.getStorageSize();
        console.log(`📦 Storage: ${size} (${usage}% full)`);
      }
    } catch (error) {
      console.error('Error initializing library:', error);
    }
  }
};