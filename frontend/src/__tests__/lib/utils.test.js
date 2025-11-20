/**
 * Utils Unit Tests
 * Tests for utility helper functions
 */

import {
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
  generateId,
  generateSKU,
} from '@/lib/utils';

describe('Utils', () => {
  describe('cn (classNames)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle Tailwind conflicts', () => {
      // twMerge should handle this
      const result = cn('p-2', 'p-4');
      expect(result).toBeTruthy();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency', () => {
      expect(formatCurrency(1000)).toContain('Rs.');
    });

    it('should handle null/undefined', () => {
      expect(formatCurrency(null)).toBe('Rs. 0');
      expect(formatCurrency(undefined)).toBe('Rs. 0');
    });
  });

  describe('formatDate', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-01-01');
      const result = formatDate(date, 'short');
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });

    it('should format date in medium format', () => {
      const date = new Date('2024-01-01');
      const result = formatDate(date, 'medium');
      expect(result).toBeTruthy();
    });

    it('should handle custom format', () => {
      const date = new Date('2024-01-01');
      const result = formatDate(date, 'dd/MM/yyyy');
      expect(result).toContain('2024');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'a'.repeat(200);
      const result = truncateText(longText, 100);
      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(result).toContain('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 100)).toBe(shortText);
    });

    it('should truncate at word boundary when possible', () => {
      const text = 'This is a long text that should be truncated';
      const result = truncateText(text, 20);
      expect(result).toContain('...');
    });

    it('should return empty string for invalid input', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(123)).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello & World!')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });

    it('should return empty string for invalid input', () => {
      expect(generateSlug(null)).toBe('');
      expect(generateSlug('')).toBe('');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const func = jest.fn();
      const debounced = debounce(func, 300);

      debounced();
      debounced();
      debounced();

      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should cancel debounced function', () => {
      const func = jest.fn();
      const debounced = debounce(func, 300);

      debounced();
      debounced.cancel();

      jest.advanceTimersByTime(300);

      expect(func).not.toHaveBeenCalled();
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const func = jest.fn();
      const throttled = throttle(func, 1000);

      throttled();
      throttled();
      throttled();

      jest.advanceTimersByTime(500);
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(600);
      expect(func).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('deepClone', () => {
    it('should deep clone object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should deep clone array', () => {
      const original = [1, [2, 3]];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
    });

    it('should clone dates', () => {
      const date = new Date();
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('should return primitives as-is', () => {
      expect(deepClone(5)).toBe(5);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(null)).toBe(null);
    });
  });

  describe('isEmpty', () => {
    it('should return true for null/undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalize('hello world')).toBe('Hello World');
    });

    it('should return empty string for invalid input', () => {
      expect(capitalize(null)).toBe('');
      expect(capitalize(123)).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate random ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should respect length parameter', () => {
      const id = generateId(10);
      expect(id.length).toBe(10);
    });
  });

  describe('generateSKU', () => {
    it('should generate SKU with category prefix', () => {
      const sku = generateSKU('Clothing');
      expect(sku).toContain('CLO');
    });

    it('should generate unique SKUs', () => {
      const sku1 = generateSKU('Test');
      const sku2 = generateSKU('Test');

      expect(sku1).not.toBe(sku2);
    });

    it('should use default prefix if category is empty', () => {
      const sku = generateSKU('');
      expect(sku).toContain('PRD');
    });
  });
});

