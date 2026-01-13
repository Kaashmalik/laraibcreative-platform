/**
 * SEO Dashboard Controller
 * Handles SEO analytics, AI content generation dashboard, and optimization
 * 
 * @module controllers/seoDashboardController
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * SEO Content History Model (in-memory for now, can be moved to MongoDB)
 */
const seoContentHistory = [];

/**
 * Calculate SEO score for a product
 * @param {Object} product - Product document
 * @returns {Object} SEO score breakdown
 */
const calculateSEOScore = (product) => {
  let score = 0;
  const breakdown = {
    title: { score: 0, max: 20, issues: [] },
    description: { score: 0, max: 25, issues: [] },
    metaData: { score: 0, max: 20, issues: [] },
    keywords: { score: 0, max: 15, issues: [] },
    images: { score: 0, max: 10, issues: [] },
    content: { score: 0, max: 10, issues: [] }
  };

  // Title analysis (20 points)
  if (product.title) {
    const titleLen = product.title.length;
    if (titleLen >= 30 && titleLen <= 60) {
      breakdown.title.score = 20;
    } else if (titleLen >= 20 && titleLen < 30) {
      breakdown.title.score = 15;
      breakdown.title.issues.push('Title is slightly short (recommended: 30-60 characters)');
    } else if (titleLen > 60 && titleLen <= 80) {
      breakdown.title.score = 15;
      breakdown.title.issues.push('Title is slightly long (recommended: 30-60 characters)');
    } else if (titleLen < 20) {
      breakdown.title.score = 10;
      breakdown.title.issues.push('Title is too short (minimum: 20 characters)');
    } else {
      breakdown.title.score = 10;
      breakdown.title.issues.push('Title is too long (maximum: 80 characters)');
    }
  } else {
    breakdown.title.issues.push('Missing product title');
  }

  // Description analysis (25 points)
  const description = product.description || product.fullDescription || '';
  if (description) {
    const descLen = description.length;
    if (descLen >= 150 && descLen <= 500) {
      breakdown.description.score = 25;
    } else if (descLen >= 100 && descLen < 150) {
      breakdown.description.score = 18;
      breakdown.description.issues.push('Description could be more detailed');
    } else if (descLen > 500) {
      breakdown.description.score = 20;
      breakdown.description.issues.push('Description is quite long, consider summarizing');
    } else if (descLen > 0) {
      breakdown.description.score = 10;
      breakdown.description.issues.push('Description is too short (minimum: 100 characters)');
    }
  } else {
    breakdown.description.issues.push('Missing product description');
  }

  // Meta data analysis (20 points)
  const seo = product.seo || {};
  if (seo.metaTitle && seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60) {
    breakdown.metaData.score += 10;
  } else if (!seo.metaTitle) {
    breakdown.metaData.issues.push('Missing meta title');
  } else {
    breakdown.metaData.score += 5;
    breakdown.metaData.issues.push('Meta title length not optimal (30-60 characters)');
  }

  if (seo.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160) {
    breakdown.metaData.score += 10;
  } else if (!seo.metaDescription) {
    breakdown.metaData.issues.push('Missing meta description');
  } else {
    breakdown.metaData.score += 5;
    breakdown.metaData.issues.push('Meta description length not optimal (120-160 characters)');
  }

  // Keywords analysis (15 points)
  const keywords = seo.keywords || product.tags || [];
  if (keywords.length >= 5) {
    breakdown.keywords.score = 15;
  } else if (keywords.length >= 3) {
    breakdown.keywords.score = 10;
    breakdown.keywords.issues.push('Add more keywords (recommended: 5+)');
  } else if (keywords.length > 0) {
    breakdown.keywords.score = 5;
    breakdown.keywords.issues.push('Too few keywords (minimum: 3)');
  } else {
    breakdown.keywords.issues.push('No keywords defined');
  }

  // Images analysis (10 points)
  const images = product.images || [];
  if (images.length >= 3 && images.every(img => img.alt)) {
    breakdown.images.score = 10;
  } else if (images.length >= 1) {
    breakdown.images.score = images.every(img => img.alt) ? 7 : 5;
    if (images.length < 3) breakdown.images.issues.push('Add more product images');
    if (!images.every(img => img.alt)) breakdown.images.issues.push('Some images missing alt text');
  } else {
    breakdown.images.issues.push('No product images');
  }

  // Content quality analysis (10 points)
  const features = product.features || [];
  if (features.length >= 3) {
    breakdown.content.score += 5;
  } else {
    breakdown.content.issues.push('Add more product features');
  }
  
  if (product.careInstructions) {
    breakdown.content.score += 5;
  } else {
    breakdown.content.issues.push('Missing care instructions');
  }

  // Calculate total score
  Object.values(breakdown).forEach(item => {
    score += item.score;
  });

  return {
    totalScore: score,
    maxScore: 100,
    percentage: Math.round((score / 100) * 100),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    breakdown
  };
};

