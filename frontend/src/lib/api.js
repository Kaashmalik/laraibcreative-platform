import axios from './axios';

/**
 * API client for LaraibCreative platform
 * All methods return promises and use async/await internally
 */
const api = {
  /**
   * Authentication endpoints
   */
  auth: {
    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{ token: string, user: Object }>}
     */
    async login(email, password) {
      return await axios.post('/v1/auth/login', { email, password });
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<{ token: string, user: Object }>}
     */
    async register(userData) {
      return await axios.post('/v1/auth/register', userData);
    },

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    async logout() {
      return await axios.post('/v1/auth/logout');
    },

    /**
     * Verify authentication token
     * @returns {Promise<{ valid: boolean, user?: Object }>}
     */
    async verifyToken() {
      return await axios.get('/v1/auth/verify-token');
    },

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<{ message: string }>}
     */
    async forgotPassword(email) {
      return await axios.post('/v1/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<{ message: string }>}
     */
    async resetPassword(token, newPassword) {
      return await axios.post('/v1/auth/reset-password', { token, newPassword });
    }
  },

  /**
   * Product endpoints
   */
  products: {
    /**
     * Get products with filters
     * @param {Object} filters - Query filters
     * @param {string} filters.category - Category filter
     * @param {string} filters.fabric - Fabric type filter
     * @param {number} filters.minPrice - Minimum price
     * @param {number} filters.maxPrice - Maximum price
     * @returns {Promise<{ products: Array, total: number }>}
     */
    async getAll(filters = {}) {
      return await axios.get('/v1/products', { params: filters });
    },

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object>}
     */
    async getById(id) {
      return await axios.get(`/v1/products/${id}`);
    },

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async search(query) {
      return await axios.get('/v1/products/search', { params: { q: query } });
    },

    /**
     * Get featured products
     * @returns {Promise<Array>}
     */
    async getFeatured() {
      return await axios.get('/v1/products/featured');
    },

    /**
     * Create new product (admin only)
     * @param {Object} productData - Product data
     * @returns {Promise<Object>}
     */
    async create(productData) {
      return await axios.post('/v1/products', productData);
    },

    /**
     * Update product (admin only)
     * @param {string} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>}
     */
    async update(id, productData) {
      return await axios.put(`/v1/products/${id}`, productData);
    },

    /**
     * Delete product (admin only)
     * @param {string} id - Product ID
     * @returns {Promise<void>}
     */
    async delete(id) {
      return await axios.delete(`/v1/products/${id}`);
    }
  },

  /**
   * Order endpoints
   */
  orders: {
    /**
     * Create new order
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>}
     */
    async create(orderData) {
      return await axios.post('/v1/orders', orderData);
    },

    /**
     * Get orders with filters
     * @param {Object} filters - Query filters
     * @returns {Promise<{ orders: Array, total: number }>}
     */
    async getAll(filters = {}) {
      return await axios.get('/v1/orders', { params: filters });
    },

    /**
     * Get order by ID
     * @param {string} id - Order ID
     * @returns {Promise<Object>}
     */
    async getById(id) {
      return await axios.get(`/v1/orders/${id}`);
    },

    /**
     * Update order status (admin only)
     * @param {string} id - Order ID
     * @param {string} status - New status
     * @param {string} note - Status update note
     * @returns {Promise<Object>}
     */
    async updateStatus(id, status, note) {
      return await axios.put(`/v1/orders/${id}/status`, { status, note });
    },

    /**
     * Track order by number
     * @param {string} orderNumber - Order tracking number
     * @returns {Promise<Object>}
     */
    async track(orderNumber) {
      return await axios.get(`/v1/orders/track/${orderNumber}`);
    },

    /**
     * Cancel order
     * @param {string} id - Order ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>}
     */
    async cancel(id, reason) {
      return await axios.post(`/v1/orders/${id}/cancel`, { reason });
    }
  },

  /**
   * Customer endpoints
   */
  customers: {
    /**
     * Get customer profile
     * @returns {Promise<Object>}
     */
    async getProfile() {
      return await axios.get('/v1/customers/profile');
    },

    /**
     * Update customer profile
     * @param {Object} data - Profile data
     * @returns {Promise<Object>}
     */
    async updateProfile(data) {
      return await axios.put('/v1/customers/profile', data);
    },

    /**
     * Get customer orders
     * @returns {Promise<Array>}
     */
    async getOrders() {
      return await axios.get('/v1/customers/orders');
    }
  },

  /**
   * Measurement endpoints
   */
  measurements: {
    /**
     * Get all measurements
     * @returns {Promise<Array>}
     */
    async getAll() {
      return await axios.get('/v1/measurements');
    },

    /**
     * Save new measurement
     * @param {Object} data - Measurement data
     * @returns {Promise<Object>}
     */
    async save(data) {
      return await axios.post('/v1/measurements', data);
    },

    /**
     * Update measurement
     * @param {string} id - Measurement ID
     * @param {Object} data - Updated measurement data
     * @returns {Promise<Object>}
     */
    async update(id, data) {
      return await axios.put(`/v1/measurements/${id}`, data);
    },

    /**
     * Delete measurement
     * @param {string} id - Measurement ID
     * @returns {Promise<void>}
     */
    async delete(id) {
      return await axios.delete(`/v1/measurements/${id}`);
    }
  },

  /**
   * Category endpoints
   */
  categories: {
    /**
     * Get all categories
     * @returns {Promise<Array>}
     */
    async getAll() {
      return await axios.get('/v1/categories');
    }
  },

  /**
   * Review endpoints
   */
  reviews: {
    /**
     * Get reviews by product
     * @param {string} productId - Product ID
     * @returns {Promise<Array>}
     */
    async getByProduct(productId) {
      return await axios.get(`/v1/reviews/product/${productId}`);
    },

    /**
     * Create new review
     * @param {Object} reviewData - Review data
     * @returns {Promise<Object>}
     */
    async create(reviewData) {
      return await axios.post('/v1/reviews', reviewData);
    }
  },

  /**
   * Blog endpoints
   */
  blog: {
    /**
     * Get blog posts with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<{ posts: Array, total: number }>}
     */
    async getAll(page = 1, limit = 10) {
      return await axios.get('/v1/blog', { params: { page, limit } });
    },

    /**
     * Get blog post by slug
     * @param {string} slug - Blog post slug
     * @returns {Promise<Object>}
     */
    async getBySlug(slug) {
      return await axios.get(`/v1/blog/${slug}`);
    },

    /**
     * Increment blog post view count
     * @param {string} slug - Blog post slug
     * @returns {Promise<void>}
     */
    async incrementView(slug) {
      return await axios.post(`/v1/blog/${slug}/view`);
    }
  },

  /**
   * Upload endpoints
   */
  upload: {
    /**
     * Upload single image
     * @param {File} file - Image file
     * @returns {Promise<{ url: string }>}
     */
    async image(file) {
      const formData = new FormData();
      formData.append('image', file);
      return await axios.post('/v1/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    /**
     * Upload multiple images
     * @param {Array<File>} files - Image files
     * @returns {Promise<{ urls: Array<string> }>}
     */
    async images(files) {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      return await axios.post('/v1/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    /**
     * Upload payment receipt
     * @param {File} file - Receipt file
     * @returns {Promise<{ url: string }>}
     */
    async receipt(file) {
      const formData = new FormData();
      formData.append('receipt', file);
      return await axios.post('/v1/upload/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  }
};

export default api;
