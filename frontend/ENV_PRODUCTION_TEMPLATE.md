# Production Environment Variables Template
## Frontend (Vercel)

Add these variables in Vercel Dashboard → Settings → Environment Variables

---

## Required Variables

```bash
# ============================================
# APPLICATION URLS
# ============================================
NEXT_PUBLIC_APP_URL=https://www.laraibcreative.studio
NEXT_PUBLIC_API_URL=https://laraibcreative-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://laraibcreative-backend.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://www.laraibcreative.studio
NEXT_PUBLIC_SOCKET_URL=https://laraibcreative-backend.onrender.com

# ============================================
# CLOUDINARY (Image CDN)
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-api-key

# ============================================
# ANALYTICS (Google Analytics 4)
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# ERROR TRACKING (Sentry - Optional)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

## How to Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Key:** Variable name (e.g., `NEXT_PUBLIC_APP_URL`)
   - **Value:** Variable value
   - **Environment:** Select **Production**, **Preview**, and **Development**
6. Click **Save**
7. Redeploy to apply changes

---

## Environment-Specific Values

### Production
```bash
NEXT_PUBLIC_APP_URL=https://www.laraibcreative.studio
NEXT_PUBLIC_API_URL=https://laraibcreative-backend.onrender.com
```

### Preview (Staging)
```bash
NEXT_PUBLIC_APP_URL=https://staging.laraibcreative.studio
NEXT_PUBLIC_API_URL=https://laraibcreative-backend-staging.onrender.com
```

### Development
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Important Notes

1. **NEXT_PUBLIC_ Prefix:**
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - Only use for non-sensitive values
   - Never put secrets in `NEXT_PUBLIC_` variables

2. **Build-Time Variables:**
   - All `NEXT_PUBLIC_` variables are embedded at build time
   - Changes require a new deployment

3. **Runtime Variables:**
   - Server-side variables (without `NEXT_PUBLIC_`) are available at runtime
   - Use for sensitive values

---

## Verification

After adding variables:

1. **Check Build Logs:**
   - Look for environment variable warnings
   - Verify variables are loaded

2. **Test in Browser:**
   ```javascript
   // In browser console
   console.log(process.env.NEXT_PUBLIC_APP_URL);
   ```

3. **Check Network Tab:**
   - Verify API calls go to correct URL
   - Check for CORS errors

---

## Current Configuration (from vercel.json)

Your `vercel.json` already includes some environment variables. These will be used if not overridden in Vercel dashboard:

```json
{
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://laraibcreative.studio",
    "NEXT_PUBLIC_API_URL": "https://laraibcreative-backend.onrender.com",
    "NEXT_PUBLIC_API_BASE_URL": "https://laraibcreative-backend.onrender.com/api/v1",
    "NEXT_PUBLIC_SOCKET_URL": "https://laraibcreative-backend.onrender.com",
    "NEXT_PUBLIC_SITE_URL": "https://laraibcreative.studio",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME": "dkzqbo109"
  }
}
```

**Note:** Variables in Vercel dashboard override `vercel.json` values.

---

**Last Updated:** December 2024

