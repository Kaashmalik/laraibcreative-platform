# AI Content Generation Setup Guide

## Overview

LaraibCreative includes AI-powered content generation for product management using **Google Gemini API** (free tier available!). This feature helps admins quickly create:

- **Product Descriptions** - Detailed, SEO-optimized descriptions
- **SEO Keywords** - Long-tail keywords for better search visibility
- **Meta Titles & Descriptions** - Optimized for search engines
- **Product Features** - Key selling points
- **Care Instructions** - Fabric-specific care guidelines

## Prerequisites

- Google AI Studio account (FREE)
- Admin access to LaraibCreative backend

## Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **Get API Key** in the top menu
4. Click **Create API Key**
5. Copy the key (starts with `AIza`)

> ⚠️ **Security Warning**: Never expose your API key in client-side code or commit it to version control.

### 2. Configure Environment Variables

Add the following to your backend `.env` file:

```env
# ===========================================
# AI CONTENT GENERATION (Google Gemini)
# ===========================================

# Required: Your Google Gemini API key from AI Studio
GEMINI_API_KEY=AIza-your-api-key-here

# Optional: Gemini model to use (default: gemini-1.5-flash)
# Options: gemini-1.5-flash, gemini-1.5-pro, gemini-pro
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Model Selection Guide

| Model | Cost | Quality | Speed | Best For |
|-------|------|---------|-------|----------|
| `gemini-1.5-flash` | FREE* | Good | Very Fast | Default, best for most use |
| `gemini-1.5-pro` | FREE* | Excellent | Medium | Complex descriptions |
| `gemini-pro` | FREE* | Good | Fast | Simple content |

*Google provides generous free tier: 60 requests/minute, 1M tokens/month

### 4. Verify Configuration

After setting up, verify the AI service is working:

```bash
# Check AI status endpoint
curl -X GET http://localhost:5000/api/v1/admin/ai/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "model": "gpt-4o-mini",
    "message": "AI service is properly configured",
    "rateLimit": {
      "limit": 10,
      "remaining": 10,
      "window": 60
    }
  }
}
```

## Usage

### In Admin Panel

1. Go to **Admin → Products → Add New Product**
2. Enter a **Product Title** (minimum 3 characters)
3. Optionally select **Category**, **Fabric Type**, and **Occasion**
4. Click the **AI Content Generator** section
5. Click **Generate All Content** for complete generation
6. Review the generated content in the preview
7. Click **Apply All** or apply individual sections
8. Edit as needed, then publish or save as draft

### API Endpoints

#### Generate Complete Content
```bash
POST /api/v1/admin/ai/generate-complete
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Emerald Green Silk Lehenga",
  "category": "Bridal Wear",
  "fabricType": "Silk",
  "occasion": "Wedding"
}
```

#### Generate Description Only
```bash
POST /api/v1/admin/ai/generate-description
```

#### Generate Keywords Only
```bash
POST /api/v1/admin/ai/generate-keywords
```

## Rate Limiting

To prevent excessive API usage and costs:

- **10 requests per minute** per admin user
- Complete content generation counts as 2 requests
- Rate limit resets every 60 seconds

## Cost Estimation

Approximate costs per product (using gpt-4o-mini):

| Operation | Tokens | Est. Cost |
|-----------|--------|-----------|
| Complete Content | ~1500 | ~$0.002 |
| Description Only | ~1000 | ~$0.0015 |
| Keywords Only | ~600 | ~$0.001 |

For 100 products/month: ~$0.20 - $0.30

## Best Practices

### 1. Provide Context
The more information you provide, the better the results:
- Always include **category**
- Specify **fabric type** for accurate care instructions
- Select **occasion** for relevant styling suggestions

### 2. Review & Edit
AI-generated content is a starting point:
- Always review before publishing
- Add unique brand voice and personality
- Verify accuracy of fabric and care information
- Check keyword relevance for your market

### 3. Use Draft System
- Generated content saves as draft by default
- Review and refine before publishing
- Track AI-assisted content via `contentSource` field

### 4. Monitor Usage
- Check rate limit remaining before bulk generation
- Review token usage in API responses
- Set up alerts for high API costs

## Troubleshooting

### "AI service is not configured"
- Verify `OPENAI_API_KEY` is set in `.env`
- Restart the backend server after adding the key
- Check for typos in the API key

### "Rate limit exceeded"
- Wait for the reset window (60 seconds)
- Reduce generation frequency
- Consider upgrading rate limits for high-volume needs

### "Failed to generate content"
- Check OpenAI API status: https://status.openai.com/
- Verify API key has sufficient credits
- Check for network connectivity issues

### Poor Quality Content
- Provide more context (category, fabric, occasion)
- Try a more powerful model (gpt-4o)
- Edit the brand context in `aiService.js`

## Security Considerations

1. **API Key Storage**
   - Store only in server-side environment variables
   - Never expose in frontend code
   - Rotate keys periodically

2. **Rate Limiting**
   - Prevents abuse and cost overruns
   - Applied per-user, not globally

3. **Input Sanitization**
   - All user inputs are sanitized
   - Prevents prompt injection attacks

4. **Access Control**
   - Only admin users can access AI endpoints
   - Authentication required for all requests

## Customization

### Modify Brand Voice

Edit the `BRAND_CONTEXT` in `backend/src/services/aiService.js`:

```javascript
const BRAND_CONTEXT = `
You are an expert copywriter for LaraibCreative...
// Customize brand values, tone, and style here
`;
```

### Adjust Rate Limits

Edit in `backend/src/controllers/aiController.js`:

```javascript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests
```

## Support

For issues with AI content generation:
- Check this guide first
- Review server logs for error details
- Contact: support@laraibcreative.com

---

**Last Updated:** December 2024
