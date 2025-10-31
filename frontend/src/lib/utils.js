import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and handle conflicts
 * @param {...(string|string[]|Object)} classes - CSS classes to merge
 * @returns {string} - Merged CSS classes with conflicts resolved
 * @example
 * cn('text-red-500', isActive && 'font-bold', className)
 * cn('px-4 py-2', 'px-6') // Returns 'py-2 px-6' (last px wins)
 */
export function cn(...classes) {
  return twMerge(clsx(...classes));
}

/**
 * Format currency with PKR symbol and thousands separator
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: 'PKR')
 * @param {boolean} hideDecimals - Hide decimals for whole numbers
 * @returns {string} - Formatted currency string
 * @example
 * formatCurrency(5000) // 'Rs. 5,000'
 * formatCurrency(5000.50) // 'Rs. 5,000.50'
 * formatCurrency(5000, 'PKR', true) // 'Rs. 5,000'
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
 * @param {Date|string|number} date - Date to format
 * @param {string} formatType - Format type: 'short', 'medium', 'long', 'full', or custom format
 * @returns {string} - Formatted date string
 * @example
 * formatDate(new Date()) // 'Oct 31, 2024'
 * formatDate(new Date(), 'long') // 'October 31, 2024'
 * formatDate(new Date(), 'dd/MM/yyyy') // '31/10/2024'
 */
export function formatDate(date, formatType = 'medium') {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
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

    // Custom format handling (basic implementation)
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
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - String to append after truncation
 * @returns {string} - Truncated text
 * @example
 * truncateText('Long text here', 8) // 'Long tex...'
 * truncateText('Short', 10) // 'Short'
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  // Truncate at word boundary if possible
  const truncated = text.slice(0, maxLength).trim();
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.slice(0, lastSpaceIndex) + suffix;
  }
  
  return truncated + suffix;
}

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 * @example
 * generateSlug('Custom Stitching Service') // 'custom-stitching-service'
 * generateSlug('Bridal Wear - 2024!') // 'bridal-wear-2024'
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')           // Replace spaces and underscores with hyphens
    .replace(/[^\w\-]+/g, '')          // Remove non-word chars except hyphens
    .replace(/\-\-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');          // Remove leading/trailing hyphens
}

/**
 * Create a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function with cancel method
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching:', query);
 * }, 300);
 * debouncedSearch('test'); // Only executes after 300ms of no calls
 * debouncedSearch.cancel(); // Cancel pending execution
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
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll event');
 * }, 1000);
 * // Executes immediately, then at most once per second
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
 * @param {*} obj - Object to clone
 * @returns {*} - Cloned object
 * @example
 * const cloned = deepClone({ a: 1, b: { c: 2 } });
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
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty
 * @example
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty(0) // false
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
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 * @example
 * capitalize('hello world') // 'Hello World'
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
 * @param {number} length - Length of ID
 * @returns {string} - Random ID
 * @example
 * generateId() // 'a1b2c3d4'
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}