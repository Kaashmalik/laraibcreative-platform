# Assignment 4: AI-Generated Meta Tags & SEO Integration for E-Commerce

## Overview
This assignment demonstrates the integration of AI-generated meta tags and descriptions into product pages while adhering to technical SEO best practices for e-commerce websites.

## Technical SEO Considerations

### 1. Meta Tag Requirements
- **Title Tag**: 50-60 characters, include primary keyword
- **Meta Description**: 150-160 characters, compelling call-to-action
- **Open Graph Tags**: For social media sharing
- **Twitter Cards**: For Twitter/X sharing
- **Canonical URLs**: Prevent duplicate content issues
- **Structured Data**: JSON-LD for rich snippets

### 2. SEO Best Practices for AI Content
- Ensure uniqueness across all product pages
- Include relevant keywords naturally
- Avoid keyword stuffing
- Maintain brand consistency
- Optimize for user intent

---

## Screenshots

### Product Page with AI Meta Tags
![Product SEO Meta Tags](./screenshots/assignment4-meta-tags.png)

### SEO Analysis Dashboard
![SEO Analysis](./screenshots/assignment4-seo-analysis.png)

---

## Code Implementation

### 1. Frontend - Product Page with Dynamic SEO (`frontend/src/app/(customer)/products/[slug]/page.jsx`)

```jsx
import { Metadata } from 'next';
import api from '@/lib/api';
import ProductDetail from '@/components/customer/ProductDetail';

// Generate dynamic metadata using AI-enhanced content
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${slug}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    const { data: product } = await response.json();

    if (!product) {
      return {
        title: 'Product Not Found | Laraib Creative',
        description: 'The requested product could not be found.',
      };
    }

    // Use AI-generated SEO content or fallback to defaults
    const seoData = product.seo || {};
    
    return {
      // Primary Meta Tags
      title: seoData.metaTitle || `${product.name} | Laraib Creative`,
      description: seoData.metaDescription || product.description?.substring(0, 160),
      
      // Keywords (still useful for internal search)
      keywords: seoData.keywords || [product.category, product.name, 'fashion', 'clothing'].join(', '),
      
      // Canonical URL - Prevent duplicate content
      alternates: {
        canonical: `https://laraibcreative.com/products/${slug}`,
      },
      
      // Open Graph - Facebook, LinkedIn, etc.
      openGraph: {
        title: seoData.ogTitle || product.name,
        description: seoData.ogDescription || product.description?.substring(0, 200),
        url: `https://laraibcreative.com/products/${slug}`,
        siteName: 'Laraib Creative',
        images: [
          {
            url: product.images?.[0]?.url || '/default-product.jpg',
            width: 1200,
            height: 630,
            alt: seoData.imageAlt || product.name,
          },
        ],
        locale: 'en_US',
        type: 'product',
      },
      
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: seoData.twitterTitle || product.name,
        description: seoData.twitterDescription || product.description?.substring(0, 200),
        images: [product.images?.[0]?.url || '/default-product.jpg'],
      },
      
      // Robots directives
      robots: {
        index: product.isActive !== false,
        follow: true,
        googleBot: {
          index: product.isActive !== false,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      
      // Additional meta tags
      other: {
        'product:price:amount': product.salePrice || product.price,
        'product:price:currency': 'PKR',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:brand': 'Laraib Creative',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Shop Products | Laraib Creative',
      description: 'Discover our exclusive collection of fashion products.',
    };
  }
}

// JSON-LD Structured Data Component
function ProductStructuredData({ product }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.metaDescription || product.description,
    image: product.images?.map(img => img.url) || [],
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Laraib Creative',
    },
    offers: {
      '@type': 'Offer',
      url: `https://laraibcreative.com/products/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.salePrice || product.price,
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Laraib Creative',
      },
    },
    aggregateRating: product.ratings?.count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.ratings.average,
      reviewCount: product.ratings.count,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Breadcrumb Structured Data
function BreadcrumbStructuredData({ product }) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://laraibcreative.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://laraibcreative.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `https://laraibcreative.com/products?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://laraibcreative.com/products/${product.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
}