/**
 * GET /api/v1/admin/seo/dashboard
 * Get SEO dashboard overview with metrics
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    // Get all active products
    const products = await Product.find({ isDeleted: { $ne: true } })
      .select('title description seo images tags features careInstructions slug')
      .lean();

    // Calculate SEO scores for all products
    const seoScores = products.map(product => ({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      ...calculateSEOScore(product)
    }));

    // Calculate overall metrics
    const totalProducts = products.length;
    const avgScore = totalProducts > 0 
      ? Math.round(seoScores.reduce((sum, p) => sum + p.percentage, 0) / totalProducts)
      : 0;
    
    const gradeDistribution = {
      A: seoScores.filter(p => p.grade === 'A').length,
      B: seoScores.filter(p => p.grade === 'B').length,
      C: seoScores.filter(p => p.grade === 'C').length,
      D: seoScores.filter(p => p.grade === 'D').length
    };

    // Identify products needing attention
    const needsOptimization = seoScores
      .filter(p => p.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 10);

    // Top performing products
    const topPerforming = seoScores
      .filter(p => p.percentage >= 80)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // Common issues
    const issueCount = {};
    seoScores.forEach(product => {
      Object.values(product.breakdown).forEach(category => {
        category.issues.forEach(issue => {
          issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
      });
    });

    const commonIssues = Object.entries(issueCount)
      .map(([issue, count]) => ({ issue, count, percentage: Math.round((count / totalProducts) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // AI service status
    const aiStatus = aiService.checkConfiguration();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProducts,
          avgSEOScore: avgScore,
          gradeDistribution,
          productsNeedingWork: gradeDistribution.C + gradeDistribution.D,
          optimizedProducts: gradeDistribution.A + gradeDistribution.B
        },
        needsOptimization,
        topPerforming,
        commonIssues,
        aiService: {
          configured: aiStatus.configured,
          activeProvider: aiStatus.activeProvider,
          message: aiStatus.message
        },
        recentActivity: seoContentHistory.slice(-10).reverse()
      }
    });
  } catch (error) {
    logger.error('SEO Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load SEO dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/v1/admin/seo/products-analysis
 * Get SEO analysis for all products with pagination
 */
