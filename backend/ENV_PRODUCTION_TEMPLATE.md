# Production Environment Variables Template
## Backend (Render)

Copy these variables to your Render dashboard under **Environment** tab.

---

## Required Variables

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=10000

# ============================================
# DATABASE (MongoDB Atlas)
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/laraibcreative?retryWrites=true&w=majority

# ============================================
# JWT SECRETS (Minimum 32 characters each)
# ============================================
JWT_SECRET=your-very-long-and-random-secret-key-here-minimum-32-characters-long
JWT_REFRESH_SECRET=your-very-long-and-random-refresh-secret-key-here-minimum-32-characters-long
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ============================================
# CORS CONFIGURATION
# ============================================
ALLOWED_ORIGINS=https://www.laraibcreative.studio,https://laraibcreative.studio
FRONTEND_URL=https://www.laraibcreative.studio

# ============================================
# CLOUDINARY (Image Storage & CDN)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@laraibcreative.studio
EMAIL_FROM_NAME=LaraibCreative

# ============================================
# WHATSAPP (Twilio)
# ============================================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+923020718182
WHATSAPP_BUSINESS_NUMBER=+923020718182

# ============================================
# SECURITY
# ============================================
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here-minimum-32-characters

# ============================================
# FILE UPLOAD LIMITS
# ============================================
MAX_FILE_SIZE=5242880
MAX_FILES_COUNT=10

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m

# ============================================
# PAGINATION
# ============================================
DEFAULT_PAGE_SIZE=12
MAX_PAGE_SIZE=100

# ============================================
# ERROR TRACKING (Sentry - Optional)
# ============================================
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# ============================================
# MONITORING (Optional)
# ============================================
MONITORING_ENABLED=true
METRICS_ENDPOINT=/api/metrics
```

---

## How to Add to Render

1. Go to your Render service dashboard
2. Click on **Environment** tab
3. Click **Add Environment Variable**
4. Add each variable one by one
5. For sensitive values, use **Secret** type
6. Click **Save Changes**
7. Service will automatically redeploy

---

## Security Notes

- ✅ Never commit `.env` files to Git
- ✅ Use strong, randomly generated secrets
- ✅ Rotate secrets periodically
- ✅ Use different secrets for different environments
- ✅ Store secrets in Render's secure environment variable system

---

## Generating Secure Secrets

```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret
openssl rand -hex 32
```

---

## Verification

After adding variables, verify they're loaded:

1. Check Render logs for: `✅ Environment variables validated`
2. Test health endpoint: `GET /api/health`
3. Check for any missing variable errors in logs

---

**Last Updated:** December 2024

