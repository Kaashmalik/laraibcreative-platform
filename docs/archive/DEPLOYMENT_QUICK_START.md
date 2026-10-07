# Deployment Quick Start Guide
## LaraibCreative - 5 Minute Setup

Quick reference for deploying to production.

---

## Prerequisites

- ✅ GitHub repository connected
- ✅ MongoDB Atlas account
- ✅ Render account (backend)
- ✅ Vercel account (frontend)
- ✅ Cloudinary account

---

## 1. MongoDB Atlas Setup (5 minutes)

```bash
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Configure network access (0.0.0.0/0 for Render)
4. Get connection string
```

---

## 2. Backend Deployment - Render (10 minutes)

### Create Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. **New** → **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name:** `laraibcreative-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

### Add Environment Variables

Copy all variables from `backend/ENV_PRODUCTION_TEMPLATE.md` to Render dashboard.

**Required:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ALLOWED_ORIGINS=https://www.laraibcreative.studio,https://laraibcreative.studio
```

### Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Verify: `https://your-service.onrender.com/api/health`

---

## 3. Frontend Deployment - Vercel (5 minutes)

### Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New Project**
3. Import GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`

### Add Environment Variables

Copy all variables from `frontend/ENV_PRODUCTION_TEMPLATE.md` to Vercel dashboard.

**Required:**
```bash
NEXT_PUBLIC_APP_URL=https://www.laraibcreative.studio
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com/api/v1
```

### Deploy

1. Click **Deploy**
2. Wait for build (3-5 minutes)
3. Verify: Visit preview URL

---

## 4. Domain Configuration (10 minutes)

### Vercel Domain

1. Vercel Dashboard → **Settings** → **Domains**
2. Add: `www.laraibcreative.studio`
3. Add: `laraibcreative.studio`
4. Follow DNS instructions

### DNS Records

Add to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL

- ✅ Automatic (Vercel & Render)
- ✅ No action needed

---

## 5. Verify Deployment (5 minutes)

```bash
# Run verification script
./scripts/verify-deployment.sh

# Or manually check:
curl https://your-backend-url.com/api/health
curl https://www.laraibcreative.studio
```

---

## Quick Commands

```bash
# Deploy backend
./scripts/deploy-backend.sh

# Deploy frontend
./scripts/deploy-frontend.sh

# Verify deployment
./scripts/verify-deployment.sh

# Setup production
./scripts/setup-production.sh
```

---

## Troubleshooting

### Backend Issues

- **Health check failing:** Check environment variables
- **Database connection error:** Verify MongoDB URI and network access
- **CORS errors:** Check `ALLOWED_ORIGINS` variable

### Frontend Issues

- **Build failing:** Check environment variables
- **API errors:** Verify `NEXT_PUBLIC_API_URL`
- **Images not loading:** Check Cloudinary configuration

---

## Support

- 📖 Full Guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- 🔄 Rollback: `ROLLBACK_PROCEDURES.md`
- 📊 Monitoring: `MONITORING_SETUP_GUIDE.md`
- ✅ Checklist: `DEPLOYMENT_CHECKLIST.md`

---

**Total Time:** ~35 minutes  
**Difficulty:** Easy  
**Status:** Ready to Deploy