exports.getProductsSEOAnalysis = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'score',
      order = 'asc',
      grade = '',
      search = ''
    } = req.query;

    let filter = { isDeleted: { $ne: true } };

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('title description seo images tags features careInstructions slug sku category')
        .populate('category', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate SEO scores
    let analysisResults = products.map(product => ({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      ...calculateSEOScore(product)
    }));

    // Filter by grade
    if (grade) {
      analysisResults = analysisResults.filter(p => p.grade === grade.toUpperCase());
    }

    // Sort results
    if (sort === 'score') {
      analysisResults.sort((a, b) => order === 'asc' ? a.percentage - b.percentage : b.percentage - a.percentage);
    } else if (sort === 'title') {
      analysisResults.sort((a, b) => order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
    }

    res.status(200).json({
      success: true,
      data: analysisResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        productsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Products SEO Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/v1/admin/seo/products/:id/analysis
 * Get detailed SEO analysis for a specific product
 */
exports.getProductSEODetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const seoAnalysis = calculateSEOScore(product);

    // Generate AI recommendations
    let aiRecommendations = null;
    const aiStatus = aiService.checkConfiguration();
    
    if (aiStatus.configured && seoAnalysis.percentage < 80) {
      try {
        const suggestions = [];
        
        if (seoAnalysis.breakdown.description.score < 20) {
          suggestions.push({
            type: 'description',
            priority: 'high',
            message: 'Generate AI-optimized description',
            action: 'Use AI to create a compelling, SEO-friendly description'
          });
        }
        
        if (seoAnalysis.breakdown.keywords.score < 10) {
          suggestions.push({
            type: 'keywords',
            priority: 'high',
            message: 'Generate SEO keywords',
            action: 'Use AI to identify target keywords for this product'
          });
        }
        
        if (seoAnalysis.breakdown.metaData.score < 15) {
          suggestions.push({
            type: 'meta',
            priority: 'medium',
            message: 'Optimize meta tags',
            action: 'Generate meta title and description using AI'
          });
        }

        aiRecommendations = suggestions;
      } catch (error) {
        logger.warn('Failed to generate AI recommendations:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        product: {
          _id: product._id,
          title: product.title,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          category: product.category,
          seo: product.seo,
          images: product.images,
          tags: product.tags,
          features: product.features,
          careInstructions: product.careInstructions
        },
        analysis: seoAnalysis,
        aiRecommendations,
        aiEnabled: aiStatus.configured
      }
    });
  } catch (error) {
    logger.error('Product SEO Detail Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/seo/products/:id/optimize
 * Generate and apply AI-optimized SEO content for a product
 */
exports.optimizeProductSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const { applyChanges = false, optimizeFields = ['description', 'keywords', 'meta'] } = req.body;

    const product = await Product.findById(id)
      .populate('category', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check AI service
    const aiStatus = aiService.checkConfiguration();
    if (!aiStatus.configured) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add API keys to environment.'
      });
    }

    // Generate optimized content
    const generatedContent = {};
    let provider = null;

    try {
      const result = await aiService.generateCompleteProductContent({
        title: product.title,
        category: product.category?.name,
        fabricType: product.fabricType,
        occasion: product.occasion
      });

      generatedContent.description = result.data.fullDescription;
      generatedContent.shortDescription = result.data.shortDescription;
      generatedContent.features = result.data.features;
      generatedContent.careInstructions = result.data.careInstructions;
      generatedContent.keywords = result.data.keywords;
      generatedContent.metaTitle = result.data.metaTitle;
      generatedContent.metaDescription = result.data.metaDescription;
      provider = result.provider;

      // Record in history
      seoContentHistory.push({
        productId: product._id,
        productTitle: product.title,
        action: 'optimize',
        provider,
        timestamp: new Date().toISOString(),
        appliedChanges: applyChanges,
        generatedBy: req.user?.email || 'system'
      });

    } catch (aiError) {
      logger.error('AI generation failed:', aiError);
      return res.status(500).json({
        success: false,
        message: 'AI content generation failed',
        error: process.env.NODE_ENV === 'development' ? aiError.message : undefined
      });
    }

    // Apply changes if requested
    if (applyChanges) {
      const updates = {};
      
      if (optimizeFields.includes('description')) {
        updates.description = generatedContent.description;
        updates.shortDescription = generatedContent.shortDescription;
        updates.features = generatedContent.features;
        updates.careInstructions = generatedContent.careInstructions;
      }
      
      if (optimizeFields.includes('keywords')) {
        updates['seo.keywords'] = generatedContent.keywords;
        updates.tags = generatedContent.keywords.slice(0, 5);
      }
      
      if (optimizeFields.includes('meta')) {
        updates['seo.metaTitle'] = generatedContent.metaTitle;
        updates['seo.metaDescription'] = generatedContent.metaDescription;
      }

      await Product.findByIdAndUpdate(id, { $set: updates });
    }

    // Calculate new SEO score with real product data
    const updatedProduct = await Product.findById(id);
    const projectedScore = calculateSEOScore(updatedProduct);
    const currentScore = calculateSEOScore(product);

    res.status(200).json({
      success: true,
      message: applyChanges ? 'SEO content optimized and applied' : 'SEO content generated (preview)',
      data: {
        generatedContent,
        provider,
        currentScore: {
          percentage: currentScore.percentage,
          grade: currentScore.grade
        },
        projectedScore: {
          percentage: projectedScore.percentage,
          grade: projectedScore.grade,
          improvement: projectedScore.percentage - currentScore.percentage
        },
        applied: applyChanges
      }
    });
  } catch (error) {
    logger.error('Optimize Product SEO Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize product SEO',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/seo/bulk-optimize
 * Bulk optimize multiple products with AI
 */
exports.bulkOptimizeSEO = async (req, res) => {
  try {
    const { productIds, optimizeFields = ['description', 'keywords', 'meta'], applyChanges = false } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required'
      });
    }

    if (productIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 products can be optimized at once'
      });
    }

    // Check AI service
    const aiStatus = aiService.checkConfiguration();
    if (!aiStatus.configured) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category', 'name')
      .lean();

    const results = {
      success: [],
      failed: []
    };

    // Process each product (sequentially to avoid rate limits)
    for (const product of products) {
      try {
        const result = await aiService.generateCompleteProductContent({
          title: product.title,
          category: product.category?.name,
          fabricType: product.fabricType,
          occasion: product.occasion
        });

        if (applyChanges) {
          const updates = {};
          
          if (optimizeFields.includes('description')) {
            updates.description = result.data.fullDescription;
            updates.shortDescription = result.data.shortDescription;
            updates.features = result.data.features;
          }
          
          if (optimizeFields.includes('keywords')) {
            updates['seo.keywords'] = result.data.keywords;
            updates.tags = result.data.keywords.slice(0, 5);
          }
          
          if (optimizeFields.includes('meta')) {
            updates['seo.metaTitle'] = result.data.metaTitle;
            updates['seo.metaDescription'] = result.data.metaDescription;
          }

          await Product.findByIdAndUpdate(product._id, { $set: updates });
        }

        results.success.push({
          productId: product._id,
          title: product.title,
          provider: result.provider
        });

        // Record in history
        seoContentHistory.push({
          productId: product._id,
          productTitle: product.title,
          action: 'bulk-optimize',
          provider: result.provider,
          timestamp: new Date().toISOString(),
          appliedChanges: applyChanges,
          generatedBy: req.user?.email || 'system'
        });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        results.failed.push({
          productId: product._id,
          title: product.title,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Optimized ${results.success.length} of ${products.length} products`,
      data: {
        results,
        applied: applyChanges
      }
    });
  } catch (error) {
    logger.error('Bulk Optimize SEO Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk optimize products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/v1/admin/seo/content-history
 * Get AI content generation history
 */
exports.getContentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    
    const paginatedHistory = seoContentHistory
      .slice()
      .reverse()
      .slice(start, end);

    res.status(200).json({
      success: true,
      data: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(seoContentHistory.length / parseInt(limit)),
        totalItems: seoContentHistory.length
      }
    });
  } catch (error) {
    logger.error('Content History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content history'
    });
  }
};

/**
 * GET /api/v1/admin/seo/keywords-performance
 * Get keywords performance analytics
 */
exports.getKeywordsPerformance = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .select('seo.keywords tags title')
      .lean();

    // Aggregate keywords
    const keywordMap = {};
    
    products.forEach(product => {
      const keywords = [...(product.seo?.keywords || []), ...(product.tags || [])];
      keywords.forEach(keyword => {
        const key = keyword.toLowerCase().trim();
        if (key) {
          if (!keywordMap[key]) {
            keywordMap[key] = { keyword: key, count: 0, products: [] };
          }
          keywordMap[key].count++;
          keywordMap[key].products.push(product.title);
        }
      });
    });

    // Sort by usage
    const topKeywords = Object.values(keywordMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)
      .map(k => ({
        keyword: k.keyword,
        usageCount: k.count,
        productCount: k.products.length
      }));

    // Products without keywords
    const productsWithoutKeywords = products.filter(p => 
      (!p.seo?.keywords || p.seo.keywords.length === 0) &&
      (!p.tags || p.tags.length === 0)
    ).length;

    res.status(200).json({
      success: true,
      data: {
        topKeywords,
        totalUniqueKeywords: Object.keys(keywordMap).length,
        productsWithoutKeywords,
        productsWithKeywords: products.length - productsWithoutKeywords,
        avgKeywordsPerProduct: products.length > 0
          ? Math.round(Object.values(keywordMap).reduce((sum, k) => sum + k.count, 0) / products.length * 10) / 10
          : 0
      }
    });
  } catch (error) {
    logger.error('Keywords Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze keywords'
    });
  }
};

/**
 * POST /api/v1/admin/seo/analyze-content
 * Analyze content quality and SEO score
 */
exports.analyzeContent = async (req, res) => {
  try {
    const { title, description, keywords = [], metaTitle, metaDescription } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required for analysis'
      });
    }

    // Create product object for analysis using provided data
    const productForAnalysis = {
      title,
      description,
      seo: {
        metaTitle,
        metaDescription,
        keywords
      },
      tags: keywords,
      images: [{ alt: metaTitle || title }],
      features: description ? [description.substring(0, 100)] : [],
      careInstructions: description ? description.substring(0, 100) : ''
    };

    const analysis = calculateSEOScore(productForAnalysis);

    // Additional content analysis
    const contentAnalysis = {
      titleLength: title.length,
      titleOptimal: title.length >= 30 && title.length <= 60,
      descriptionLength: description?.length || 0,
      descriptionOptimal: description && description.length >= 150 && description.length <= 500,
      keywordCount: keywords.length,
      keywordsOptimal: keywords.length >= 5,
      metaTitleLength: metaTitle?.length || 0,
      metaTitleOptimal: metaTitle && metaTitle.length >= 30 && metaTitle.length <= 60,
      metaDescriptionLength: metaDescription?.length || 0,
      metaDescriptionOptimal: metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160
    };

    res.status(200).json({
      success: true,
      data: {
        seoScore: analysis,
        contentAnalysis,
        suggestions: Object.values(analysis.breakdown)
          .flatMap(b => b.issues)
          .filter(i => i)
      }
    });
  } catch (error) {
    logger.error('Analyze Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content'
    });
  }
};

/**
 * GET /api/v1/admin/seo/suggestions
 * Get AI-powered SEO improvement suggestions
 */
exports.getSEOSuggestions = async (req, res) => {
  try {
    // Get products with low SEO scores
    const products = await Product.find({ isDeleted: { $ne: true } })
      .select('title description seo images tags features careInstructions slug category')
      .populate('category', 'name')
      .lean();

    const lowScoreProducts = products
      .map(p => ({ ...p, seo: calculateSEOScore(p) }))
      .filter(p => p.seo.percentage < 60)
      .sort((a, b) => a.seo.percentage - b.seo.percentage)
      .slice(0, 20);

    // Generate suggestions
    const suggestions = {
      urgent: [],
      important: [],
      recommended: []
    };

    lowScoreProducts.forEach(product => {
      const issues = Object.values(product.seo.breakdown).flatMap(b => b.issues);
      
      if (product.seo.percentage < 40) {
        suggestions.urgent.push({
          productId: product._id,
          title: product.title,
          score: product.seo.percentage,
          issues: issues.slice(0, 3),
          action: 'Immediate AI optimization recommended'
        });
      } else if (product.seo.percentage < 60) {
        suggestions.important.push({
          productId: product._id,
          title: product.title,
          score: product.seo.percentage,
          issues: issues.slice(0, 3),
          action: 'Schedule for optimization'
        });
      }
    });

    // General recommendations
    const missingDescriptions = products.filter(p => !p.description || p.description.length < 50).length;
    const missingKeywords = products.filter(p => !p.seo?.keywords || p.seo.keywords.length < 3).length;
    const missingMeta = products.filter(p => !p.seo?.metaTitle || !p.seo?.metaDescription).length;

    if (missingDescriptions > 0) {
      suggestions.recommended.push({
        type: 'description',
        count: missingDescriptions,
        message: `${missingDescriptions} products need better descriptions`,
        action: 'Use bulk AI optimization for descriptions'
      });
    }

    if (missingKeywords > 0) {
      suggestions.recommended.push({
        type: 'keywords',
        count: missingKeywords,
        message: `${missingKeywords} products need more keywords`,
        action: 'Generate keywords using AI'
      });
    }

    if (missingMeta > 0) {
      suggestions.recommended.push({
        type: 'meta',
        count: missingMeta,
        message: `${missingMeta} products missing meta tags`,
        action: 'Generate meta titles and descriptions'
      });
    }

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('SEO Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions'
    });
  }
};

/**
 * GET /api/v1/admin/seo/ai-usage
 * Get AI service usage statistics
 */
exports.getAIUsageStats = async (req, res) => {
  try {
    const aiStatus = aiService.checkConfiguration();

    // Calculate usage from history
    const last24Hours = seoContentHistory.filter(h => 
      new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const last7Days = seoContentHistory.filter(h => 
      new Date(h.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const providerUsage = {};
    seoContentHistory.forEach(h => {
      if (h.provider) {
        providerUsage[h.provider] = (providerUsage[h.provider] || 0) + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        serviceStatus: aiStatus,
        usage: {
          total: seoContentHistory.length,
          last24Hours: last24Hours.length,
          last7Days: last7Days.length,
          byProvider: providerUsage
        },
        recentGenerations: seoContentHistory.slice(-5).reverse()
      }
    });
  } catch (error) {
    logger.error('AI Usage Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI usage stats'
    });
  }
};