export default async function ProductPage({ params }) {
  const { slug } = params;
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${slug}`,
    { next: { revalidate: 3600 } }
  );
  const { data: product } = await response.json();

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <ProductStructuredData product={product} />
      <BreadcrumbStructuredData product={product} />
      
      {/* Product Detail Component */}
      <ProductDetail product={product} />
    </>
  );
}
```

### 2. Backend - AI SEO Generation Controller (`backend/src/controllers/seoController.js`)

```javascript
const OpenAI = require('openai');
const Product = require('../models/Product');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate SEO meta tags for a product using AI
 * @route POST /api/v1/seo/generate/:productId
 */
const generateProductSEO = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const prompt = `Generate SEO-optimized meta tags for this e-commerce product:

Product Name: ${product.name}
Category: ${product.category}
Original Description: ${product.description}
Price: PKR ${product.salePrice || product.price}
Features: ${product.features?.join(', ') || 'N/A'}

Generate the following with strict character limits:
1. Meta Title (50-60 chars) - Include primary keyword, brand name
2. Meta Description (150-160 chars) - Compelling, include CTA
3. OG Title (60-90 chars) - Engaging for social sharing
4. OG Description (200 chars max) - Detailed, shareable
5. Twitter Title (55-70 chars) - Concise, engaging
6. Twitter Description (125-200 chars) - With hashtag suggestions
7. Image Alt Text (100-125 chars) - Descriptive, accessible
8. 5-7 SEO Keywords - Comma separated, relevant terms
9. Focus Keyphrase - Primary keyword phrase for this product

Return as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "twitterTitle": "...",
  "twitterDescription": "...",
  "imageAlt": "...",
  "keywords": "...",
  "focusKeyphrase": "..."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert SEO specialist for e-commerce. Generate meta tags that:
- Are unique and avoid duplicate content
- Include relevant keywords naturally
- Have compelling calls-to-action
- Are optimized for both search engines and users
- Follow Google's best practices
- Consider Pakistani fashion market context`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const seoContent = JSON.parse(completion.choices[0].message.content);

    // Validate character limits
    const validatedSEO = validateSEOLimits(seoContent);

    res.status(200).json({
      success: true,
      message: 'SEO meta tags generated successfully',
      data: validatedSEO,
    });
  } catch (error) {
    console.error('SEO Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate SEO content',
      error: error.message,
    });
  }
};

/**
 * Apply AI-generated SEO to a product
 * @route PUT /api/v1/seo/apply/:productId
 */
const applyProductSEO = async (req, res) => {
  try {
    const { productId } = req.params;
    const seoData = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { seo: seoData },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'SEO data applied successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply SEO data',
      error: error.message,
    });
  }
};

/**
 * Bulk generate SEO for multiple products
 * @route POST /api/v1/seo/bulk-generate
 */
const bulkGenerateSEO = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    const results = [];
    
    for (const productId of productIds) {
      try {
        const product = await Product.findById(productId);
        if (product) {
          // Generate SEO for each product
          const seoContent = await generateSEOForProduct(product);
          
          // Apply to product
          product.seo = seoContent;
          await product.save();
          
          results.push({
            productId,
            status: 'success',
            seo: seoContent,
          });
        }
      } catch (err) {
        results.push({
          productId,
          status: 'error',
          error: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk SEO generation completed',
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk SEO generation failed',
      error: error.message,
    });
  }
};

/**
 * Analyze existing SEO and provide recommendations
 * @route GET /api/v1/seo/analyze/:productId
 */
const analyzeSEO = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const analysis = {
      score: 0,
      issues: [],
      recommendations: [],
    };

    const seo = product.seo || {};

    // Title analysis
    if (!seo.metaTitle) {
      analysis.issues.push('Missing meta title');
      analysis.recommendations.push('Add a unique meta title (50-60 characters)');
    } else if (seo.metaTitle.length < 30 || seo.metaTitle.length > 60) {
      analysis.issues.push(`Meta title length: ${seo.metaTitle.length} chars (optimal: 50-60)`);
    } else {
      analysis.score += 20;
    }

    // Description analysis
    if (!seo.metaDescription) {
      analysis.issues.push('Missing meta description');
      analysis.recommendations.push('Add a compelling meta description (150-160 characters)');
    } else if (seo.metaDescription.length < 120 || seo.metaDescription.length > 160) {
      analysis.issues.push(`Meta description length: ${seo.metaDescription.length} chars (optimal: 150-160)`);
    } else {
      analysis.score += 20;
    }

    // OG tags analysis
    if (!seo.ogTitle || !seo.ogDescription) {
      analysis.issues.push('Missing Open Graph tags');
      analysis.recommendations.push('Add OG tags for better social sharing');
    } else {
      analysis.score += 20;
    }

    // Keywords analysis
    if (!seo.keywords) {
      analysis.issues.push('Missing SEO keywords');
      analysis.recommendations.push('Add relevant keywords for better indexing');
    } else {
      analysis.score += 20;
    }

    // Image alt analysis
    if (!seo.imageAlt) {
      analysis.issues.push('Missing image alt text');
      analysis.recommendations.push('Add descriptive alt text for accessibility and SEO');
    } else {
      analysis.score += 20;
    }

    res.status(200).json({
      success: true,
      data: {
        ...analysis,
        currentSEO: seo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SEO analysis failed',
      error: error.message,
    });
  }
};

// Helper function to validate SEO character limits
function validateSEOLimits(seo) {
  return {
    metaTitle: truncate(seo.metaTitle, 60),
    metaDescription: truncate(seo.metaDescription, 160),
    ogTitle: truncate(seo.ogTitle, 90),
    ogDescription: truncate(seo.ogDescription, 200),
    twitterTitle: truncate(seo.twitterTitle, 70),
    twitterDescription: truncate(seo.twitterDescription, 200),
    imageAlt: truncate(seo.imageAlt, 125),
    keywords: seo.keywords,
    focusKeyphrase: seo.focusKeyphrase,
  };
}

function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Helper function for bulk generation
async function generateSEOForProduct(product) {
  // Simplified template-based generation for bulk operations
  return {
    metaTitle: `${product.name} | Buy Online - Laraib Creative`.substring(0, 60),
    metaDescription: `Shop ${product.name} at best prices. ${product.description?.substring(0, 80)}... Free delivery available!`.substring(0, 160),
    ogTitle: product.name,
    ogDescription: product.description?.substring(0, 200) || '',
    twitterTitle: product.name,
    twitterDescription: `Check out ${product.name} on Laraib Creative! #Fashion #Shopping`,
    imageAlt: `${product.name} - ${product.category} by Laraib Creative`,
    keywords: `${product.name}, ${product.category}, fashion, clothing, laraib creative`,
    focusKeyphrase: product.name.toLowerCase(),
  };
}

