# Assignment 3: AI-Powered Product Content Generator Dashboard

## Overview
This assignment implements a Dashboard webpage that allows users to generate AI-powered content and descriptions for products by simply entering a product title.

## Features
- **Product Title Input**: Enter the product name/title
- **AI Content Generation**: Automatically generate product descriptions using AI
- **Real-time Preview**: View generated content instantly
- **Copy to Clipboard**: Easy copy functionality for generated content
- **Responsive Design**: Works on desktop and mobile devices

---

## Screenshots

### Dashboard Interface
![Dashboard Interface](./screenshots/assignment3-dashboard.png)

### Content Generation in Action
![Content Generation](./screenshots/assignment3-generation.png)

---

## Code Implementation

### 1. Frontend - Dashboard Page (`frontend/src/app/(admin)/dashboard/ai-content/page.jsx`)

```jsx
'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AIContentGeneratorPage() {
  const [title, setTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState({
    description: '',
    features: [],
    seoDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateContent = async () => {
    if (!title.trim()) {
      toast.error('Please enter a product title');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/ai/generate-content', { title });
      
      if (response.data.success) {
        setGeneratedContent(response.data.data);
        toast.success('Content generated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Content Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Generate product descriptions and content using AI
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Title
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product title (e.g., Elegant Silk Saree)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            <button
              onClick={generateContent}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Content Section */}
        {generatedContent.description && (
          <div className="space-y-6">
            {/* Product Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Description
                </h2>
                <button
                  onClick={() => copyToClipboard(generatedContent.description)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {generatedContent.description}
              </p>
            </div>

            {/* Key Features */}
            {generatedContent.features?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Key Features
                </h2>
                <ul className="space-y-2">
                  {generatedContent.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SEO Description */}
            {generatedContent.seoDescription && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    SEO Meta Description
                  </h2>
                  <button
                    onClick={() => copyToClipboard(generatedContent.seoDescription)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Copy className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                  {generatedContent.seoDescription}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Backend - AI Controller (`backend/src/controllers/aiController.js`)

```javascript
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate product content using AI
 * @route POST /api/v1/ai/generate-content
 */
const generateProductContent = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required',
      });
    }

    const prompt = `Generate e-commerce product content for: "${title}"
    
    Please provide:
    1. A compelling product description (150-200 words)
    2. 5 key features/benefits as bullet points
    3. A short SEO meta description (150-160 characters)
    
    Format the response as JSON:
    {
      "description": "...",
      "features": ["...", "...", "...", "...", "..."],
      "seoDescription": "..."
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional e-commerce copywriter specializing in fashion and lifestyle products. Generate engaging, SEO-friendly product descriptions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content;
    const generatedContent = JSON.parse(responseText);

    res.status(200).json({
      success: true,
      message: 'Content generated successfully',
      data: generatedContent,
    });
  } catch (error) {
    console.error('AI Content Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message,
    });
  }
};

/**
 * Alternative: Generate content without external API (Template-based)
 * @route POST /api/v1/ai/generate-content-template
 */
const generateProductContentTemplate = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required',
      });
    }

    // Template-based content generation (No API required)
    const templates = {
      description: `Discover the exquisite ${title}, a masterpiece of craftsmanship that combines elegance with contemporary style. This stunning piece features intricate detailing and premium quality materials, ensuring both comfort and durability. Perfect for special occasions or adding a touch of sophistication to your everyday wardrobe. The ${title} reflects our commitment to quality and attention to detail, making it a timeless addition to your collection. Experience the perfect blend of tradition and modernity with this exceptional piece.`,
      
      features: [
        'Premium quality materials for lasting durability',
        'Intricate handcrafted detailing',
        'Comfortable fit for all-day wear',
        'Versatile design suitable for multiple occasions',
        'Easy care and maintenance',
      ],
      
      seoDescription: `Shop ${title} - Premium quality, elegant design, perfect for any occasion. Free shipping available. Order now!`,
    };

    res.status(200).json({
      success: true,
      message: 'Content generated successfully',
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message,
    });
  }
};

module.exports = {
  generateProductContent,
  generateProductContentTemplate,
};
```

### 3. Backend - AI Routes (`backend/src/routes/ai.routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const {
  generateProductContent,
  generateProductContentTemplate,
} = require('../controllers/aiController');

// AI content generation routes (protected - admin only)
router.post('/generate-content', protect, admin, generateProductContent);
router.post('/generate-content-template', protect, admin, generateProductContentTemplate);

module.exports = router;
```

### 4. Register Routes (`backend/src/routes/index.js`)

```javascript
// Add this line to register AI routes
const aiRoutes = require('./ai.routes');

// Mount the route
router.use('/v1/ai', aiRoutes);
```

### 5. Environment Variables (`.env`)

```env
# OpenAI API Key for AI content generation
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Installation & Setup

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install openai
```

**Frontend:**
```bash
cd frontend
npm install lucide-react
```

### Step 2: Configure Environment

Add your OpenAI API key to `backend/.env`:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 4: Access the Dashboard

Navigate to: `http://localhost:3000/dashboard/ai-content`

---

## Usage Instructions

1. **Login** to the admin dashboard
2. Navigate to **AI Content Generator** from the sidebar
3. Enter a **product title** (e.g., "Elegant Silk Saree", "Designer Kurta Set")
4. Click **Generate** button
5. Wait for AI to generate content
6. **Copy** the generated description, features, or SEO text
7. Use the content in your product listings

---

## API Reference

### Generate Product Content

**Endpoint:** `POST /api/v1/ai/generate-content`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Elegant Silk Saree"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content generated successfully",
  "data": {
    "description": "Discover the exquisite Elegant Silk Saree...",
    "features": [
      "Pure silk fabric with natural sheen",
      "Intricate zari work border",
      "Lightweight and comfortable",
      "Perfect for weddings and festivals",
      "Includes matching blouse piece"
    ],
    "seoDescription": "Shop Elegant Silk Saree - Pure silk with intricate zari work. Perfect for weddings. Free shipping!"
  }
}
```

---

## Technologies Used

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** Express.js, Node.js
- **AI:** OpenAI GPT-3.5 Turbo API
- **Authentication:** JWT (JSON Web Tokens)

---

## Notes

- The template-based generation (`/generate-content-template`) works without an API key
- OpenAI API calls are rate-limited; implement caching for production
- Consider adding content history/saving functionality
- Generated content should be reviewed before publishing

---

## Submission Checklist

- [x] Dashboard webpage implemented
- [x] Title input field
- [x] AI content generation functionality
- [x] Description and features output
- [x] Copy to clipboard feature
- [x] Responsive design
- [x] Code documentation
- [x] Screenshots included
