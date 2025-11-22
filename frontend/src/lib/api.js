import axios from './axios';

/**
 * API Client for LaraibCreative Platform
 * Enhanced with Ad Posting and SEO-focused features
 */
const api = {
  // ... [Previous auth, products, orders, customers, measurements endpoints remain the same]
  
  /**
   * Authentication endpoints
   */
  auth: {
    async login(email, password) {
      return await axios.post('/auth/login', { email, password });
    },
    async register(userData) {
      return await axios.post('/auth/register', userData);
    },
    async logout() {
      return await axios.post('/auth/logout');
    },
    async verifyToken() {
      return await axios.get('/auth/me');
    },
    async refreshToken() {
      return await axios.post('/auth/refresh-token');
    },
    async forgotPassword(email) {
      return await axios.post('/auth/forgot-password', { email });
    },
    async resetPassword(token, password) {
      return await axios.post('/auth/reset-password', { token, password });
    },
    async changePassword(currentPassword, newPassword) {
      return await axios.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
    },
    async verifyEmail(token) {
      return await axios.get(`/auth/verify-email/${token}`);
    },
    async resendVerification() {
      return await axios.post('/auth/resend-verification');
    }
  },

  /**
   * Ad/Listing Management Endpoints (NEW)
   * For marketplace-style ad posting functionality
   */
  ads: {
    /**
     * Get all ads with filters
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @param {string} params.category - Category filter
     * @param {string} params.status - Ad status (active, pending, expired, sold)
     * @param {string} params.location - Location filter
     * @param {number} params.minPrice - Minimum price
     * @param {number} params.maxPrice - Maximum price
     * @param {string} params.sort - Sort order
     * @returns {Promise<{ ads: Array, total: number, page: number }>}
     */
    async getAll(params = {}) {
      return await axios.get('/ads', { params });
    },

    /**
     * Get ad by ID
     * @param {string} id - Ad ID
     * @returns {Promise<Object>}
     */
    async getById(id) {
      return await axios.get(`/ads/${id}`);
    },

    /**
     * Get ad by slug (SEO-friendly URL)
     * @param {string} slug - Ad slug
     * @returns {Promise<Object>}
     */
    async getBySlug(slug) {
      return await axios.get(`/ads/slug/${slug}`);
    },

    /**
     * Create new ad/listing
     * @param {Object} adData - Ad data
     * @param {string} adData.title - Ad title
     * @param {string} adData.description - Ad description
     * @param {string} adData.category - Category
     * @param {number} adData.price - Price
     * @param {Array} adData.images - Image URLs
     * @param {string} adData.location - Location
     * @param {Object} adData.contactInfo - Contact information
     * @param {Object} adData.seoData - SEO metadata (optional)
     * @returns {Promise<Object>}
     */
    async create(adData) {
      return await axios.post('/ads', adData);
    },

    /**
     * Update existing ad
     * @param {string} id - Ad ID
     * @param {Object} adData - Updated ad data
     * @returns {Promise<Object>}
     */
    async update(id, adData) {
      return await axios.put(`/ads/${id}`, adData);
    },

    /**
     * Delete ad
     * @param {string} id - Ad ID
     * @returns {Promise<{ message: string }>}
     */
    async delete(id) {
      return await axios.delete(`/ads/${id}`);
    },

    /**
     * Mark ad as sold
     * @param {string} id - Ad ID
     * @returns {Promise<Object>}
     */
    async markAsSold(id) {
      return await axios.post(`/ads/${id}/sold`);
    },

    /**
     * Boost ad (featured listing)
     * @param {string} id - Ad ID
     * @param {number} duration - Boost duration in days
     * @returns {Promise<Object>}
     */
    async boost(id, duration = 7) {
      return await axios.post(`/ads/${id}/boost`, { duration });
    },

    /**
     * Get user's ads
     * @param {Object} params - Query parameters
     * @returns {Promise<{ ads: Array, total: number }>}
     */
    async getMyAds(params = {}) {
      return await axios.get('/ads/my-ads', { params });
    },

    /**
     * Get featured ads
     * @param {number} limit - Number of ads to return
     * @returns {Promise<Array>}
     */
    async getFeatured(limit = 8) {
      return await axios.get('/ads/featured', { params: { limit } });
    },

    /**
     * Search ads
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise<{ ads: Array, total: number }>}
     */
    async search(query, filters = {}) {
      return await axios.get('/ads/search', { 
        params: { q: query, ...filters } 
      });
    },

    /**
     * Report ad
     * @param {string} id - Ad ID
     * @param {string} reason - Report reason
     * @returns {Promise<{ message: string }>}
     */
    async report(id, reason) {
      return await axios.post(`/ads/${id}/report`, { reason });
    },

    /**
     * Increment ad view count
     * @param {string} id - Ad ID
     * @returns {Promise<{ views: number }>}
     */
    async incrementView(id) {
      return await axios.post(`/ads/${id}/view`);
    },

    /**
     * Get ad statistics (for owner)
     * @param {string} id - Ad ID
     * @returns {Promise<Object>}
     */
    async getStats(id) {
      return await axios.get(`/ads/${id}/stats`);
    }
  },

  /**
   * Products (existing endpoints)
   */
  products: {
    async getAll(params = {}) {
      return await axios.get('/products', { params });
    },
    async getById(id) {
      return await axios.get(`/products/${id}`);
    },
    async getBySlug(slug) {
      return await axios.get(`/products/slug/${slug}`);
    },
    async search(query, filters = {}) {
      return await axios.get('/products/search', { 
        params: { q: query, ...filters } 
      });
    },
    async getFeatured(limit = 8) {
      return await axios.get('/products/featured', { params: { limit } });
    },
    async getNewArrivals(limit = 8) {
      return await axios.get('/products/new-arrivals', { params: { limit } });
    },
    async getBestSellers(limit = 8) {
      return await axios.get('/products/best-sellers', { params: { limit } });
    },
    async getRelated(id, params = {}) {
      const { limit = 4, type, category } = params;
      return await axios.get(`/products/${id}/related`, { 
        params: { limit, type, category } 
      });
    },
    async create(productData) {
      return await axios.post('/products', productData);
    },
    async update(id, productData) {
      return await axios.put(`/products/${id}`, productData);
    },
    async delete(id) {
      return await axios.delete(`/products/${id}`);
    },
    async updateStock(id, stock) {
      return await axios.patch(`/products/${id}/stock`, { stock });
    },
    async bulkUpdate(updates) {
      return await axios.post('/products/bulk-update', { updates });
    },

    /**
     * Admin Product Management Endpoints
     */
    admin: {
      /**
       * Get all products for admin with advanced filters
       * @param {Object} params - Filter parameters (page, limit, search, category, status, type, etc.)
       * @returns {Promise<Object>} Products list with pagination
       */
      async getAll(params = {}) {
        return await axios.get('/admin/products', { params });
      },

      /**
       * Get product for editing
       * @param {string} id - Product ID
       * @returns {Promise<Object>} Product data formatted for editing
       */
      async getForEdit(id) {
        return await axios.get(`/admin/products/${id}/edit`);
      },

      /**
       * Create new product
       * @param {FormData} formData - Product data with images
       * @returns {Promise<Object>} Created product
       */
      async create(formData) {
        return await axios.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      /**
       * Update product
       * @param {string} id - Product ID
       * @param {FormData} formData - Updated product data
       * @returns {Promise<Object>} Updated product
       */
      async update(id, formData) {
        return await axios.put(`/admin/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      /**
       * Delete product
       * @param {string} id - Product ID
       * @returns {Promise<Object>} Deletion result
       */
      async delete(id) {
        return await axios.delete(`/admin/products/${id}`);
      },

      /**
       * Bulk delete products
       * @param {Array<string>} ids - Array of product IDs
       * @returns {Promise<Object>} Deletion result
       */
      async bulkDelete(ids) {
        return await axios.delete('/admin/products/bulk-delete', {
          data: { ids }
        });
      },

      /**
       * Bulk update products
       * @param {Array<string>} ids - Array of product IDs
       * @param {Object} updates - Update data
       * @returns {Promise<Object>} Update result
       */
      async bulkUpdateAdmin(ids, updates) {
        return await axios.patch('/admin/products/bulk-update', {
          productIds: ids,
          updates
        });
      },

      /**
       * Duplicate product
       * @param {string} id - Product ID
       * @returns {Promise<Object>} Duplicated product
       */
      async duplicate(id) {
        return await axios.post(`/admin/products/${id}/duplicate`);
      },

      /**
       * Export products to CSV
       * @param {Object} filters - Filter parameters
       * @returns {Promise<Blob>} CSV file
       */
      async export(filters = {}) {
        return await axios.get('/admin/products/export', {
          params: filters,
          responseType: 'blob'
        });
      }
    }
  },

  /**
   * Categories endpoints
   */
  categories: {
    async getAll(params = {}) {
      return await axios.get('/categories', { params });
    },
    async getById(id) {
      return await axios.get(`/categories/${id}`);
    },
    async getBySlug(slug) {
      return await axios.get(`/categories/slug/${slug}`);
    },
    async create(categoryData) {
      return await axios.post('/categories', categoryData);
    },
    async update(id, categoryData) {
      return await axios.put(`/categories/${id}`, categoryData);
    },
    async delete(id) {
      return await axios.delete(`/categories/${id}`);
    }
  },

  /**
   * SEO Management Endpoints (NEW)
   * For managing SEO settings via dashboard
   */
  seo: {
    /**
     * Get SEO settings for a page
     * @param {string} pageType - Page type (home, products, blog, etc.)
     * @param {string} pageId - Specific page ID (optional)
     * @returns {Promise<Object>}
     */
    async getPageSEO(pageType, pageId = null) {
      const url = pageId 
        ? `/seo/${pageType}/${pageId}` 
        : `/seo/${pageType}`;
      return await axios.get(url);
    },

    /**
     * Update SEO settings for a page
     * @param {string} pageType - Page type
     * @param {string} pageId - Page ID (optional)
     * @param {Object} seoData - SEO data
     * @param {string} seoData.metaTitle - Meta title
     * @param {string} seoData.metaDescription - Meta description
     * @param {Array} seoData.keywords - Keywords array
     * @param {string} seoData.ogImage - OG image URL
     * @param {Object} seoData.structuredData - Structured data
     * @returns {Promise<Object>}
     */
    async updatePageSEO(pageType, pageId, seoData) {
      const url = pageId 
        ? `/seo/${pageType}/${pageId}` 
        : `/seo/${pageType}`;
      return await axios.put(url, seoData);
    },

    /**
     * Generate sitemap
     * @returns {Promise<{ url: string, generated: boolean }>}
     */
    async generateSitemap() {
      return await axios.post('/seo/sitemap/generate');
    },

    /**
     * Submit sitemap to search engines
     * @returns {Promise<{ submitted: Array, errors: Array }>}
     */
    async submitSitemap() {
      return await axios.post('/seo/sitemap/submit');
    },

    /**
     * Get SEO audit report
     * @param {string} url - URL to audit
     * @returns {Promise<Object>}
     */
    async auditPage(url) {
      return await axios.post('/seo/audit', { url });
    },

    /**
     * Get keyword suggestions
     * @param {string} seed - Seed keyword
     * @param {number} limit - Number of suggestions
     * @returns {Promise<Array>}
     */
    async getKeywordSuggestions(seed, limit = 20) {
      return await axios.get('/seo/keywords/suggestions', { 
        params: { seed, limit } 
      });
    },

    /**
     * Analyze keyword competition
     * @param {string} keyword - Keyword to analyze
     * @returns {Promise<Object>}
     */
    async analyzeKeyword(keyword) {
      return await axios.get('/seo/keywords/analyze', { 
        params: { keyword } 
      });
    },

    /**
     * Get robots.txt content
     * @returns {Promise<{ content: string }>}
     */
    async getRobotsTxt() {
      return await axios.get('/seo/robots-txt');
    },

    /**
     * Update robots.txt content
     * @param {string} content - Robots.txt content
     * @returns {Promise<{ message: string }>}
     */
    async updateRobotsTxt(content) {
      return await axios.put('/seo/robots-txt', { content });
    },

    /**
     * Get redirect rules
     * @returns {Promise<Array>}
     */
    async getRedirects() {
      return await axios.get('/seo/redirects');
    },

    /**
     * Create redirect rule
     * @param {Object} redirect - Redirect data
     * @param {string} redirect.from - Source URL
     * @param {string} redirect.to - Destination URL
     * @param {number} redirect.type - HTTP status code (301, 302)
     * @returns {Promise<Object>}
     */
    async createRedirect(redirect) {
      return await axios.post('/seo/redirects', redirect);
    },

    /**
     * Delete redirect rule
     * @param {string} id - Redirect ID
     * @returns {Promise<{ message: string }>}
     */
    async deleteRedirect(id) {
      return await axios.delete(`/seo/redirects/${id}`);
    }
  },

  /**
   * Content Management Endpoints (NEW)
   * For dashboard content control
   */
  content: {
    /**
     * Get page content
     * @param {string} page - Page identifier
     * @returns {Promise<Object>}
     */
    async getPage(page) {
      return await axios.get(`/content/pages/${page}`);
    },

    /**
     * Update page content
     * @param {string} page - Page identifier
     * @param {Object} content - Page content
     * @returns {Promise<Object>}
     */
    async updatePage(page, content) {
      return await axios.put(`/content/pages/${page}`, content);
    },

    /**
     * Get all sections
     * @returns {Promise<Array>}
     */
    async getSections() {
      return await axios.get('/content/sections');
    },

    /**
     * Update section content
     * @param {string} sectionId - Section ID
     * @param {Object} content - Section content
     * @returns {Promise<Object>}
     */
    async updateSection(sectionId, content) {
      return await axios.put(`/content/sections/${sectionId}`, content);
    },

    /**
     * Get menu items
     * @param {string} location - Menu location (header, footer, etc.)
     * @returns {Promise<Array>}
     */
    async getMenu(location) {
      return await axios.get(`/content/menus/${location}`);
    },

    /**
     * Update menu items
     * @param {string} location - Menu location
     * @param {Array} items - Menu items
     * @returns {Promise<Object>}
     */
    async updateMenu(location, items) {
      return await axios.put(`/content/menus/${location}`, { items });
    },

    /**
     * Get banners
     * @param {string} position - Banner position
     * @returns {Promise<Array>}
     */
    async getBanners(position = 'all') {
      return await axios.get('/content/banners', { params: { position } });
    },

    /**
     * Create banner
     * @param {Object} banner - Banner data
     * @returns {Promise<Object>}
     */
    async createBanner(banner) {
      return await axios.post('/content/banners', banner);
    },

    /**
     * Update banner
     * @param {string} id - Banner ID
     * @param {Object} banner - Banner data
     * @returns {Promise<Object>}
     */
    async updateBanner(id, banner) {
      return await axios.put(`/content/banners/${id}`, banner);
    },

    /**
     * Delete banner
     * @param {string} id - Banner ID
     * @returns {Promise<{ message: string }>}
     */
    async deleteBanner(id) {
      return await axios.delete(`/content/banners/${id}`);
    },

    /**
     * Upload media to CMS
     * @param {File} file - Media file
     * @param {Object} metadata - File metadata
     * @returns {Promise<Object>}
     */
    async uploadMedia(file, metadata = {}) {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      return await axios.post('/content/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    /**
     * Get media library
     * @param {Object} params - Query parameters
     * @returns {Promise<{ files: Array, total: number }>}
     */
    async getMediaLibrary(params = {}) {
      return await axios.get('/content/media', { params });
    },

    /**
     * Delete media
     * @param {string} id - Media ID
     * @returns {Promise<{ message: string }>}
     */
    async deleteMedia(id) {
      return await axios.delete(`/content/media/${id}`);
    }
  },

  // ... [Rest of the existing endpoints: orders, customers, measurements, 
  //      categories, reviews, blog, upload, contact, analytics remain the same]

  /**
   * Upload endpoints
   */
  upload: {
    /**
     * Upload single file
     * @param {FormData} formData - FormData with file
     * @returns {Promise<{ success: boolean, data: { url: string } }>}
     */
    async single(formData) {
      return await axios.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    /**
     * Upload multiple files
     * @param {FormData} formData - FormData with files
     * @returns {Promise<{ success: boolean, data: Array }>}
     */
    async multiple(formData) {
      return await axios.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
  },

  /**
   * Customers endpoints
   */
  customers: {
    /**
     * Get customer addresses
     * @returns {Promise<{ success: boolean, data: Array }>}
     */
    async getAddresses() {
      return await axios.get('/customers/addresses');
    },
    /**
     * Add new address
     * @param {Object} addressData - Address data
     * @returns {Promise<{ success: boolean, data: Object }>}
     */
    async addAddress(addressData) {
      return await axios.post('/customers/addresses', addressData);
    },
    /**
     * Update address
     * @param {string} addressId - Address ID
     * @param {Object} addressData - Address data
     * @returns {Promise<{ success: boolean, data: Object }>}
     */
    async updateAddress(addressId, addressData) {
      return await axios.put(`/customers/addresses/${addressId}`, addressData);
    },
    /**
     * Delete address
     * @param {string} addressId - Address ID
     * @returns {Promise<{ success: boolean }>}
     */
    async deleteAddress(addressId) {
      return await axios.delete(`/customers/addresses/${addressId}`);
    },
    /**
     * Set default address
     * @param {string} addressId - Address ID
     * @returns {Promise<{ success: boolean, data: Object }>}
     */
    async setDefaultAddress(addressId) {
      return await axios.put(`/customers/addresses/${addressId}/default`);
    },
  },

  /**
   * Orders (existing)
   */
  orders: {
    async create(orderData) {
      return await axios.post('/orders', orderData);
    },
    async getAll(params = {}) {
      return await axios.get('/orders', { params });
    },
    async getById(id) {
      return await axios.get(`/orders/${id}`);
    },
    async updateStatus(id, status, note = '') {
      return await axios.put(`/orders/${id}/status`, { status, note });
    },
    async track(orderNumber) {
      return await axios.get(`/orders/track/${orderNumber}`);
    },
    async cancel(id, reason) {
      return await axios.post(`/orders/${id}/cancel`, { reason });
    },
    async requestRefund(id, reason, items) {
      return await axios.post(`/orders/${id}/refund`, { reason, items });
    },
    async downloadInvoice(id) {
      return await axios.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      });
    },

    /**
     * Admin Order Management Endpoints
     */
    admin: {
      /**
       * Get all orders for admin with advanced filters
       * @param {Object} params - Filter parameters
       * @returns {Promise<Object>} Orders list with pagination
       */
      async getAll(params = {}) {
        return await axios.get('/admin/orders', { params });
      },

      /**
       * Get order by ID for admin
       * @param {string} id - Order ID
       * @returns {Promise<Object>} Order details
       */
      async getById(id) {
        return await axios.get(`/admin/orders/${id}`);
      },

      /**
       * Update order status
       * @param {string} id - Order ID
       * @param {Object} data - Status update data
       * @returns {Promise<Object>} Updated order
       */
      async updateStatus(id, data) {
        return await axios.put(`/admin/orders/${id}/status`, data);
      },

      /**
       * Verify payment
       * @param {string} id - Order ID
       * @param {Object} data - Verification data
       * @returns {Promise<Object>} Updated order
       */
      async verifyPayment(id, data) {
        return await axios.post(`/admin/orders/${id}/verify-payment`, data);
      },

      /**
       * Cancel order
       * @param {string} id - Order ID
       * @param {Object} data - Cancellation data
       * @returns {Promise<Object>} Updated order
       */
      async cancel(id, data) {
        return await axios.post(`/admin/orders/${id}/cancel`, data);
      },

      /**
       * Process refund
       * @param {string} id - Order ID
       * @param {Object} data - Refund data
       * @returns {Promise<Object>} Refund details
       */
      async processRefund(id, data) {
        return await axios.post(`/admin/orders/${id}/refund`, data);
      },

      /**
       * Add internal note
       * @param {string} id - Order ID
       * @param {Object} data - Note data
       * @returns {Promise<Object>} Updated order
       */
      async addNote(id, data) {
        return await axios.post(`/admin/orders/${id}/notes`, data);
      },

      /**
       * Update shipping address
       * @param {string} id - Order ID
       * @param {Object} data - Address data
       * @returns {Promise<Object>} Updated order
       */
      async updateShippingAddress(id, data) {
        return await axios.put(`/admin/orders/${id}/shipping-address`, data);
      },

      /**
       * Update tracking information
       * @param {string} id - Order ID
       * @param {Object} data - Tracking data
       * @returns {Promise<Object>} Updated order
       */
      async updateTracking(id, data) {
        return await axios.put(`/admin/orders/${id}/tracking`, data);
      },

      /**
       * Generate and download invoice PDF
       * @param {string} id - Order ID
       * @returns {Promise<Blob>} PDF file
       */
      async downloadInvoice(id) {
        return await axios.get(`/admin/orders/${id}/invoice`, {
          responseType: 'blob'
        });
      },

      /**
       * Send notification (email/WhatsApp)
       * @param {string} id - Order ID
       * @param {Object} data - Notification data
       * @returns {Promise<Object>} Notification result
       */
      async sendNotification(id, data) {
        return await axios.post(`/admin/orders/${id}/notify`, data);
      },

      /**
       * Export orders to CSV
       * @param {Object} params - Filter parameters
       * @returns {Promise<Blob>} CSV file
       */
      async export(params = {}) {
        return await axios.get('/admin/orders/export', {
          params,
          responseType: 'blob'
        });
      }
    }
  },

  /**
   * Blog (existing with SEO enhancements)
   */
  blog: {
    async getAll(params = {}) {
      return await axios.get('/blog', { params });
    },
    async getBySlug(slug) {
      return await axios.get(`/blog/${slug}`);
    },
    async getRelated(slug, limit = 3) {
      return await axios.get(`/blog/${slug}/related`, { params: { limit } });
    },
    async incrementView(slug) {
      return await axios.post(`/blog/${slug}/view`);
    },
    async getCategories() {
      return await axios.get('/blog/categories');
    },
    async getTags() {
      return await axios.get('/blog/tags');
    },
    /**
     * Create blog post (admin)
     * @param {Object} postData - Blog post data with SEO fields
     * @returns {Promise<Object>}
     */
    async create(postData) {
      return await axios.post('/blog', postData);
    },
    /**
     * Update blog post (admin)
     * @param {string} id - Post ID
     * @param {Object} postData - Updated post data
     * @returns {Promise<Object>}
     */
    async update(id, postData) {
      return await axios.put(`/blog/${id}`, postData);
    },
    /**
     * Delete blog post (admin)
     * @param {string} id - Post ID
     * @returns {Promise<{ message: string }>}
     */
    async delete(id) {
      return await axios.delete(`/blog/${id}`);
    }
  },

  /**
   * Analytics (existing)
   */
  /**
   * Admin Dashboard endpoints
   */
  dashboard: {
    /**
     * Get complete dashboard data
     * @param {Object} params - Query parameters (period, startDate, endDate)
     * @returns {Promise<Object>} Dashboard data
     */
    async getDashboard(params = {}) {
      return await axios.get('/admin/dashboard', { params });
    },
    /**
     * Get revenue trends
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Revenue trends data
     */
    async getRevenueTrends(params = {}) {
      return await axios.get('/admin/dashboard/revenue-trends', { params });
    },
    /**
     * Get order distribution
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Order distribution data
     */
    async getOrderDistribution(params = {}) {
      return await axios.get('/admin/dashboard/order-distribution', { params });
    },
    /**
     * Get top products
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Top products data
     */
    async getTopProducts(params = {}) {
      return await axios.get('/admin/dashboard/top-products', { params });
    },
    /**
     * Get inventory alerts
     * @returns {Promise<Object>} Low stock alerts
     */
    async getInventoryAlerts() {
      return await axios.get('/admin/dashboard/inventory-alerts');
    },
    /**
     * Export dashboard data
     * @param {Object} params - Export options (format, type, period, etc.)
     * @returns {Promise<Blob>} Exported file
     */
    async exportData(params = {}) {
      return await axios.get('/admin/dashboard/export', {
        params,
        responseType: 'blob'
      });
    }
  },

  analytics: {
    async getDashboardStats(params = {}) {
      return await axios.get('/analytics/dashboard', { params });
    },
    async getSalesData(params = {}) {
      return await axios.get('/analytics/sales', { params });
    },
    async getTopProducts(params = {}) {
      return await axios.get('/analytics/products/top', { params });
    },
    async getCustomerAnalytics(params = {}) {
      return await axios.get('/analytics/customers', { params });
    },
    /**
     * Get SEO analytics (NEW)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>}
     */
    async getSEOAnalytics(params = {}) {
      return await axios.get('/analytics/seo', { params });
    },
    /**
     * Get traffic sources
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>}
     */
    async getTrafficSources(params = {}) {
      return await axios.get('/analytics/traffic', { params });
    },
    /**
     * Get suit type sales distribution
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>}
     */
    async getSuitTypeSales(params = {}) {
      return await axios.get('/analytics/suit-type-sales', { params });
    },
    /**
     * Get replica conversion metrics
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>}
     */
    async getReplicaConversion(params = {}) {
      return await axios.get('/analytics/replica-conversion', { params });
    }
  },

  /**
   * Custom Orders Endpoints
   */
  customOrders: {
    /**
     * Submit custom order
     * @param {FormData} orderData - Custom order data with images
     * @returns {Promise<{ success: boolean, orderId: string, orderNumber: string }>}
     */
    async submit(orderData) {
      return await axios.post('/orders/custom', orderData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    /**
     * Upload reference images
     * @param {File[]} images - Image files
     * @returns {Promise<{ urls: string[] }>}
     */
    async uploadImages(images) {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });
      return await axios.post('/orders/custom/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    /**
     * Get saved measurements (for logged-in users)
     * @returns {Promise<{ measurements: Array }>}
     */
    async getSavedMeasurements() {
      return await axios.get('/measurements');
    },

    /**
     * Save measurements
     * @param {Object} measurementData - Measurement data
     * @returns {Promise<{ success: boolean, measurementId: string }>}
     */
    async saveMeasurements(measurementData) {
      return await axios.post('/measurements', measurementData);
    },
  },

  /**
   * Cart Management Endpoints
   */
  cart: {
    /**
     * Get user's cart
     * @returns {Promise<{ items: Array, success: boolean }>}
     */
    async get() {
      return await axios.get('/cart');
    },

    /**
     * Sync cart with backend
     * @param {Array} items - Cart items
     * @returns {Promise<{ success: boolean, items: Array }>}
     */
    async sync(items) {
      return await axios.post('/cart/sync', { items });
    },

    /**
     * Apply promo code
     * @param {string} code - Promo code
     * @param {Array} items - Cart items
     * @returns {Promise<{ success: boolean, discount: number, discountType: string, message?: string }>}
     */
    async applyPromoCode(code, items) {
      return await axios.post('/cart/promo', { code, items });
    },

    /**
     * Calculate shipping cost
     * @param {Object} address - Shipping address
     * @param {Array} items - Cart items
     * @returns {Promise<{ cost: number }>}
     */
    async calculateShipping(address, items) {
      return await axios.post('/cart/shipping', { address, items });
    },

    /**
     * Validate cart items
     * @returns {Promise<{ valid: boolean, errors: Array }>}
     */
    async validate() {
      return await axios.post('/cart/validate');
    }
  }
};

export default api;