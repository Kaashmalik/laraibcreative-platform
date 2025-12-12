/**
 * AI Service for LaraibCreative
 * 
 * Multi-Provider AI with Automatic Fallback:
 * 1. Groq (Fast, Free) - Primary
 * 2. Google Gemini - Fallback
 * 
 * Features:
 * - Circuit breaker pattern for resilience
 * - Retry with exponential backoff
 * - Automatic provider failover
 * 
 * @module services/aiService
 */

const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiServiceBreaker } = require('../utils/circuitBreaker');
const logger = require('../utils/logger');

// Provider instances (lazy initialized)
let groqClient = null;
let geminiClient = null;

/**
 * Get active AI provider
 * Priority: Groq > Gemini
 */
const getActiveProvider = () => {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return null;
};

/**
 * Initialize Groq client
 */
const getGroqClient = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

/**
 * Initialize Gemini client
 */
const getGeminiModel = () => {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiClient = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
  }
  return geminiClient;
};

/**
 * LaraibCreative brand context for AI prompts
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
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>{}[\]]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 500);
};

/**
 * Generate content using Groq
 */
const generateWithGroq = async (prompt) => {
  const client = getGroqClient();
  if (!client) throw new Error('Groq client not available');
  
  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: BRAND_CONTEXT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  
  return response.choices[0]?.message?.content || '';
};

/**
 * Generate content using Gemini
 */
const generateWithGemini = async (prompt) => {
  const model = getGeminiModel();
  if (!model) throw new Error('Gemini model not available');
  
  const fullPrompt = `${BRAND_CONTEXT}\n\n${prompt}`;
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
};

/**
 * Sleep helper for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry helper with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // Check if error is retryable (rate limit, timeout, server error)
      const isRetryable = error.message?.includes('rate') || 
                          error.message?.includes('timeout') ||
                          error.message?.includes('503') ||
                          error.message?.includes('429');
      
      if (!isRetryable && attempt > 0) {
        throw error; // Don't retry non-retryable errors
      }
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`⏳ Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

/**
 * Generate content with automatic fallback, retry logic, and circuit breaker
 */
const generateContent = async (prompt) => {
  const errors = [];
  
  // Check circuit breaker status first
  const breakerStatus = aiServiceBreaker.getStatus();
  if (breakerStatus.state === 'OPEN') {
    logger.warn('AI service circuit breaker is OPEN, using fallback strategy');
  }
  
  // Wrap generation in circuit breaker
  const generateWithCircuitBreaker = async () => {
    return aiServiceBreaker.execute(async () => {
      // Try Groq first (faster and free) with retry
      if (process.env.GROQ_API_KEY) {
        try {
          logger.info('🤖 Trying Groq AI...');
          const result = await retryWithBackoff(() => generateWithGroq(prompt), 2, 500);
          return { content: result, provider: 'groq' };
        } catch (error) {
          errors.push({ provider: 'groq', error: error.message });
          logger.warn('Groq failed, trying Gemini:', error.message);
        }
      }
      
      // Fallback to Gemini
      if (process.env.GEMINI_API_KEY) {
        logger.info('🤖 Trying Gemini AI...');
        const result = await retryWithBackoff(() => generateWithGemini(prompt), 2, 500);
        return { content: result, provider: 'gemini' };
      }
      
      throw new Error('No AI provider available');
    });
  };
  
  try {
    return await generateWithCircuitBreaker();
  } catch (error) {
    // If circuit breaker rejected, try direct call as last resort
    if (error.isCircuitBreakerError) {
      logger.warn('Circuit breaker rejected, attempting direct call...');
    }
    
    // Fallback without circuit breaker for emergency
    errors.push({ provider: 'circuit-breaker', error: error.message });
  }
  
  // Try Groq first (faster and free) with retry (emergency fallback)
  if (process.env.GROQ_API_KEY) {
    try {
      logger.info('🤖 Trying Groq AI (emergency fallback)...');
      const result = await retryWithBackoff(
        () => generateWithGroq(prompt),
        2, // Max 2 retries for Groq
        500 // Start with 500ms delay
      );
      console.log('✅ Groq AI: Success');
      return { content: result, provider: 'groq' };
    } catch (error) {
      console.log('⚠️ Groq failed after retries:', error.message);
      errors.push({ provider: 'groq', error: error.message });
    }
  }
  
  // Fallback to Gemini with retry
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🤖 Trying Gemini AI...');
      const result = await retryWithBackoff(
        () => generateWithGemini(prompt),
        2, // Max 2 retries for Gemini
        500
      );
      console.log('✅ Gemini AI: Success');
      return { content: result, provider: 'gemini' };
    } catch (error) {
      console.log('⚠️ Gemini failed after retries:', error.message);
      errors.push({ provider: 'gemini', error: error.message });
    }
  }
  
  // All providers failed
  const errorMessage = errors.length > 0 
    ? `AI generation failed: ${errors.map(e => `${e.provider}: ${e.error}`).join('; ')}`
    : 'No AI provider configured. Please add GROQ_API_KEY or GEMINI_API_KEY to environment.';
  throw new Error(errorMessage);
};

/**
 * Parse JSON from AI response
 */
const parseJsonResponse = (text) => {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch {
    // Extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Continue to next attempt
      }
    }
    
    // Try to find JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Continue
      }
    }
    
    return null;
  }
};

/**
 * Generate product description
 */
