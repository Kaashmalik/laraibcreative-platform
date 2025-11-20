# Production Deployment Guide
## LaraibCreative E-commerce Platform

**Platforms:**
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **CDN/Storage:** Cloudinary

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Domain Configuration](#domain-configuration)
7. [SSL Certificate](#ssl-certificate)
8. [CDN Setup (Cloudinary)](#cdn-setup-cloudinary)
9. [Email Service Configuration](#email-service-configuration)
10. [Error Tracking Setup](#error-tracking-setup)
11. [Analytics Integration](#analytics-integration)
12. [Backup Strategy](#backup-strategy)
13. [CI/CD Pipeline](#cicd-pipeline)
14. [Health Check Endpoints](#health-check-endpoints)
15. [Monitoring Setup](#monitoring-setup)
16. [Post-Deployment Verification](#post-deployment-verification)
17. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Security audit completed
- [ ] Dependencies updated and audited (`npm audit`)

### Configuration
- [ ] Environment variables documented
- [ ] Secrets stored securely (not in code)
- [ ] Database migrations tested
- [ ] Build process verified locally

### Infrastructure
- [ ] MongoDB Atlas cluster created
- [ ] Render account set up
- [ ] Vercel account set up
- [ ] Cloudinary account configured
- [ ] Domain purchased and DNS access available

---

## Environment Variables Setup

### Backend (Render) Environment Variables

See `backend/ENV_PRODUCTION_TEMPLATE.md` for complete template.

**Required Variables:**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ALLOWED_ORIGINS=https://www.laraibcreative.studio,https://laraibcreative.studio
FRONTEND_URL=https://www.laraibcreative.studio
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASSWORD=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

### Frontend (Vercel) Environment Variables

See `frontend/ENV_PRODUCTION_TEMPLATE.md` for complete template.

**Required Variables:**
```bash
NEXT_PUBLIC_APP_URL=https://www.laraibcreative.studio
NEXT_PUBLIC_API_URL=https://laraibcreative-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://laraibcreative-backend.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://www.laraibcreative.studio
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Free tier for development, M10+ for production)
3. Choose region closest to your users
4. Create cluster (takes 3-5 minutes)

### Step 2: Configure Database Access

1. Go to **Database Access**
2. Create database user:
   - Username: `laraibcreative-admin`
   - Password: Generate strong password
   - Database User Privileges: `Atlas admin` or `Read and write to any database`

### Step 3: Configure Network Access

1. Go to **Network Access**
2. Add IP Address:
   - For Render: Add Render's IP ranges (or `0.0.0.0/0` for development)
   - For production: Use specific IPs or VPC peering

### Step 4: Get Connection String

1. Go to **Clusters** → Click **Connect**
2. Choose **Connect your application**
3. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/laraibcreative?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials

### Step 5: Create Database Indexes

The application will create indexes automatically on first startup, but you can verify:

```bash
# After deployment, check indexes
curl https://your-backend-url.com/api/health/detailed
```

---

## Backend Deployment (Render)

### Step 1: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select repository: `laraibcreative`
5. Configure service:
   - **Name:** `laraibcreative-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for production)

### Step 2: Configure Environment Variables

1. Go to **Environment** tab
2. Add all variables from `backend/ENV_PRODUCTION_TEMPLATE.md`
3. Use **Secret Files** for sensitive values
4. Set `NODE_ENV=production`

### Step 3: Configure Build Settings

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Health Check Path:**
```
/api/health
```

**Auto-Deploy:** Enable (deploys on push to main branch)

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for build to complete (5-10 minutes)
3. Check build logs for errors
4. Verify health check: `https://your-service.onrender.com/api/health`

### Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Custom Domains**
2. Add domain: `api.laraibcreative.studio`
3. Follow DNS configuration instructions
4. SSL certificate auto-provisioned by Render

---

## Frontend Deployment (Vercel)

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import Git repository: `laraibcreative`
4. Select repository

### Step 2: Configure Project

**Framework Preset:** Next.js

**Root Directory:** `frontend`

**Build Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install`

### Step 3: Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add all variables from `frontend/ENV_PRODUCTION_TEMPLATE.md`
3. Set for **Production**, **Preview**, and **Development**

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build (3-5 minutes)
3. Vercel provides preview URL
4. Check deployment logs

### Step 5: Custom Domain

1. Go to **Settings** → **Domains**
2. Add domain: `www.laraibcreative.studio`
3. Add alternative: `laraibcreative.studio`
4. Follow DNS configuration instructions
5. SSL certificate auto-provisioned by Vercel

---

## Domain Configuration

### DNS Records Setup

Add these DNS records to your domain provider:

**For Frontend (Vercel):**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Backend (Render - if using custom domain):**
```
Type: CNAME
Name: api
Value: your-service.onrender.com
```

### Domain Verification

1. **Vercel:** DNS records verified automatically
2. **Render:** Follow instructions in dashboard
3. Wait for DNS propagation (up to 48 hours, usually < 1 hour)

---

## SSL Certificate

### Automatic SSL (Recommended)

Both Vercel and Render provide automatic SSL certificates via Let's Encrypt:
- ✅ **Vercel:** Automatic for all domains
- ✅ **Render:** Automatic for custom domains

### Manual SSL (If Needed)

1. Generate certificate using Let's Encrypt
2. Upload to hosting platform
3. Configure in platform settings

**Note:** Automatic SSL is recommended and requires no action.

---

## CDN Setup (Cloudinary)

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Get credentials from dashboard

### Step 2: Configure in Backend

Add to Render environment variables:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Configure Transformations

Cloudinary transformations are configured in:
- `backend/src/middleware/upload.middleware.js`
- Automatic optimization enabled

### Step 4: Test Image Upload

```bash
curl -X POST https://your-backend-url.com/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"
```

---

## Email Service Configuration

### Option 1: Gmail SMTP (Development)

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → App Passwords
   - Generate password for "Mail"
3. Use in environment variables:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Option 2: SendGrid (Production Recommended)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key
3. Verify sender email
4. Update email configuration:
   ```bash
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### Option 3: AWS SES (Enterprise)

1. Set up AWS SES
2. Verify domain
3. Create SMTP credentials
4. Configure in environment variables

---

## Error Tracking Setup

### Option 1: Sentry (Recommended)

1. Sign up at [Sentry](https://sentry.io)
2. Create project (Node.js for backend, React for frontend)
3. Get DSN

**Backend (Render):**
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
```

**Frontend (Vercel):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

### Option 2: LogRocket

1. Sign up at [LogRocket](https://logrocket.com)
2. Create project
3. Add SDK to frontend
4. Configure backend logging

---

## Analytics Integration

### Google Analytics 4

1. Create GA4 property
2. Get Measurement ID: `G-XXXXXXXXXX`
3. Add to frontend:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Vercel Analytics

1. Enable in Vercel dashboard
2. Add to `next.config.js`:
   ```javascript
   const { withVercelAnalytics } = require('@vercel/analytics/next');
   module.exports = withVercelAnalytics({...});
   ```

---

## Backup Strategy

### MongoDB Atlas Backups

1. **Automatic Backups:**
   - M10+ clusters: Automatic daily backups
   - M0 clusters: Manual backups only

2. **Manual Backup:**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup
   ```

3. **Restore:**
   ```bash
   mongorestore --uri="mongodb+srv://..." ./backup
   ```

### Application Data Backups

1. **Automated Script:** `backend/scripts/backup-db.js`
2. **Schedule:** Daily via cron or Render cron jobs
3. **Storage:** AWS S3, Google Cloud Storage, or Render disk

---

## CI/CD Pipeline

See `.github/workflows/` for complete CI/CD workflows:

- `backend.yml` - Backend tests and deployment
- `frontend.yml` - Frontend tests and deployment
- `integration-tests.yml` - Integration tests

### Workflow Overview

1. **On Push to Main:**
   - Run tests
   - Build application
   - Deploy to production (if tests pass)

2. **On Pull Request:**
   - Run tests
   - Build application
   - Deploy to preview environment

---

## Health Check Endpoints

### Basic Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2024-12-19T10:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Detailed Health Check

**Endpoint:** `GET /api/health/detailed`

See `backend/src/routes/health.routes.js` for implementation.

---

## Monitoring Setup

### Render Monitoring

1. **Built-in Metrics:**
   - CPU usage
   - Memory usage
   - Request count
   - Response times

2. **Access:** Dashboard → Your Service → Metrics

### Vercel Analytics

1. **Web Analytics:**
   - Page views
   - Unique visitors
   - Performance metrics

2. **Access:** Dashboard → Your Project → Analytics

### Custom Monitoring

See `MONITORING_SETUP_GUIDE.md` for detailed setup.

---

## Post-Deployment Verification

### Checklist

- [ ] Health check endpoint responds: `/api/health`
- [ ] Frontend loads: `https://www.laraibcreative.studio`
- [ ] API accessible: `https://your-backend-url.com/api`
- [ ] Database connection working
- [ ] Image uploads working (Cloudinary)
- [ ] Email sending working
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Error tracking working
- [ ] Analytics tracking working

### Test Scripts

```bash
# Run post-deployment tests
./scripts/verify-deployment.sh
```

---

## Rollback Procedures

### Frontend (Vercel)

1. Go to Vercel Dashboard
2. Select project
3. Go to **Deployments**
4. Find previous deployment
5. Click **⋯** → **Promote to Production**

### Backend (Render)

1. Go to Render Dashboard
2. Select service
3. Go to **Events**
4. Find previous deployment
5. Click **Rollback**

### Database

1. Restore from backup:
   ```bash
   mongorestore --uri="..." ./backup/YYYY-MM-DD
   ```

See `ROLLBACK_PROCEDURES.md` for detailed steps.

---

## Performance Baseline Metrics

### Target Metrics

- **Frontend:**
  - First Contentful Paint: < 1.5s
  - Largest Contentful Paint: < 2.5s
  - Time to Interactive: < 3.5s
  - Cumulative Layout Shift: < 0.1

- **Backend:**
  - API Response Time: < 200ms (p95)
  - Database Query Time: < 100ms (p95)
  - Uptime: > 99.9%

See `PERFORMANCE_BASELINE.md` for detailed metrics.

---

## Support & Resources

- **Documentation:** See project docs folder
- **Issues:** GitHub Issues
- **Monitoring:** Render/Vercel dashboards
- **Logs:** Platform-specific log viewers

---

**Last Updated:** December 2024  
**Next Review:** March 2025

