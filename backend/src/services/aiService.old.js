/**
 * AI Service for LaraibCreative
 * 
 * Provides AI-powered content generation for products:
 * - Product descriptions
 * - SEO keywords (long-tail)
 * - Meta descriptions
 * - Product features
 * 
 * Uses Google Gemini API (Google AI Studio)
 * 
 * Security Best Practices:
 * - API keys stored in environment variables only
 * - Rate limiting per user/IP
 * - Input sanitization
 * - Response validation
 * 
 * @module services/aiService
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client with secure API key from environment
let geminiClient = null;
let geminiModel = null;

/**
 * Get or create Gemini client instance
 * Uses lazy initialization for better performance
 * 
 * @returns {Object} Gemini model instance
 * @throws {Error} If API key is not configured
 */
const getGeminiModel = () => {
  if (!geminiModel) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    
    geminiClient = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-pro or gemini-1.5-flash-latest for content generation
    // Available models: gemini-pro, gemini-1.5-flash-latest, gemini-1.5-pro-latest
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
    geminiModel = geminiClient.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
  }
  
  return geminiModel;
};

/**
 * LaraibCreative brand context for AI prompts
 * Ensures consistent brand voice and Pakistani fashion focus
 */
const BRAND_CONTEXT = `
You are an expert copywriter for LaraibCreative, a luxury Pakistani fashion e-commerce brand.
Our brand values:
- Premium quality Pakistani traditional and modern fusion wear
- Custom stitching and bespoke tailoring services
- Authentic fabrics: Lawn, Chiffon, Silk, Velvet, Organza, Khaddar
- Occasions: Bridal, Party Wear, Casual, Formal, Eid, Mehndi, Walima
- Target audience: Pakistani women (local and diaspora) who appreciate quality craftsmanship
- Tone: Elegant, sophisticated, warm, and culturally authentic
- Price range: Premium/Luxury segment
`;

/**
 * Sanitize user input to prevent prompt injection
 * 
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>{}[\]]/g, '') // Remove potentially dangerous characters
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim()
    .substring(0, 500); // Limit input length
};

/**
 * Generate product description from title
 * Creates SEO-optimized, brand-consistent product descriptions
 * 
 * @param {Object} params
 * @param {string} params.title - Product title
 * @param {string} params.category - Product category
 * @param {string} params.fabricType - Fabric type (optional)
 * @param {string} params.occasion - Occasion type (optional)
 * @returns {Promise<Object>} Generated content
 */
const generateProductDescription = async ({ title, category, fabricType, occasion }) => {
  const client = getOpenAIClient();
  
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedCategory = sanitizeInput(category);
  const sanitizedFabric = sanitizeInput(fabricType || '');
  const sanitizedOccasion = sanitizeInput(occasion || '');
  
  if (!sanitizedTitle) {
    throw new Error('Product title is required for AI generation');
  }
  
  const prompt = `
${BRAND_CONTEXT}

Generate a compelling product description for:
- Product Title: "${sanitizedTitle}"
- Category: ${sanitizedCategory || 'Pakistani Fashion'}
${sanitizedFabric ? `- Fabric: ${sanitizedFabric}` : ''}
${sanitizedOccasion ? `- Occasion: ${sanitizedOccasion}` : ''}

Requirements:
1. Write a detailed, engaging description (200-300 words)
2. Highlight fabric quality, craftsmanship, and design details
3. Mention suitable occasions and styling suggestions
4. Include care instructions if relevant
5. Use sensory language (feel, texture, flow)
6. Be culturally authentic to Pakistani fashion
7. SEO-friendly with natural keyword integration

Format the response as JSON:
{
  "description": "Main product description here...",
  "shortDescription": "Brief 1-2 sentence summary for cards",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "whatsIncluded": ["Item 1", "Item 2"],
  "careInstructions": "Care instructions here..."
}
`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    // Extract JSON from response (Gemini may include markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      data: {
        description: parsed.description || '',
        shortDescription: parsed.shortDescription || '',
        features: parsed.features || [],
        whatsIncluded: parsed.whatsIncluded || [],
        careInstructions: parsed.careInstructions || ''
      },
      usage: {
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      }
    };
    
  } catch (error) {
    console.error('AI Description Generation Error:', error);
    throw new Error(`Failed to generate description: ${error.message}`);
  }
};

/**
 * Generate SEO keywords (long-tail) from product information
 * 
 * @param {Object} params
 * @param {string} params.title - Product title
 * @param {string} params.description - Product description
 * @param {string} params.category - Product category
 * @param {string} params.fabricType - Fabric type
 * @returns {Promise<Object>} Generated keywords
 */
