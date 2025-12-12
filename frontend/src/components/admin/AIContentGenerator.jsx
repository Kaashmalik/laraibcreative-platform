'use client';

/**
 * AI Content Generator Component
 * 
 * Provides AI-powered content generation UI for product management
 * 
 * Features:
 * - Generate complete content from title
 * - Preview generated content before applying
 * - Apply individual sections or all at once
 * - Rate limit display
 * - Loading states and error handling
 * 
 * @module components/admin/AIContentGenerator
 */

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Undo2,
  AlertCircle,
  Zap,
  FileText,
  Tags,
  Search
} from 'lucide-react';
import Button from '@/components/ui/Button';
import useAIContentGeneration from '@/hooks/useAIContentGeneration';

/**
 * AI Content Generator Component
 * 
 * @param {Object} props
 * @param {string} props.title - Current product title
 * @param {string} props.category - Current category
 * @param {string} props.fabricType - Current fabric type
 * @param {string} props.occasion - Current occasion
 * @param {Function} props.onApplyContent - Callback when content is applied
 * @param {Function} props.onApplyField - Callback when single field is applied
 * @param {Object} props.currentContent - Current form content for comparison
 */
export default function AIContentGenerator({
  title,
  category,
  fabricType,
  occasion,
  onApplyContent,
  onApplyField,
  currentContent = {}
}) {
  // UI State
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewSection, setPreviewSection] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Hook
  const {
    isGenerating,
    isConfigured,
    error,
    generatedContent,
    rateLimit,
    usage,
    canGenerate,
    hasHistory,
    checkConfiguration,
    generateComplete,
    generateDescription,
    generateKeywords,
    undoGeneration,
    clearContent,
    setError
  } = useAIContentGeneration({
    onSuccess: (data, type) => {
      setShowPreview(true);
    },
    onError: (errorMsg) => {
      console.error('AI Generation Error:', errorMsg);
    }
  });
  
  // Don't check configuration on mount to prevent timeouts
  // Only check when user tries to generate content
  // useEffect(() => {
  //   checkConfiguration();
  // }, [checkConfiguration]);
  
  /**
   * Handle generate complete content
   */
  const handleGenerateComplete = async () => {
    if (!title || title.trim().length < 3) {
      setError('Please enter a product title (minimum 3 characters)');
      return;
    }
    
    try {
      await generateComplete({
        title,
        category,
        fabricType,
        occasion
      });
    } catch (err) {
      // Error already handled in hook
    }
  };
  
  /**
   * Handle generate description only
   */
  const handleGenerateDescription = async () => {
    if (!title || title.trim().length < 3) {
      setError('Please enter a product title (minimum 3 characters)');
      return;
    }
    
    try {
      await generateDescription({
        title,
        category,
        fabricType,
        occasion
      });
    } catch (err) {
      // Error already handled in hook
    }
  };
  
  /**
   * Handle generate keywords only
   */
  const handleGenerateKeywords = async () => {
    if (!title || title.trim().length < 3) {
      setError('Please enter a product title (minimum 3 characters)');
      return;
    }
    
    try {
      await generateKeywords({
        title,
        description: currentContent.description,
        category,
        fabricType
      });
    } catch (err) {
      // Error already handled in hook
    }
  };
  
  /**
   * Apply all generated content
   */
  const handleApplyAll = () => {
    if (generatedContent && onApplyContent) {
      onApplyContent(generatedContent);
      setShowPreview(false);
    }
  };
  
  /**
   * Apply specific field
   */
  const handleApplyField = (fieldName, value) => {
    if (onApplyField) {
      onApplyField(fieldName, value);
    }
  };
  
  /**
   * Copy content to clipboard
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Show loading state while checking configuration
  // Don't block the UI even if configuration check fails - let user try to generate
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-purple-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                AI Content Generator
                <span className="text-xs font-normal px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                  Beta
                </span>
              </h3>
              <p className="text-sm text-gray-600">
                Auto-generate descriptions, keywords & SEO content
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Rate Limit Indicator */}
            {rateLimit && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Zap size={14} className="text-yellow-500" />
                {rateLimit.remaining}/{rateLimit.limit || 10} remaining
              </div>
            )}
            
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-purple-200 p-4 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto hover:text-red-900"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          {/* Generation Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerateComplete}
              disabled={isGenerating || !canGenerate || !title}
              loading={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              icon={<Wand2 size={16} />}
            >
              Generate All Content
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !canGenerate || !title}
              icon={<FileText size={16} />}
            >
              Description Only
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              onClick={handleGenerateKeywords}
              disabled={isGenerating || !canGenerate || !title}
              icon={<Tags size={16} />}
            >
              Keywords Only
            </Button>
            
            {hasHistory && (
              <Button
                type="button"
                variant="ghost"
                onClick={undoGeneration}
                disabled={isGenerating}
                icon={<Undo2 size={16} />}
              >
                Undo
              </Button>
            )}
          </div>
          
          {/* Title Requirement Notice */}
          {(!title || title.trim().length < 3) && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              💡 Enter a product title first to enable AI generation
            </p>
          )}
          
          {/* Generated Content Preview */}
          {showPreview && generatedContent && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Generated Content Preview
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyAll}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Apply All
                  </Button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {/* Description */}
                {generatedContent.description && (
                  <PreviewSection
                    title="Description"
                    icon={<FileText size={14} />}
                    content={generatedContent.description}
                    onApply={() => handleApplyField('description', generatedContent.description)}
                    onCopy={() => copyToClipboard(generatedContent.description)}
                  />
                )}
                
                {/* Short Description */}
                {generatedContent.shortDescription && (
                  <PreviewSection
                    title="Short Description"
                    icon={<FileText size={14} />}
                    content={generatedContent.shortDescription}
                    onApply={() => handleApplyField('shortDescription', generatedContent.shortDescription)}
                    onCopy={() => copyToClipboard(generatedContent.shortDescription)}
                  />
                )}
                
                {/* Features */}
                {generatedContent.features?.length > 0 && (
                  <PreviewSection
                    title="Features"
                    icon={<Check size={14} />}
                    onApply={() => handleApplyField('features', generatedContent.features)}
                  >
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {generatedContent.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </PreviewSection>
                )}
                
                {/* Keywords */}
                {generatedContent.keywords?.length > 0 && (
                  <PreviewSection
                    title="SEO Keywords"
                    icon={<Tags size={14} />}
                    onApply={() => handleApplyField('seo.keywords', generatedContent.keywords)}
                  >
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </PreviewSection>
                )}
                
                {/* Focus Keyword */}
                {generatedContent.focusKeyword && (
                  <PreviewSection
                    title="Focus Keyword"
                    icon={<Search size={14} />}
                    content={generatedContent.focusKeyword}
                    onApply={() => handleApplyField('seo.focusKeyword', generatedContent.focusKeyword)}
                    onCopy={() => copyToClipboard(generatedContent.focusKeyword)}
                  />
                )}
                
                {/* Meta Title */}
                {generatedContent.metaTitle && (
                  <PreviewSection
                    title="Meta Title"
                    icon={<FileText size={14} />}
                    content={generatedContent.metaTitle}
                    onApply={() => handleApplyField('seo.metaTitle', generatedContent.metaTitle)}
                    onCopy={() => copyToClipboard(generatedContent.metaTitle)}
                    charCount={generatedContent.metaTitle.length}
                    maxChars={60}
                  />
                )}
                
                {/* Meta Description */}
                {generatedContent.metaDescription && (
                  <PreviewSection
                    title="Meta Description"
                    icon={<FileText size={14} />}
                    content={generatedContent.metaDescription}
                    onApply={() => handleApplyField('seo.metaDescription', generatedContent.metaDescription)}
                    onCopy={() => copyToClipboard(generatedContent.metaDescription)}
                    charCount={generatedContent.metaDescription.length}
                    maxChars={160}
                  />
                )}
                
                {/* Care Instructions */}
                {generatedContent.careInstructions && (
                  <PreviewSection
                    title="Care Instructions"
                    icon={<FileText size={14} />}
                    content={generatedContent.careInstructions}
                    onApply={() => handleApplyField('fabric.care', generatedContent.careInstructions)}
                    onCopy={() => copyToClipboard(generatedContent.careInstructions)}
                  />
                )}
              </div>
              
              {/* Token Usage */}
              {usage && (
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-500">
                  Tokens used: {usage.totalTokens} (prompt: {usage.promptTokens}, completion: {usage.completionTokens})
                </div>
              )}
            </div>
          )}
          
          {/* Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-0.5">
              <li>Add category and fabric type for more accurate content</li>
              <li>Review and edit generated content before publishing</li>
              <li>Generated content is saved as draft until you publish</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Preview Section Component
 */
function PreviewSection({ 
  title, 
  icon, 
  content, 
  children, 
  onApply, 
  onCopy,
  charCount,
  maxChars 
}) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {icon}
          {title}
          {charCount !== undefined && (
            <span className={`text-xs ml-2 ${charCount > maxChars ? 'text-red-500' : 'text-gray-400'}`}>
              ({charCount}/{maxChars})
            </span>
          )}
        </h5>
        <div className="flex items-center gap-1">
          {onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <Copy size={14} />
            </button>
          )}
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="p-1 hover:bg-green-100 rounded text-green-600 hover:text-green-700"
              title="Apply this content"
            >
              <Check size={14} />
            </button>
          )}
        </div>
      </div>
      {content ? (
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
      ) : (
        children
      )}
    </div>
  );
}
