// frontend/src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and handle conflicts
 */
export function cn(...classes) {
  return twMerge(clsx(...classes));
}

/**
 * Format currency with PKR symbol and thousands separator
 */
export function formatCurrency(amount, currency = 'PKR', hideDecimals = false) {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rs. 0';
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return 'Rs. 0';
  }

  const formatted = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: hideDecimals && Number.isInteger(numAmount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numAmount);

  return formatted.replace('PKR', 'Rs.').trim();
}

/**
 * Format date with multiple format options
 */
export function formatDate(date, formatType = 'medium') {
  if (!date) return '';

  try {
    const dateObj =
      typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const formats = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };

    if (formats[formatType]) {
      return new Intl.DateTimeFormat('en-PK', formats[formatType]).format(dateObj);
    }

    // Custom format (basic)
    if (formatType.includes('dd') || formatType.includes('MM') || formatType.includes('yyyy')) {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();

      return formatType
        .replace('dd', day)
        .replace('MM', month)
        .replace('yyyy', year);
    }

    return dateObj.toLocaleDateString('en-PK');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Truncate text with ellipsis if it exceeds maxLength
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength).trim();
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.slice(0, lastSpaceIndex) + suffix;
  }

  return truncated + suffix;
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word chars except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create a debounced version of a function
 */
export function debounce(func, delay = 300) {
  let timeoutId;

  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  debounced.cancel = function () {
    clearTimeout(timeoutId);
  };

  return debounced;
}

/**
 * Create a throttled version of a function
 */
export function throttle(func, delay = 1000) {
  let lastCall = 0;
  let timeoutId = null;

  return function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      func.apply(this, args);
      lastCall = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastCall = Date.now();
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Deep clone an object or array
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Check if value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generate SKU (Stock Keeping Unit)
 * Example: CLO-LLYZH7S9-8K3
 */
export function generateSKU(category = '') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const prefix = (category.substring(0, 3) || 'PRD').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
