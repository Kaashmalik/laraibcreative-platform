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
      return await axios.get('/auth/verify-token');
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
      return await axios.post('/auth/verify-email', { token });
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
    async getRelated(id, limit = 4) {
      return await axios.get(`/products/${id}/related`, { params: { limit } });
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
    }
  }
};

export default api;