const generateProductDescription = async ({ title, category, fabricType, occasion, priceRange }) => {
  const safeTitle = sanitizeInput(title);
  const safeCategory = sanitizeInput(category || '');
  const safeFabric = sanitizeInput(fabricType || '');
  const safeOccasion = sanitizeInput(occasion || '');
  
  const prompt = `Generate a compelling product description for this Pakistani fashion item:

Title: ${safeTitle}
Category: ${safeCategory || 'Not specified'}
Fabric: ${safeFabric || 'Not specified'}
Occasion: ${safeOccasion || 'Not specified'}
Price Range: ${priceRange || 'Premium'}

Return ONLY a JSON object (no markdown, no code blocks):
{
  "shortDescription": "2-3 sentence teaser (max 150 chars)",
  "fullDescription": "Detailed 150-200 word description with fabric, craftsmanship, styling tips",
  "features": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "careInstructions": "Brief care tips"
}`;

  try {
    const { content, provider } = await generateContent(prompt);
    const parsed = parseJsonResponse(content);
    
    if (!parsed) {
      // Fallback: use raw content
      return {
        data: {
          description: content,
          shortDescription: content.substring(0, 150),
          fullDescription: content,
          features: [],
          careInstructions: ''
        },
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        provider
      };
    }
    
    return {
      data: {
        description: parsed.fullDescription || content,
        shortDescription: parsed.shortDescription || '',
        fullDescription: parsed.fullDescription || content,
        features: parsed.features || [],
        careInstructions: parsed.careInstructions || ''
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      provider
    };
  } catch (error) {
    console.error('AI Description Generation Error:', error.message);
    throw error;
  }
};

/**
 * Generate SEO keywords
 */
const generateSEOKeywords = async ({ title, category, fabricType, occasion }) => {
  const safeTitle = sanitizeInput(title);
  
  const prompt = `Generate SEO keywords for this Pakistani fashion product:

Title: ${safeTitle}
Category: ${category || 'Fashion'}
Fabric: ${fabricType || 'Not specified'}
Occasion: ${occasion || 'Not specified'}

Return ONLY a JSON object (no markdown):
{
  "primaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2", "long tail phrase 3", "long tail phrase 4", "long tail phrase 5"],
  "metaTitle": "SEO optimized title (max 60 chars)",
  "metaDescription": "SEO meta description (max 155 chars)"
}`;

  try {
    const { content, provider } = await generateContent(prompt);
    const parsed = parseJsonResponse(content);
    
    const keywords = parsed?.longTailKeywords || parsed?.primaryKeywords || [safeTitle];
    
    return {
      data: {
        keywords: keywords,
        primaryKeywords: parsed?.primaryKeywords || [safeTitle],
        longTailKeywords: parsed?.longTailKeywords || [],
        focusKeyword: keywords[0] || safeTitle,
        metaTitle: parsed?.metaTitle || safeTitle.substring(0, 60),
        metaDescription: parsed?.metaDescription || ''
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      provider
    };
  } catch (error) {
    console.error('AI Keywords Generation Error:', error.message);
    throw error;
  }
};

/**
 * Generate complete product content
 */
const generateCompleteProductContent = async (productData) => {
  try {
    const [descriptionResult, seoResult] = await Promise.all([
      generateProductDescription(productData),
      generateSEOKeywords(productData)
    ]);
    
    // Merge both results into a single data object
    return {
      data: {
        // From description
        description: descriptionResult.data?.description || descriptionResult.data?.fullDescription || '',
        shortDescription: descriptionResult.data?.shortDescription || '',
        fullDescription: descriptionResult.data?.fullDescription || '',
        features: descriptionResult.data?.features || [],
        careInstructions: descriptionResult.data?.careInstructions || '',
        whatsIncluded: [],
        // From SEO
        keywords: seoResult.data?.keywords || [],
        primaryKeywords: seoResult.data?.primaryKeywords || [],
        longTailKeywords: seoResult.data?.longTailKeywords || [],
        focusKeyword: seoResult.data?.focusKeyword || '',
        metaTitle: seoResult.data?.metaTitle || '',
        metaDescription: seoResult.data?.metaDescription || ''
      },
      usage: {
        promptTokens: (descriptionResult.usage?.promptTokens || 0) + (seoResult.usage?.promptTokens || 0),
        completionTokens: (descriptionResult.usage?.completionTokens || 0) + (seoResult.usage?.completionTokens || 0),
        totalTokens: (descriptionResult.usage?.totalTokens || 0) + (seoResult.usage?.totalTokens || 0)
      },
      provider: descriptionResult.provider || seoResult.provider,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI Complete Content Generation Error:', error.message);
    throw error;
  }
};

/**
 * Check AI configuration status
 */
const checkConfiguration = () => {
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const activeProvider = getActiveProvider();
  
  return {
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
      : 'No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env'
  };
};

/**
 * Generate content with automatic fallback and timeout
 */
const generateContentWithTimeout = async (prompt, timeout = 10000) => {
  return Promise.race([
    generateContent(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timeout')), timeout)
    )
  ]);
};

/**
 * Test AI connection
 */
const testConnection = async () => {
  try {
    const { content, provider } = await generateContent('Say "Hello" in one word.');
    return {
      success: true,
      provider,
      response: content.trim().substring(0, 50)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateProductDescription,
  generateSEOKeywords,
  generateCompleteProductContent,
  checkConfiguration,
  testConnection,
  getActiveProvider
};
