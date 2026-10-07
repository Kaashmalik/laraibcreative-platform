# Environment Variables Setup Guide
## LaraibCreative Backend

This guide helps you configure the required environment variables for the backend.

---

## Quick Setup

1. Copy the example below to create your `.env` file in the `backend/` directory
2. Fill in all the required values
3. Never commit the `.env` file to version control (it's already in `.gitignore`)

---

## Required Environment Variables

### Server Configuration

```bash
NODE_ENV=production
PORT=5000
```

### Database

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/laraibcreative
```

### JWT Secrets (REQUIRED - Minimum 32 characters each)

```bash
JWT_SECRET=your-very-long-and-random-secret-key-here-minimum-32-characters-long
JWT_REFRESH_SECRET=your-very-long-and-random-refresh-secret-key-here-minimum-32-characters-long
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### CORS Configuration

```bash
# Your production domain
ALLOWED_ORIGINS=https://www.laraibcreative.studio,https://laraibcreative.studio
FRONTEND_URL=https://www.laraibcreative.studio
```

### Cloudinary (Image Storage)

```bash
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Email Configuration

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@laraibcreative.studio
EMAIL_FROM_NAME=LaraibCreative
```

### WhatsApp (Twilio)

```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+923020718182
WHATSAPP_BUSINESS_NUMBER=+923020718182
```

### Security

```bash
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here-minimum-32-characters
```

---

## Complete .env Template

Create a file named `.env` in the `backend/` directory with the following content:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=5000

# ============================================
# DATABASE
# ============================================
MONGODB_URI=your-mongodb-connection-string

# ============================================
# JWT SECRETS (REQUIRED - Minimum 32 characters each)
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
# CLOUDINARY (Image Storage)
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
```

---

## Domain Configuration

Your production domain is configured as:

- **Primary Domain:** `https://www.laraibcreative.studio`
- **Alternative Domain:** `https://laraibcreative.studio`

Both domains are included in the CORS whitelist to ensure proper API access.

---

## Validation

The backend will validate all required environment variables at startup. If any are missing or invalid, the server will not start and will display an error message.

### Required Variables Check:

- ✅ `MONGODB_URI` - Must start with `mongodb://` or `mongodb+srv://`
- ✅ `JWT_SECRET` - Must be at least 32 characters
- ✅ `JWT_REFRESH_SECRET` - Must be at least 32 characters

---

## Security Notes

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong secrets** - Generate random strings for JWT secrets (minimum 32 characters)
3. **Rotate secrets regularly** - Change JWT secrets periodically
4. **Use different secrets** - Don't reuse the same secret for access and refresh tokens
5. **Keep secrets secure** - Use a secret management service in production (AWS Secrets Manager, etc.)

---

## Generating Secure Secrets

You can generate secure secrets using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using online tools (use trusted sources only)
# https://www.random.org/strings/
```

---

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production`
2. Use strong, randomly generated secrets
3. Configure `ALLOWED_ORIGINS` with your production domain
4. Use a secure MongoDB connection (MongoDB Atlas recommended)
5. Enable HTTPS (handled by your hosting provider)
6. Use environment variable management (Vercel, Render, etc.)

---

## Troubleshooting

### CORS Errors

If you see CORS errors, check:

1. Is `ALLOWED_ORIGINS` set correctly?
2. Does the origin match exactly (including `https://` and trailing `/`)?
3. Is `NODE_ENV=production` set? (Development mode allows all origins)

### JWT Errors

If JWT validation fails:

1. Check that `JWT_SECRET` and `JWT_REFRESH_SECRET` are at least 32 characters
2. Ensure secrets are the same across all server instances
3. Check token expiry settings

### Database Connection Errors

If MongoDB connection fails:

1. Verify `MONGODB_URI` is correct
2. Check network access (firewall, IP whitelist)
3. Verify credentials are correct

---

**Last Updated:** December 2024

