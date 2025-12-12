/**
 * AI Controller
 * 
 * Handles AI-powered content generation endpoints for admin panel
 * 
 * Endpoints:
 * - POST /api/v1/admin/ai/generate-description
 * - POST /api/v1/admin/ai/generate-keywords
 * - POST /api/v1/admin/ai/generate-complete
 * - GET /api/v1/admin/ai/status
 * 
 * Security:
 * - Admin authentication required
 * - Rate limiting applied (Redis-ready)
 * - Input validation
 * 
 * @module controllers/aiController
 */

const aiService = require('../services/aiService');
const { rateLimiterService, RATE_LIMIT_CONFIGS } = require('../services/rateLimiterService');

/**
 * Check rate limit for user using the rate limiter service
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Rate limit status
 */
const checkRateLimit = async (userId) => {
  try {
    const result = await rateLimiterService.checkLimit(userId, 'ai');
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetIn: result.resetIn,
      limit: result.limit,
      message: result.allowed ? null : `Rate limit exceeded. Please wait ${result.retryAfter} seconds.`
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIGS.ai.maxRequests,
      resetIn: 60,
      limit: RATE_LIMIT_CONFIGS.ai.maxRequests
    };
  }
};

/**
 * POST /api/v1/admin/ai/generate-description
 * Generate product description from title
 * 
 * @access Private (Admin)
 */
exports.generateDescription = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    
    // Check rate limit (async - uses Redis if available)
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimit.message,
        retryAfter: rateLimit.resetIn
      });
    }
    
    const { title, category, fabricType, occasion } = req.body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required (minimum 3 characters)'
      });
    }
    
    const result = await aiService.generateProductDescription({
      title,
      category,
      fabricType,
      occasion
    });
    
    res.status(200).json({
      success: true,
      message: 'Description generated successfully',
      data: result.data,
      usage: result.usage,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn
      }
    });
    
  } catch (error) {
    console.error('Generate Description Error:', error);
    
    // Check for specific error types
    if (error.message.includes('API key')) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not properly configured. Please contact administrator.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate description. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/ai/generate-keywords
 * Generate SEO keywords from product information
 * 
 * @access Private (Admin)
 */
exports.generateKeywords = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    
    // Check rate limit (async - uses Redis if available)
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimit.message,
        retryAfter: rateLimit.resetIn
      });
    }
    
    const { title, description, category, fabricType } = req.body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required (minimum 3 characters)'
      });
    }
    
    const result = await aiService.generateSEOKeywords({
      title,
      description,
      category,
      fabricType
    });
    
    res.status(200).json({
      success: true,
      message: 'Keywords generated successfully',
      data: result.data,
      usage: result.usage,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn
      }
    });
    
  } catch (error) {
    console.error('Generate Keywords Error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not properly configured. Please contact administrator.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate keywords. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/ai/generate-complete
 * Generate complete product content (description + keywords + SEO)
 * Most efficient option - single API call for all content
 * 
 * @access Private (Admin)
 */
exports.generateCompleteContent = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    
    // Check rate limit (async - uses Redis if available)
    // Complete generation counts as 2 requests
    const rateLimit = await checkRateLimit(userId);
    await checkRateLimit(userId); // Count as 2 requests
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimit.message,
        retryAfter: rateLimit.resetIn
      });
    }
    
    const { title, category, fabricType, occasion } = req.body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required (minimum 3 characters)'
      });
    }
    
    const result = await aiService.generateCompleteProductContent({
      title,
      category,
      fabricType,
      occasion
    });
    
    res.status(200).json({
      success: true,
      message: 'Complete content generated successfully',
      data: result.data,
      usage: result.usage,
      generatedAt: result.generatedAt,
      rateLimit: {
        remaining: Math.max(0, rateLimit.remaining - 1),
        resetIn: rateLimit.resetIn
      }
    });
    
  } catch (error) {
    console.error('Generate Complete Content Error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not properly configured. Please contact administrator.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate content. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/v1/admin/ai/status
 * Check AI service configuration status
 * 
 * @access Private (Admin)
 */
exports.getStatus = async (req, res) => {
  try {
    // Quick check without hanging
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const activeProvider = hasGroq ? 'groq' : hasGemini ? 'gemini' : null;
    
    const userId = req.user?.id || req.ip;
    
    // Get rate limit usage using the service
    const usage = await rateLimiterService.getUsage(userId, 'ai');
    const config = RATE_LIMIT_CONFIGS.ai;
    
    res.status(200).json({
      success: true,
      data: {
        configured: hasGroq || hasGemini,
        providers: {
          groq: { 
            configured: hasGroq, 
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            priority: 1 
          },
          gemini: { 
            configured: hasGemini, 
            model: process.env.GEMINI_MODEL || 'gemini-pro',
            priority: 2 
          }
        },
        activeProvider,
        message: activeProvider 
          ? `AI configured with ${activeProvider} (${hasGroq && hasGemini ? 'fallback available' : 'single provider'})`
          : 'No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env',
        rateLimit: {
          limit: config.maxRequests,
          remaining: usage?.remaining ?? config.maxRequests,
          window: config.windowMs / 1000,
          resetIn: usage?.resetIn ?? 0
        },
        rateLimiterStatus: rateLimiterService.getStatus()
      }
    });
    
  } catch (error) {
    console.error('AI Status Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI status'
    });
  }
};

/**
 * POST /api/v1/admin/ai/save-draft
 * Save AI-generated content as draft
 * 
 * @access Private (Admin)
 */
exports.saveDraft = async (req, res) => {
  try {
    const { productId, generatedContent, title } = req.body;
    
    if (!generatedContent || !title) {
      return res.status(400).json({
        success: false,
        message: 'Generated content and title are required'
      });
    }
    
    // Store draft in database or session
    // For now, we'll store it with the product if productId exists
    // Otherwise, create a new draft product
    
    const Product = require('../models/Product');
    
    if (productId) {
      // Update existing product draft
      const product = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            'aiGeneratedContent': generatedContent,
            'aiGeneratedAt': new Date(),
            'status': 'draft'
          }
        },
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Draft saved successfully',
        data: { productId: product._id }
      });
    } else {
      // Create new draft product with AI content
      res.status(200).json({
        success: true,
        message: 'Draft content ready for new product',
        data: {
          title,
          generatedContent,
          status: 'draft',
          generatedAt: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('Save Draft Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
