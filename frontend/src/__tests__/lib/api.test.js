/**
 * API Utility Tests
 * Tests for API client functions
 */

import api from '@/lib/api';
import axios from '@/lib/axios';

// Mock axios
jest.mock('@/lib/axios');

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth endpoints', () => {
    it('should call login endpoint', async () => {
      const mockResponse = { data: { token: 'test-token', user: {} } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await api.auth.login('test@example.com', 'password');

      expect(axios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call register endpoint', async () => {
      const mockResponse = { data: { token: 'test-token', user: {} } };
      const userData = { email: 'test@example.com', password: 'password' };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await api.auth.register(userData);

      expect(axios.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call logout endpoint', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await api.auth.logout();

      expect(axios.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('products endpoints', () => {
    it('should call getAll with params', async () => {
      const mockResponse = { data: { products: [] } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const params = { page: 1, limit: 10 };
      const result = await api.products.getAll(params);

      expect(axios.get).toHaveBeenCalledWith('/products', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should call getById', async () => {
      const mockResponse = { data: { product: {} } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await api.products.getById('product-id');

      expect(axios.get).toHaveBeenCalledWith('/products/product-id');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cart endpoints', () => {
    it('should call cart sync', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const cartData = { items: [] };
      const result = await api.cart.sync(cartData);

      expect(axios.post).toHaveBeenCalledWith('/cart/sync', cartData);
      expect(result).toEqual(mockResponse);
    });

    it('should call applyPromoCode', async () => {
      const mockResponse = { data: { success: true, discount: 10 } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await api.cart.applyPromoCode('TEST10', []);

      expect(axios.post).toHaveBeenCalledWith('/cart/promo-code', {
        code: 'TEST10',
        items: [],
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      axios.post.mockRejectedValueOnce(networkError);

      await expect(api.auth.login('test@example.com', 'password')).rejects.toThrow(
        'Network Error'
      );
    });

    it('should handle API errors', async () => {
      const apiError = {
        response: {
          status: 400,
          data: { message: 'Invalid credentials' },
        },
      };
      axios.post.mockRejectedValueOnce(apiError);

      await expect(api.auth.login('test@example.com', 'wrong')).rejects.toEqual(apiError);
    });
  });
});

