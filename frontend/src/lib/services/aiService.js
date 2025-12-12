/**
 * AI Service for Frontend
 * 
 * Handles communication with backend AI endpoints for:
 * - Product description generation
 * - SEO keyword generation
 * - Complete content generation
 * 
 * @module lib/services/aiService
 */

import axios from '@/lib/axios';

/**
 * AI Service class for product content generation
 */
class AIService {
  /**
   * Check AI service configuration status
   * 
   * @returns {Promise<Object>} Service status
   */
  async checkStatus() {
    try {
      // Add timeout to prevent hanging
      const response = await Promise.race([
        axios.get('/admin/ai/status'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI service timeout')), 5000)
        )
      ]);
      // axios interceptor already returns response.data
      return response;
    } catch (error) {
      console.error('AI Status Check Error:', error);
      return {
        success: false,
        data: {
          configured: false,
          message: error.message === 'AI service timeout' 
            ? 'AI service not responding (timeout)'
            : 'Unable to check AI service status'
        }
      };
    }
  }

  /**
   * Generate product description from title
   * 
   * @param {Object} params
   * @param {string} params.title - Product title (required)
   * @param {string} params.category - Product category
   * @param {string} params.fabricType - Fabric type
   * @param {string} params.occasion - Occasion type
   * @returns {Promise<Object>} Generated description data
   */
  async generateDescription({ title, category, fabricType, occasion }) {
    if (!title || title.trim().length < 3) {
      throw new Error('Product title is required (minimum 3 characters)');
    }

    try {
      const response = await axios.post('/admin/ai/generate-description', {
        title,
        category,
        fabricType,
        occasion
      });

      // axios interceptor already returns response.data
      return {
        success: true,
        data: response.data,
        usage: response.usage,
        rateLimit: response.rateLimit
      };
    } catch (error) {
      console.error('Generate Description Error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate description. Please try again.'
      );
    }
  }

  /**
   * Generate SEO keywords from product information
   * 
   * @param {Object} params
   * @param {string} params.title - Product title (required)
   * @param {string} params.description - Product description
   * @param {string} params.category - Product category
   * @param {string} params.fabricType - Fabric type
   * @returns {Promise<Object>} Generated keywords data
   */
  async generateKeywords({ title, description, category, fabricType }) {
    if (!title || title.trim().length < 3) {
      throw new Error('Product title is required (minimum 3 characters)');
    }

    try {
      const response = await axios.post('/admin/ai/generate-keywords', {
        title,
        description,
        category,
        fabricType
      });

      // axios interceptor already returns response.data
      return {
        success: true,
        data: response.data,
        usage: response.usage,
        rateLimit: response.rateLimit
      };
    } catch (error) {
      console.error('Generate Keywords Error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate keywords. Please try again.'
      );
    }
  }

  /**
   * Generate complete product content (description + keywords + SEO)
   * Most efficient option - single API call for all content
   * 
   * @param {Object} params
   * @param {string} params.title - Product title (required)
   * @param {string} params.category - Product category
   * @param {string} params.fabricType - Fabric type
   * @param {string} params.occasion - Occasion type
   * @returns {Promise<Object>} Complete generated content
   */
  async generateCompleteContent({ title, category, fabricType, occasion }) {
    if (!title || title.trim().length < 3) {
      throw new Error('Product title is required (minimum 3 characters)');
    }

    try {
      const response = await axios.post('/admin/ai/generate-complete', {
        title,
        category,
        fabricType,
        occasion
      });

      // axios interceptor already returns response.data
      return {
        success: true,
        data: response.data,
        usage: response.usage,
        generatedAt: response.generatedAt,
        rateLimit: response.rateLimit
      };
    } catch (error) {
      console.error('Generate Complete Content Error:', error);
      
      // Handle rate limit error specifically
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60;
        throw new Error(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        );
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate content. Please try again.'
      );
    }
  }

  /**
   * Save AI-generated content as draft
   * 
   * @param {Object} params
   * @param {string} params.productId - Existing product ID (optional)
   * @param {Object} params.generatedContent - AI-generated content
   * @param {string} params.title - Product title
   * @returns {Promise<Object>} Save result
   */
  async saveDraft({ productId, generatedContent, title }) {
    try {
      // Use the correct axios instance (imported at top of file)
      const response = await axios.post('/admin/ai/save-draft', {
        productId,
        generatedContent,
        title
      });

      return {
        success: true,
        data: response.data,
        message: response.message || 'Draft saved successfully'
      };
    } catch (error) {
      console.error('Save Draft Error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to save draft. Please try again.'
      );
    }
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;

// Also export class for testing
export { AIService };
