# LaraibCreative Platform - Deployment Guide

Complete guide for deploying both frontend and backend to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Local Testing
- [ ] Backend: `npm run dev` runs without errors
- [ ] Frontend: `npm run dev` loads without console errors
- [ ] All environment variables defined in `.env` and `.env.local`
- [ ] Database connection test: `npm run test` passes
- [ ] Linting passes: `npm run lint` (both stacks)
- [ ] No console errors on homepage and key pages
- [ ] Mobile responsiveness tested

### Security Review
- [ ] JWT_SECRET changed and min 32 characters
- [ ] Sensitive keys removed from version control
- [ ] CORS whitelist configured for production domain
- [ ] Rate limiting enabled on auth endpoints
- [ ] Password hashing working (bcryptjs)
- [ ] SQL injection prevention (Mongoose, express-mongo-sanitize)

---

## Backend Deployment

### Option 1: Deploy to Heroku

**Step 1: Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

**Step 2: Create Heroku App**
```bash
cd backend
heroku create your-app-name
```

**Step 3: Set Environment Variables**
```bash
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set NODE_ENV="production"
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
heroku config:set CLOUDINARY_API_KEY="your_api_key"
heroku config:set CLOUDINARY_API_SECRET="your_api_secret"
heroku config:set SMTP_HOST="smtp.gmail.com"
heroku config:set SMTP_PORT="587"
heroku config:set SMTP_USER="your_email@gmail.com"
heroku config:set SMTP_PASS="your_app_password"
heroku config:set TWILIO_ACCOUNT_SID="your_account_sid"
heroku config:set TWILIO_AUTH_TOKEN="your_auth_token"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
```

**Step 4: Deploy**
```bash
git push heroku main
```

**Step 5: Verify**
```bash
heroku logs --tail
heroku open /health
```

### Option 2: Deploy to DigitalOcean / AWS / Custom VPS

**Step 1: SSH into Server**
```bash
ssh root@your_server_ip
```

**Step 2: Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install MongoDB (or use MongoDB Atlas)
apt install -y mongodb-server
systemctl start mongodb
systemctl enable mongodb
```

**Step 3: Clone Repository**
```bash
cd /var/www
git clone https://github.com/Kaashmalik/laraibcreative-platform.git
cd laraibcreative-platform/backend
npm install
```

**Step 4: Configure Environment**
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

**Step 5: Start with PM2**
```bash
pm2 start server.js --name "laraib-backend"
pm2 startup
pm2 save
```

**Step 6: Setup Nginx Reverse Proxy**
```bash
# Install Nginx
apt install -y nginx