module.exports = {
  generateProductSEO,
  applyProductSEO,
  bulkGenerateSEO,
  analyzeSEO,
};
```

### 3. Backend - Product Model with SEO Schema (`backend/src/models/Product.js`)

```javascript
const mongoose = require('mongoose');

// SEO Sub-schema for products
const seoSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    maxlength: 60,
    trim: true,
  },
  metaDescription: {
    type: String,
    maxlength: 160,
    trim: true,
  },
  ogTitle: {
    type: String,
    maxlength: 90,
    trim: true,
  },
  ogDescription: {
    type: String,
    maxlength: 200,
    trim: true,
  },
  twitterTitle: {
    type: String,
    maxlength: 70,
    trim: true,
  },
  twitterDescription: {
    type: String,
    maxlength: 200,
    trim: true,
  },
  imageAlt: {
    type: String,
    maxlength: 125,
    trim: true,
  },
  keywords: {
    type: String,
    trim: true,
  },
  focusKeyphrase: {
    type: String,
    trim: true,
  },
  lastGenerated: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: Number,
  category: {
    type: String,
    required: true,
  },
  images: [{
    url: String,
    alt: String,
  }],
  stock: {
    type: Number,
    default: 0,
  },
  sku: String,
  features: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  // AI-Generated SEO Data
  seo: seoSchema,
}, {
  timestamps: true,
});

// Index for SEO optimization
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'seo.focusKeyphrase': 'text', name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
```

### 4. Backend - SEO Routes (`backend/src/routes/seo.routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const {
  generateProductSEO,
  applyProductSEO,
  bulkGenerateSEO,
  analyzeSEO,
} = require('../controllers/seoController');

// Generate SEO for a single product
router.post('/generate/:productId', protect, admin, generateProductSEO);

// Apply generated SEO to product
router.put('/apply/:productId', protect, admin, applyProductSEO);

// Bulk generate SEO for multiple products
router.post('/bulk-generate', protect, admin, bulkGenerateSEO);

// Analyze existing SEO
router.get('/analyze/:productId', protect, admin, analyzeSEO);

module.exports = router;
```

### 5. Frontend - Admin SEO Management Component (`frontend/src/components/admin/ProductSEOManager.jsx`)

```jsx
'use client';

