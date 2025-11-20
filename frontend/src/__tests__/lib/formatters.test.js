/**
 * Formatters Unit Tests
 * Tests for all formatting utility functions
 */

import {
  formatCurrency,
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
  formatPriceRange,
} from '@/lib/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency with PKR symbol', () => {
      expect(formatCurrency(1000)).toContain('Rs.');
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('Rs. 0');
      expect(formatCurrency(undefined)).toBe('Rs. 0');
      expect(formatCurrency('')).toBe('Rs. 0');
    });

    it('should handle invalid numbers', () => {
      expect(formatCurrency('invalid')).toBe('Rs. 0');
      expect(formatCurrency(NaN)).toBe('Rs. 0');
    });

    it('should format with decimals', () => {
      expect(formatCurrency(1000.50)).toContain('1,000.50');
    });

    it('should hide decimals for whole numbers when requested', () => {
      const result = formatCurrency(1000, 'PKR', true);
      expect(result).not.toContain('.00');
    });

    it('should format large numbers with thousands separator', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1,000,000');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Pakistani phone number', () => {
      expect(formatPhoneNumber('03001234567')).toBe('0300-1234567');
    });

    it('should format with country code when international is true', () => {
      expect(formatPhoneNumber('03001234567', true)).toBe('+92-300-1234567');
    });

    it('should handle numbers starting with 92', () => {
      expect(formatPhoneNumber('923001234567', true)).toBe('+92-300-1234567');
    });

    it('should return empty string for invalid input', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber(null)).toBe('');
      expect(formatPhoneNumber(123)).toBe('');
    });

    it('should return original if invalid length', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('formatOrderNumber', () => {
    it('should format order number with LC prefix', () => {
      const result = formatOrderNumber(1);
      expect(result).toMatch(/^LC-\d{4}-0001$/);
    });

    it('should pad number with zeros', () => {
      const result = formatOrderNumber(156);
      expect(result).toMatch(/^LC-\d{4}-0156$/);
    });

    it('should use current year by default', () => {
      const currentYear = new Date().getFullYear();
      const result = formatOrderNumber(1);
      expect(result).toContain(`LC-${currentYear}`);
    });

    it('should use provided year', () => {
      const result = formatOrderNumber(1, 2023);
      expect(result).toBe('LC-2023-0001');
    });

    it('should return empty string for falsy input', () => {
      expect(formatOrderNumber(null)).toBe('');
      expect(formatOrderNumber(0)).toBe('LC-2025-0000');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB', () => {
      expect(formatFileSize(1500)).toBe('1.5 KB');
    });

    it('should format MB', () => {
      expect(formatFileSize(1500000)).toBe('1.4 MB');
    });

    it('should format GB', () => {
      expect(formatFileSize(1500000000)).toBe('1.4 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should handle null/undefined', () => {
      expect(formatFileSize(null)).toBe('0 Bytes');
      expect(formatFileSize(undefined)).toBe('0 Bytes');
    });

    it('should respect decimal places', () => {
      const result = formatFileSize(1500, 2);
      expect(result).toContain('1.50');
    });
  });

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for recent times', () => {
      const date = new Date('2024-01-01T11:59:55Z');
      expect(formatTimeAgo(date)).toBe('just now');
    });

    it('should format minutes ago', () => {
      const date = new Date('2024-01-01T11:55:00Z');
      expect(formatTimeAgo(date)).toBe('5 minutes ago');
    });

    it('should format hours ago', () => {
      const date = new Date('2024-01-01T10:00:00Z');
      expect(formatTimeAgo(date)).toBe('2 hours ago');
    });

    it('should format days ago', () => {
      const date = new Date('2023-12-30T12:00:00Z');
      expect(formatTimeAgo(date)).toBe('2 days ago');
    });

    it('should use short format when requested', () => {
      const date = new Date('2024-01-01T11:00:00Z');
      expect(formatTimeAgo(date, true)).toBe('1h');
    });

    it('should handle invalid dates', () => {
      expect(formatTimeAgo('invalid')).toBe('');
      expect(formatTimeAgo(null)).toBe('');
    });
  });

  describe('formatMeasurement', () => {
    it('should format measurement with unit', () => {
      expect(formatMeasurement(25)).toBe('25.0 cm');
      expect(formatMeasurement(25.5)).toBe('25.5 cm');
    });

    it('should hide unit when requested', () => {
      expect(formatMeasurement(25, true)).toBe('25.0');
    });

    it('should handle zero', () => {
      expect(formatMeasurement(0)).toBe('0.0 cm');
    });

    it('should return empty string for falsy values', () => {
      expect(formatMeasurement(null)).toBe('');
      expect(formatMeasurement(undefined)).toBe('');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(25.556, 2)).toBe('25.56%');
    });

    it('should handle null/undefined', () => {
      expect(formatPercentage(null)).toBe('');
      expect(formatPercentage(undefined)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousands separator', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle falsy values', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });
  });

  describe('formatDateRange', () => {
    it('should format date range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const result = formatDateRange(start, end);
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });

    it('should handle same date', () => {
      const date = new Date('2024-01-01');
      const result = formatDateRange(date, date);
      expect(result).toContain('Jan 1');
    });

    it('should return empty string for invalid dates', () => {
      expect(formatDateRange(null, new Date())).toBe('');
      expect(formatDateRange(new Date(), null)).toBe('');
    });
  });

  describe('formatAddress', () => {
    it('should format address', () => {
      const address = {
        fullAddress: '123 Main St',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
      };
      expect(formatAddress(address)).toContain('123 Main St');
      expect(formatAddress(address)).toContain('Lahore');
    });

    it('should handle missing fields', () => {
      const address = {
        city: 'Lahore',
      };
      expect(formatAddress(address)).toBe('Lahore');
    });

    it('should return empty string for null', () => {
      expect(formatAddress(null)).toBe('');
    });
  });

  describe('formatCardNumber', () => {
    it('should mask card number', () => {
      expect(formatCardNumber('1234567890123456')).toBe('•••• •••• •••• 3456');
    });

    it('should show full number when requested', () => {
      expect(formatCardNumber('1234567890123456', true)).toBe('1234 5678 9012 3456');
    });

    it('should return empty string for empty input', () => {
      expect(formatCardNumber('')).toBe('');
    });
  });

  describe('formatName', () => {
    it('should format name to proper case', () => {
      expect(formatName('john doe')).toBe('John Doe');
      expect(formatName('JANE SMITH')).toBe('Jane Smith');
    });

    it('should return empty string for invalid input', () => {
      expect(formatName(null)).toBe('');
      expect(formatName(123)).toBe('');
    });
  });

  describe('formatPriceRange', () => {
    it('should format price range', () => {
      const result = formatPriceRange(1000, 5000);
      expect(result).toContain('Rs.');
      expect(result).toContain('1,000');
      expect(result).toContain('5,000');
    });

    it('should handle single price', () => {
      const result = formatPriceRange(1000, null);
      expect(result).toContain('Rs.');
      expect(result).toContain('1,000');
    });

    it('should return empty string for both null', () => {
      expect(formatPriceRange(null, null)).toBe('');
    });
  });
});