const generateSEOKeywords = async ({ title, description, category, fabricType }) => {
  const client = getOpenAIClient();
  
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedDescription = sanitizeInput(description);
  const sanitizedCategory = sanitizeInput(category);
  const sanitizedFabric = sanitizeInput(fabricType || '');
  
  if (!sanitizedTitle) {
    throw new Error('Product title is required for keyword generation');
  }
  
  const prompt = `
${BRAND_CONTEXT}

Generate SEO keywords for this Pakistani fashion product:
- Title: "${sanitizedTitle}"
- Category: ${sanitizedCategory || 'Pakistani Fashion'}
${sanitizedFabric ? `- Fabric: ${sanitizedFabric}` : ''}
${sanitizedDescription ? `- Description: ${sanitizedDescription.substring(0, 200)}...` : ''}

Requirements:
1. Generate 10-15 long-tail keywords (3-5 words each)
2. Include buyer intent keywords (e.g., "buy", "online", "Pakistan")
3. Mix of informational and transactional keywords
4. Include occasion-based keywords if relevant
5. Include fabric-specific keywords
6. Target both Pakistani and international diaspora audience
7. Consider common search patterns for Pakistani fashion

Also generate:
- Focus keyword (primary SEO keyword)
- Meta title (under 60 characters)
- Meta description (under 160 characters)

Format as JSON:
{
  "keywords": ["keyword 1", "keyword 2", ...],
  "focusKeyword": "primary keyword phrase",
  "metaTitle": "SEO optimized title",
  "metaDescription": "Compelling meta description with call to action"
}
`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      data: {
        keywords: parsed.keywords || [],
        focusKeyword: parsed.focusKeyword || '',
        metaTitle: parsed.metaTitle || '',
        metaDescription: parsed.metaDescription || ''
      },
      usage: {
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      }
    };
    
  } catch (error) {
    console.error('AI Keyword Generation Error:', error);
    throw new Error(`Failed to generate keywords: ${error.message}`);
  }
};

/**
 * Generate complete product content from title
 * Combines description and SEO keywords in one call for efficiency
 * 
 * @param {Object} params
 * @param {string} params.title - Product title
 * @param {string} params.category - Product category
 * @param {string} params.fabricType - Fabric type
 * @param {string} params.occasion - Occasion type
 * @returns {Promise<Object>} Complete generated content
 */
const generateCompleteProductContent = async ({ title, category, fabricType, occasion }) => {
  const client = getOpenAIClient();
  
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedCategory = sanitizeInput(category);
  const sanitizedFabric = sanitizeInput(fabricType || '');
  const sanitizedOccasion = sanitizeInput(occasion || '');
  
  if (!sanitizedTitle) {
    throw new Error('Product title is required for AI generation');
  }
  
  const prompt = `
${BRAND_CONTEXT}

Generate COMPLETE product content for:
- Product Title: "${sanitizedTitle}"
- Category: ${sanitizedCategory || 'Pakistani Fashion'}
${sanitizedFabric ? `- Fabric: ${sanitizedFabric}` : ''}
${sanitizedOccasion ? `- Occasion: ${sanitizedOccasion}` : ''}

Generate ALL of the following in one comprehensive response:

1. DESCRIPTION (200-300 words):
   - Detailed, engaging product description
   - Highlight fabric quality, craftsmanship, design
   - Suitable occasions and styling suggestions
   - Sensory language, culturally authentic

2. SHORT DESCRIPTION (1-2 sentences):
   - Brief summary for product cards

3. FEATURES (5 bullet points):
   - Key product features and benefits

4. WHAT'S INCLUDED (list items):
   - What customer receives

5. SEO KEYWORDS (10-15 long-tail keywords):
   - 3-5 words each
   - Mix of informational and transactional
   - Pakistani fashion focused

6. SEO META:
   - Focus keyword (primary)
   - Meta title (under 60 chars)
   - Meta description (under 160 chars)

7. FABRIC CARE:
   - Care instructions

Format as JSON:
{
  "description": "...",
  "shortDescription": "...",
  "features": ["...", "...", "...", "...", "..."],
  "whatsIncluded": ["...", "..."],
  "keywords": ["...", "...", "..."],
  "focusKeyword": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "careInstructions": "..."
}
`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      data: {
        description: parsed.description || '',
        shortDescription: parsed.shortDescription || '',
        features: parsed.features || [],
        whatsIncluded: parsed.whatsIncluded || [],
        keywords: parsed.keywords || [],
        focusKeyword: parsed.focusKeyword || '',
        metaTitle: parsed.metaTitle || '',
        metaDescription: parsed.metaDescription || '',
        careInstructions: parsed.careInstructions || ''
      },
      usage: {
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      },
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('AI Complete Content Generation Error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

/**
 * Check if AI service is properly configured
 * 
 * @returns {Object} Configuration status
 */
const checkConfiguration = () => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  return {
    configured: hasApiKey,
    model: model,
    provider: 'Google Gemini',
    message: hasApiKey 
      ? 'AI service is properly configured (Google Gemini)' 
      : 'GEMINI_API_KEY environment variable is missing'
  };
};

module.exports = {
  generateProductDescription,
  generateSEOKeywords,
  generateCompleteProductContent,
  checkConfiguration,
  sanitizeInput,
  BRAND_CONTEXT
};
