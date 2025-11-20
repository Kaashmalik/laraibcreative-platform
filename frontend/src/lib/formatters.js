/**
 * Data formatting utilities for LaraibCreative
 * Production-ready with comprehensive error handling
 */

/**
 * Format currency with PKR symbol and thousands separator
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: PKR)
 * @param {boolean} hideDecimals - Hide decimal places for whole numbers
 * @returns {string} - Formatted currency string
 * @example
 * formatCurrency(1000) // 'Rs. 1,000'
 * formatCurrency(1000.50) // 'Rs. 1,000.50'
 * formatCurrency(1000, 'PKR', true) // 'Rs. 1,000'
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

  // Replace PKR with Rs. for better readability
  return formatted.replace('PKR', 'Rs.').trim();
}

/**
 * Format phone number to standard Pakistani format
 * @param {string} phone - Phone number to format
 * @param {boolean} international - Include country code prefix
 * @returns {string} - Formatted phone number
 * @example
 * formatPhoneNumber('03001234567') // '0300-1234567'
 * formatPhoneNumber('03001234567', true) // '+92-300-1234567'
 * formatPhoneNumber('923001234567') // '+92-300-1234567'
 */
export function formatPhoneNumber(phone, international = false) {
  if (!phone || typeof phone !== 'string') return '';

  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle different input formats
  if (cleaned.startsWith('92')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Ensure we have exactly 10 digits
  if (cleaned.length !== 10) {
    return phone; // Return original if invalid
  }

  // Format based on preference
  if (international) {
    return `+92-${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  
  return `0${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
}

/**
 * Format order number with LC prefix and year
 * @param {number|string} number - Order number
 * @param {number} year - Year (optional, defaults to current year)
 * @returns {string} - Formatted order number
 * @example
 * formatOrderNumber(1) // 'LC-2025-0001'
 * formatOrderNumber(156) // 'LC-2025-0156'
 */
export function formatOrderNumber(number, year) {
  if (!number) return '';

  const orderYear = year || new Date().getFullYear();
  const paddedNumber = String(number).padStart(4, '0');
  return `LC-${orderYear}-${paddedNumber}`;
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 * @example
 * formatFileSize(1500) // '1.5 KB'
 * formatFileSize(1500000) // '1.43 MB'
 * formatFileSize(1500000000) // '1.4 GB'
 */
export function formatFileSize(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = (bytes / Math.pow(k, i)).toFixed(decimals);

  // Remove .0 if present and decimals is 1
  const formattedSize = decimals === 1 && size.endsWith('.0') 
    ? size.slice(0, -2) 
    : size;
    
  return `${formattedSize} ${sizes[i]}`;
}

/**
 * Format relative time from date
 * @param {Date|string|number} date - Date to format
 * @param {boolean} short - Use short format
 * @returns {string} - Relative time string
 * @example
 * formatTimeAgo(new Date(Date.now() - 5000)) // 'just now'
 * formatTimeAgo(new Date(Date.now() - 3600000)) // '1 hour ago'
 * formatTimeAgo(new Date(Date.now() - 3600000), true) // '1h'
 */
export function formatTimeAgo(date, short = false) {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const seconds = Math.floor((new Date() - dateObj) / 1000);
    
    if (seconds < 10) {
      return 'just now';
    }

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        if (short) {
          const shortUnits = {
            year: 'y',
            month: 'mo',
            week: 'w',
            day: 'd',
            hour: 'h',
            minute: 'm'
          };
          return `${interval}${shortUnits[unit]}`;
        }
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return '';
  }
}

/**
 * Format measurement value to display in centimeters
 * @param {number|string} value - Measurement value
 * @param {boolean} hideUnit - Hide 'cm' unit
 * @returns {string} - Formatted measurement
 * @example
 * formatMeasurement(25) // '25.0 cm'
 * formatMeasurement(25.5) // '25.5 cm'
 * formatMeasurement(25, true) // '25.0'
 */
export function formatMeasurement(value, hideUnit = false) {
  if (!value && value !== 0) return '';
  
  const formatted = Number(value).toFixed(1);
  return hideUnit ? formatted : `${formatted} cm`;
}

/**
 * Format percentage value
 * @param {number|string} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 * @example
 * formatPercentage(25.5) // '25.5%'
 * formatPercentage(25.556, 2) // '25.56%'
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 * @param {number|string} value - Number to format
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted number
 * @example
 * formatNumber(1000) // '1,000'
 * formatNumber(1000000) // '10,00,000'
 */
export function formatNumber(value, locale = 'en-PK') {
  if (!value && value !== 0) return '0';
  
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value);
  }
}

/**
 * Format date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} - Formatted date range
 * @example
 * formatDateRange(new Date('2024-01-01'), new Date('2024-01-31')) 
 * // 'Jan 1 - Jan 31, 2024'
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';

  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth && start.getDate() === end.getDate()) {
      return new Intl.DateTimeFormat('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(start);
    }

    const startFormat = {
      month: 'short',
      day: 'numeric',
      ...(sameYear ? {} : { year: 'numeric' })
    };

    const endFormat = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };

    const startStr = new Intl.DateTimeFormat('en-PK', startFormat).format(start);
    const endStr = new Intl.DateTimeFormat('en-PK', endFormat).format(end);

    return `${startStr} - ${endStr}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '';
  }
}

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} - Formatted address
 * @example
 * formatAddress({
 *   fullAddress: '123 Main St',
 *   city: 'Lahore',
 *   province: 'Punjab',
 *   postalCode: '54000'
 * }) // '123 Main St, Lahore, Punjab 54000'
 */
export function formatAddress(address) {
  if (!address) return '';

  const parts = [
    address.fullAddress,
    address.city,
    address.province,
    address.postalCode
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Format card number with masking
 * @param {string} cardNumber - Card number
 * @param {boolean} full - Show full number
 * @returns {string} - Formatted card number
 * @example
 * formatCardNumber('1234567890123456') // '•••• •••• •••• 3456'
 * formatCardNumber('1234567890123456', true) // '1234 5678 9012 3456'
 */
export function formatCardNumber(cardNumber, full = false) {
  if (!cardNumber) return '';

  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (full) {
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  }

  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
}

/**
 * Format name to proper case
 * @param {string} name - Name to format
 * @returns {string} - Formatted name
 * @example
 * formatName('john doe') // 'John Doe'
 * formatName('JANE SMITH') // 'Jane Smith'
 */
export function formatName(name) {
  if (!name || typeof name !== 'string') return '';

  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price range
 * @example
 * formatPriceRange(1000, 5000) // 'Rs. 1,000 - Rs. 5,000'
 */
export function formatPriceRange(minPrice, maxPrice, currency = 'PKR') {
  if (!minPrice && !maxPrice) return '';
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0
    }).format(price).replace('PKR', 'Rs.').trim();
  };

  if (minPrice && maxPrice) {
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }
  
  return formatPrice(minPrice || maxPrice);
}
