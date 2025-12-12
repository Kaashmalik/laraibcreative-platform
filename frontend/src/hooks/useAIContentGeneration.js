/**
 * useAIContentGeneration Hook
 * 
 * React hook for AI-powered product content generation
 * Provides loading states, error handling, and content management
 * 
 * Features:
 * - Generate descriptions, keywords, or complete content
 * - Loading and error states
 * - Rate limit tracking
 * - Draft saving
 * - Content history (for undo)
 * 
 * @module hooks/useAIContentGeneration
 */

import { useState, useCallback, useRef } from 'react';
import aiService from '@/lib/services/aiService';

/**
 * Custom hook for AI content generation
 * 
 * @param {Object} options
 * @param {Function} options.onSuccess - Callback when generation succeeds
 * @param {Function} options.onError - Callback when generation fails
 * @returns {Object} Hook methods and state
 */
export default function useAIContentGeneration({ onSuccess, onError } = {}) {
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfigured, setIsConfigured] = useState(null);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const [usage, setUsage] = useState(null);
  
  // Content history for undo functionality
  const contentHistory = useRef([]);
  
  /**
   * Check if AI service is configured
   */
  const checkConfiguration = useCallback(async () => {
    try {
      const result = await aiService.checkStatus();
      setIsConfigured(result.data?.configured ?? false);
      setRateLimit(result.data?.rateLimit);
      return result.data?.configured ?? false;
    } catch (err) {
      console.error('AI Configuration Check Error:', err);
      setIsConfigured(false);
      return false;
    }
  }, []);

  /**
   * Generate product description only
   * 
   * @param {Object} params - Generation parameters
   */
  const generateDescription = useCallback(async ({ 
    title, 
    category, 
    fabricType, 
    occasion 
  }) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.generateDescription({
        title,
        category,
        fabricType,
        occasion
      });
      
      setGeneratedContent(prev => ({
        ...prev,
        ...result.data
      }));
      setRateLimit(result.rateLimit);
      setUsage(result.usage);
      
      onSuccess?.(result.data, 'description');
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate description';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess, onError]);

  /**
   * Generate SEO keywords only
   * 
   * @param {Object} params - Generation parameters
   */
  const generateKeywords = useCallback(async ({ 
    title, 
    description, 
    category, 
    fabricType 
  }) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.generateKeywords({
        title,
        description,
        category,
        fabricType
      });
      
      setGeneratedContent(prev => ({
        ...prev,
        ...result.data
      }));
      setRateLimit(result.rateLimit);
      setUsage(result.usage);
      
      onSuccess?.(result.data, 'keywords');
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate keywords';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess, onError]);

  /**
   * Generate complete product content (most efficient)
   * 
   * @param {Object} params - Generation parameters
   */
  const generateComplete = useCallback(async ({ 
    title, 
    category, 
    fabricType, 
    occasion 
  }) => {
    setIsGenerating(true);
    setError(null);
    
    // Save current content to history for undo
    if (generatedContent) {
      contentHistory.current.push({ ...generatedContent });
      // Keep only last 5 items
      if (contentHistory.current.length > 5) {
        contentHistory.current.shift();
      }
    }
    
    try {
      const result = await aiService.generateCompleteContent({
        title,
        category,
        fabricType,
        occasion
      });
      
      setGeneratedContent(result.data);
      setRateLimit(result.rateLimit);
      setUsage(result.usage);
      
      onSuccess?.(result.data, 'complete');
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate content';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [generatedContent, onSuccess, onError]);

  /**
   * Undo last generation (restore previous content)
   */
  const undoGeneration = useCallback(() => {
    if (contentHistory.current.length > 0) {
      const previousContent = contentHistory.current.pop();
      setGeneratedContent(previousContent);
      return previousContent;
    }
    return null;
  }, []);

  /**
   * Clear generated content
   */
  const clearContent = useCallback(() => {
    if (generatedContent) {
      contentHistory.current.push({ ...generatedContent });
    }
    setGeneratedContent(null);
    setError(null);
  }, [generatedContent]);

  /**
   * Apply generated content to form data
   * Maps AI-generated content to form structure
   * 
   * @param {Object} currentFormData - Current form data
   * @returns {Object} Updated form data with AI content
   */
  const applyToForm = useCallback((currentFormData) => {
    if (!generatedContent) return currentFormData;
    
    return {
      ...currentFormData,
      description: generatedContent.description || currentFormData.description,
      shortDescription: generatedContent.shortDescription || currentFormData.shortDescription,
      features: generatedContent.features || currentFormData.features,
      whatsIncluded: generatedContent.whatsIncluded || currentFormData.whatsIncluded,
      fabric: {
        ...currentFormData.fabric,
        care: generatedContent.careInstructions || currentFormData.fabric?.care
      },
      seo: {
        ...currentFormData.seo,
        metaTitle: generatedContent.metaTitle || currentFormData.seo?.metaTitle,
        metaDescription: generatedContent.metaDescription || currentFormData.seo?.metaDescription,
        keywords: generatedContent.keywords || currentFormData.seo?.keywords,
        focusKeyword: generatedContent.focusKeyword || currentFormData.seo?.focusKeyword
      }
    };
  }, [generatedContent]);

  /**
   * Save current content as draft
   * 
   * @param {string} productId - Optional product ID for existing products
   * @param {string} title - Product title
   */
  const saveDraft = useCallback(async (productId, title) => {
    if (!generatedContent) {
      throw new Error('No content to save');
    }
    
    try {
      const result = await aiService.saveDraft({
        productId,
        generatedContent,
        title
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to save draft';
      setError(errorMessage);
      throw err;
    }
  }, [generatedContent]);

  /**
   * Check if rate limit allows generation
   */
  const canGenerate = rateLimit ? rateLimit.remaining > 0 : true;

  return {
    // State
    isGenerating,
    isConfigured,
    error,
    generatedContent,
    rateLimit,
    usage,
    canGenerate,
    hasHistory: contentHistory.current.length > 0,
    
    // Methods
    checkConfiguration,
    generateDescription,
    generateKeywords,
    generateComplete,
    undoGeneration,
    clearContent,
    applyToForm,
    saveDraft,
    
    // Utility
    setError,
    setGeneratedContent
  };
}
