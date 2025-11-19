/**
 * Safe localStorage wrapper with error handling and quota management
 * Falls back gracefully when localStorage is not available or quota is exceeded
 * Production-ready with comprehensive error handling and TypeScript-like JSDoc
 */

/**
 * Check if localStorage is available and accessible
 * @returns {boolean} - Whether localStorage is available
 */
const isLocalStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get item from localStorage with JSON parsing
 * @template T
 * @param {string} key - Storage key
 * @param {T} [defaultValue=null] - Default value if key doesn't exist or on error
 * @returns {T} - Parsed value or default value
 * @example
 * const user = getItem('user', null);
 * const cart = getItem('cart', []);
 * const settings = getItem('settings', { theme: 'light' });
 */
export function getItem(key, defaultValue = null) {
  if (!key || typeof key !== 'string') {
    console.warn('Storage key must be a non-empty string');
    return defaultValue;
  }

  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }

    // Try to parse JSON, fallback to raw string if parsing fails
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {Object} [options] - Options
 * @param {number} [options.ttl] - Time to live in milliseconds
 * @returns {boolean} - Whether operation was successful
 * @example
 * setItem('user', { id: 1, name: 'John' });
 * setItem('session', data, { ttl: 3600000 }); // 1 hour TTL
 */
export function setItem(key, value, options = {}) {
  if (!key || typeof key !== 'string') {
    console.warn('Storage key must be a non-empty string');
    return false;
  }

  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    let dataToStore = value;

    // Add TTL if specified
    if (options.ttl && typeof options.ttl === 'number') {
      dataToStore = {
        value,
        expiry: Date.now() + options.ttl
      };
    }

    const serializedValue = JSON.stringify(dataToStore);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    
    // Handle quota exceeded error specifically
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('localStorage quota exceeded. Attempting to clear space...');
      
      try {
        // Remove expired items first
        cleanupExpiredItems();
        
        // Try to remove less important items
        const itemsToRemove = ['searchHistory', 'recentlyViewed', 'tempData'];
        for (const item of itemsToRemove) {
          removeItem(item);
        }
        
        // Try setting again
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        console.info('Successfully cleared space and saved data');
        return true;
      } catch (retryError) {
        console.error('Still unable to write to localStorage after cleanup:', retryError);
        return false;
      }
    }
    
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key to remove
 * @returns {boolean} - Whether operation was successful
 * @example
 * removeItem('temporaryData');
 */
export function removeItem(key) {
  if (!key || typeof key !== 'string') {
    console.warn('Storage key must be a non-empty string');
    return false;
  }

  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * @param {string[]} [except=[]] - Keys to preserve
 * @returns {boolean} - Whether operation was successful
 * @example
 * clear(); // Clear all
 * clear(['authToken', 'userId']); // Clear all except specified keys
 */
export function clear(except = []) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    if (except.length > 0) {
      // Preserve specified keys
      const preserved = {};
      except.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          preserved[key] = value;
        }
      });

      localStorage.clear();

      // Restore preserved items
      Object.entries(preserved).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } else {
      localStorage.clear();
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get the total size of data stored in localStorage
 * @returns {string} - Formatted size string
 * @example
 * const size = getStorageSize(); // "1.5 MB"
 */
export function getStorageSize() {
  if (!isLocalStorageAvailable()) {
    return '0 B';
  }

  try {
    let totalSize = 0;
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        totalSize += new Blob([key, value]).size;
      }
    }
    
    // Convert to appropriate unit
    if (totalSize < 1024) {
      return `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  } catch (error) {
    console.error('Error calculating localStorage size:', error);
    return '0 B';
  }
}

/**
 * Get all keys from localStorage
 * @param {string} [prefix] - Filter keys by prefix
 * @returns {string[]} - Array of keys
 * @example
 * const allKeys = getAllKeys();
 * const userKeys = getAllKeys('user_');
 */
export function getAllKeys(prefix = '') {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const keys = Object.keys(localStorage);
    
    if (prefix) {
      return keys.filter(key => key.startsWith(prefix));
    }
    
    return keys;
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
}

/**
 * Check if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Whether key exists
 * @example
 * if (hasItem('authToken')) {
 *   // Token exists
 * }
 */
export function hasItem(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Get item with TTL check - returns null if expired
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Default value if expired or not found
 * @returns {*} - Value or null if expired
 * @example
 * const session = getItemWithTTL('session');
 */
export function getItemWithTTL(key, defaultValue = null) {
  const data = getItem(key, null);
  
  if (!data || typeof data !== 'object' || !data.expiry) {
    return data || defaultValue;
  }

  // Check if expired
  if (Date.now() > data.expiry) {
    removeItem(key);
    return defaultValue;
  }

  return data.value;
}

/**
 * Remove expired items from localStorage
 * @returns {number} - Number of items removed
 * @example
 * const removed = cleanupExpiredItems();
 * console.log(`Removed ${removed} expired items`);
 */
export function cleanupExpiredItems() {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  let removedCount = 0;

  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);
        
        if (parsed && typeof parsed === 'object' && parsed.expiry) {
          if (Date.now() > parsed.expiry) {
            localStorage.removeItem(key);
            removedCount++;
          }
        }
      } catch {
        // Skip non-JSON or invalid items
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }

  return removedCount;
}

/**
 * Get storage usage percentage
 * @returns {number} - Usage percentage (0-100)
 * @example
 * const usage = getStorageUsage();
 * console.log(`Storage ${usage}% full`);
 */
export function getStorageUsage() {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  try {
    let totalSize = 0;
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += new Blob([key, localStorage[key]]).size;
      }
    }
    
    // localStorage typically has 5-10MB limit, using 5MB as conservative estimate
    const storageLimit = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (totalSize / storageLimit) * 100;
    
    return Math.min(Math.round(percentage * 100) / 100, 100);
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
}

// Export default object with all functions
const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getStorageSize,
  getAllKeys,
  hasItem,
  getItemWithTTL,
  cleanupExpiredItems,
  getStorageUsage
};

export default storage;