# Create config
nano /etc/nginx/sites-available/backend
```

Add this config:
```nginx
server {
    listen 80;
    server_name api.laraibcreative.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 7: Enable SSL (Let's Encrypt)**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.laraibcreative.com
```

**Step 8: Verify**
```bash
pm2 status
curl http://localhost:5000/health
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
cd frontend
vercel --prod
```

**Step 3: Set Environment Variables in Vercel Dashboard**
- Go to Project Settings → Environment Variables
- Add all variables from `.env.local`:
  - `NEXT_PUBLIC_API_URL=https://api.laraibcreative.com/api`
  - All other `NEXT_PUBLIC_*` variables

**Step 4: Configure Custom Domain**
- Settings → Domains
- Add your domain (laraibcreative.com)
- Update DNS records as shown

### Option 2: Deploy to Netlify

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

**Step 2: Connect to Netlify**
- Go to netlify.com
- Click "New site from Git"
- Select GitHub repository
- Build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`

**Step 3: Set Environment Variables**
- Build & deploy settings → Environment
- Add all `NEXT_PUBLIC_*` variables

### Option 3: Deploy to Custom VPS

**Step 1: SSH into Server**
```bash
ssh root@your_server_ip
```

**Step 2: Install Dependencies**
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs npm pm2 nginx
```

**Step 3: Clone and Setup**
```bash
cd /var/www
git clone https://github.com/Kaashmalik/laraibcreative-platform.git
cd laraibcreative-platform/frontend
npm install
npm run build
```

**Step 4: Configure .env.production**
```bash
# Create production env file
cat > .env.production.local << EOF
NEXT_PUBLIC_API_URL=https://api.laraibcreative.com/api
NEXT_PUBLIC_APP_URL=https://laraibcreative.com
# Add all other variables
EOF
```

**Step 5: Start with PM2**
```bash
pm2 start "npm start" --name "laraib-frontend"
pm2 startup
pm2 save
```

**Step 6: Setup Nginx**
```bash
nano /etc/nginx/sites-available/frontend
```

Add config:
```nginx
server {
    listen 80;
    server_name laraibcreative.com www.laraibcreative.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
    }
}
```

**Step 7: Enable SSL**
```bash
certbot --nginx -d laraibcreative.com -d www.laraibcreative.com
```

---

## Database Setup

### MongoDB Atlas (Cloud - Recommended)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create account and organization
3. Create new cluster (Free tier available)
4. Set Network Access: Add 0.0.0.0/0 (allow from anywhere) or specific IPs
5. Create database user with strong password
6. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/laraibcreative`
7. Add to `.env`: `MONGODB_URI="connection_string"`

### Local MongoDB

```bash
# Install MongoDB Community Edition
# For Ubuntu/Debian:
apt install -y mongodb-org

# Start service
systemctl start mongod
systemctl enable mongod

# Verify
mongosh --eval "db.adminCommand('ping')"
```

### Initial Data Population

```bash
cd backend
npm run seed                    # All seeds
npm run seed:categories        # Categories only
npm run seed:products          # Products only
npm run seed:settings          # Settings only
```

### Database Backup

```bash
# Backup
cd backend
npm run backup

# Manual backup with mongodump
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/laraibcreative" \
  --out ./database/backups/$(date +%Y%m%d_%H%M%S)
```

---

## Environment Configuration

### Backend Environment Variables

```env
# server.js will validate these on startup
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=https://laraibcreative.com
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.laraibcreative.com/api
NEXT_PUBLIC_APP_URL=https://laraibcreative.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
# All other NEXT_PUBLIC_* vars from .env.example
```

---

## Post-Deployment Verification

### Backend Health Checks

```bash
# Check health endpoint
curl https://api.laraibcreative.com/api/health

# Should return:
# {
#   "success": true,
#   "status": "OK",
#   "database": "connected",
#   "uptime": 1234
# }

# Check specific route
curl https://api.laraibcreative.com/api/v1/products -H "Authorization: Bearer your_token"
```

### Frontend Verification

```bash
# Check homepage loads
curl https://laraibcreative.com

# Open browser and verify:
# - Homepage renders without errors
# - Navigation links work
# - Console has no errors (F12)
# - API calls succeed
# - Images load from Cloudinary
# - Product pages render
# - Admin panel accessible
```

### Database Verification

```bash
# Connect to MongoDB and check
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/laraibcreative"

# List collections
show collections

# Check data
db.products.countDocuments()
db.users.countDocuments()
db.orders.countDocuments()
```

---

## Troubleshooting

### Backend Won't Start

**Error: ETIMEOUT on MongoDB connection**
- Check MongoDB URI in `.env`
- Verify IP whitelisting in MongoDB Atlas (add 0.0.0.0/0)
- Check internet connectivity
- Restart MongoDB service: `systemctl restart mongod`

**Error: Port 5000 already in use**
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
# Or use different port
PORT=5001 npm start
```

**Error: CORS blocked requests**
- Update `FRONTEND_URL` in backend `.env`
- Check `corsOptions` in `backend/server.js`
- Verify frontend URL matches CORS whitelist

### Frontend Build Timeout

**Error: Exit 124 during build**
```bash
# Increase timeout in next.config.js
staticPageGenerationTimeout: 600  # 10 minutes

# Or reduce pages being generated
# Remove unnecessary dynamic routes
# Use incremental static regeneration (ISR)
```

**Error: Image optimization fails**
- Add Cloudinary domain to `images.domains`
- Set `unoptimized: true` temporarily

### API 401 Unauthorized

- Token expired: User needs to re-login
- Invalid token: Clear localStorage and retry
- Missing Authorization header: Check axios config

### MongoDB Connection Drops

- Add connection retry logic (already in `db.js`)
- Increase `serverSelectionTimeoutMS` in config
- Check MongoDB Atlas connection limits (100 concurrent)

---

## Monitoring & Maintenance

### Enable Error Logging

```bash
# Check logs
pm2 logs laraib-backend
pm2 logs laraib-frontend

# View log files
tail -f logs/error.log
tail -f logs/combined.log
```

### Database Maintenance

```bash
# Regular backups (cron job)
0 2 * * * mongodump --uri "mongodb+srv://..." --out /backups/$(date +\%Y\%m\%d)

# Monitor disk usage
du -sh /var/lib/mongodb
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update patch/minor
npm update

# Update major (test thoroughly)
npm install package@latest
```

---

## Rollback Procedure

If deployment breaks production:

```bash
# Backend
git revert HEAD
pm2 restart laraib-backend

# Frontend (Vercel)
# Go to Deployments → Previous version → Redeploy

# Frontend (Custom)
git checkout previous_tag
npm run build
pm2 restart laraib-frontend
```

---

## Getting Help

- Backend errors: Check `logs/error.log`
- Frontend errors: Browser DevTools (F12 → Console)
- Database issues: Use MongoDB Compass
- API issues: Test with Postman
- Deployment issues: Check PM2 status: `pm2 status`