import { useState } from 'react';
import { Search, Sparkles, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductSEOManager({ product, onUpdate }) {
  const [seoData, setSeoData] = useState(product.seo || {});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const generateSEO = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/seo/generate/${product._id}`);
      if (response.data.success) {
        setSeoData(response.data.data);
        toast.success('SEO content generated!');
      }
    } catch (error) {
      toast.error('Failed to generate SEO content');
    } finally {
      setIsGenerating(false);
    }
  };

  const applySEO = async () => {
    try {
      const response = await api.put(`/seo/apply/${product._id}`, seoData);
      if (response.data.success) {
        toast.success('SEO data saved!');
        onUpdate?.(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to save SEO data');
    }
  };

  const analyzeSEO = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.get(`/seo/analyze/${product._id}`);
      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to analyze SEO');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          SEO Settings
        </h2>
        <div className="flex gap-2">
          <button
            onClick={analyzeSEO}
            disabled={isAnalyzing}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Analyze
          </button>
          <button
            onClick={generateSEO}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate with AI
          </button>
        </div>
      </div>

      {/* SEO Score */}
      {analysis && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </div>
            <div>
              <p className="font-medium">SEO Score</p>
              <p className="text-sm text-gray-500">
                {analysis.issues.length} issues found
              </p>
            </div>
          </div>
          
          {analysis.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Issues:</p>
              <ul className="text-sm text-red-600 space-y-1">
                {analysis.issues.map((issue, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meta Title
          <span className="text-gray-400 ml-2">
            ({seoData.metaTitle?.length || 0}/60 chars)
          </span>
        </label>
        <input
          type="text"
          value={seoData.metaTitle || ''}
          onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
          maxLength={60}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="Product title for search engines"
        />
        <div className="mt-1 h-1 bg-gray-200 rounded">
          <div
            className={`h-1 rounded ${
              (seoData.metaTitle?.length || 0) > 60 ? 'bg-red-500' :
              (seoData.metaTitle?.length || 0) > 50 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min((seoData.metaTitle?.length || 0) / 60 * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meta Description
          <span className="text-gray-400 ml-2">
            ({seoData.metaDescription?.length || 0}/160 chars)
          </span>
        </label>
        <textarea
          value={seoData.metaDescription || ''}
          onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
          maxLength={160}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          placeholder="Compelling description for search results"
        />
        <div className="mt-1 h-1 bg-gray-200 rounded">
          <div
            className={`h-1 rounded ${
              (seoData.metaDescription?.length || 0) > 160 ? 'bg-red-500' :
              (seoData.metaDescription?.length || 0) > 150 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min((seoData.metaDescription?.length || 0) / 160 * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SEO Keywords
        </label>
        <input
          type="text"
          value={seoData.keywords || ''}
          onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      {/* Focus Keyphrase */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Focus Keyphrase
        </label>
        <input
          type="text"
          value={seoData.focusKeyphrase || ''}
          onChange={(e) => setSeoData({ ...seoData, focusKeyphrase: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="Primary keyword phrase for this product"
        />
      </div>

      {/* Image Alt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Alt Text
        </label>
        <input
          type="text"
          value={seoData.imageAlt || ''}
          onChange={(e) => setSeoData({ ...seoData, imageAlt: e.target.value })}
          maxLength={125}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="Descriptive alt text for product image"
        />
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <button
          onClick={applySEO}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Save SEO Settings
        </button>
      </div>

      {/* Preview Section */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Search Preview</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-blue-600 text-lg hover:underline cursor-pointer">
            {seoData.metaTitle || product.name}
          </p>
          <p className="text-green-700 text-sm">
            https://laraibcreative.com/products/{product.slug}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {seoData.metaDescription || product.description?.substring(0, 160)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Technical SEO Best Practices Implemented

### 1. Character Limits
| Tag | Optimal Length | Implemented |
|-----|---------------|-------------|
| Meta Title | 50-60 chars | ✅ |
| Meta Description | 150-160 chars | ✅ |
| OG Title | 60-90 chars | ✅ |
| OG Description | 200 chars max | ✅ |
| Twitter Title | 55-70 chars | ✅ |
| Image Alt | 100-125 chars | ✅ |

### 2. Structured Data (JSON-LD)
- Product schema with price, availability, ratings
- Breadcrumb navigation schema
- Organization schema
- Rich snippets support

### 3. Canonical URLs
- Prevents duplicate content
- Points to definitive product URL
- Implemented via Next.js metadata

### 4. Open Graph & Twitter Cards
- Optimized images (1200x630 for OG)
- Engaging titles and descriptions
- Proper card types

### 5. Robots Directives
- Index/noindex based on product status
- Follow links
- Max snippet/image preview settings

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/seo/generate/:productId` | POST | Generate AI SEO for product |
| `/api/v1/seo/apply/:productId` | PUT | Apply SEO data to product |
| `/api/v1/seo/bulk-generate` | POST | Bulk generate SEO |
| `/api/v1/seo/analyze/:productId` | GET | Analyze existing SEO |

---

## Installation

```bash
# Backend
cd backend
npm install openai

# Add to routes/index.js
const seoRoutes = require('./seo.routes');
router.use('/v1/seo', seoRoutes);
```

---

## Environment Variables

```env
OPENAI_API_KEY=sk-your-api-key-here
```

---

## Submission Checklist

- [x] AI-generated meta tags integration
- [x] Dynamic metadata in Next.js
- [x] Structured data (JSON-LD) implementation
- [x] Open Graph and Twitter Card support
- [x] SEO analysis and scoring
- [x] Character limit validation
- [x] Canonical URL implementation
- [x] Admin SEO management interface
- [x] Bulk SEO generation capability
- [x] Technical SEO best practices documented
