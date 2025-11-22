# 🚀 Deployment Checklist - Scaling to 100k Orders

## Pre-Deployment

### Environment Variables

#### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=https://api.laraibcreative.studio

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890123456

# Sentry (if using)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d

# Facebook Conversion API
FB_PIXEL_ID=1234567890123456
FB_CONVERSION_API_ACCESS_TOKEN=your-access-token

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@laraibcreative.studio

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp (if using)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Database Setup

1. **Create Indexes**
   ```bash
   cd backend
   npm run verify-indexes
   ```

2. **Verify Models**
   - Tailor
   - FabricInventory
   - Referral
   - LoyaltyPoints
   - ProductionQueue
   - FestiveCollection
   - MeasurementProfile
   - DraftOrder

3. **Seed Initial Data** (if needed)
   ```bash
   npm run seed
   ```

### Build & Test

#### Frontend
```bash
cd frontend
npm run build
npm run type-check
npm run lint
```

#### Backend
```bash
cd backend
npm run build
npm run type-check
npm run lint
```

## Deployment Steps

### 1. Vercel (Frontend)

1. **Connect Repository**
   - Link GitHub repo to Vercel
   - Select `frontend` as root directory

2. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - Configure build settings

3. **Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install --legacy-peer-deps
   ```

4. **Deploy**
   - Push to main branch triggers auto-deploy
   - Or deploy manually from Vercel dashboard

### 2. Backend (Render/Railway/Heroku)

#### Render Setup
1. **Create Web Service**
   - Connect GitHub repo
   - Select `backend` as root directory

2. **Environment Variables**
   - Add all backend env variables
   - Set `NODE_ENV=production`

3. **Build Settings**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Health Check**
   - Endpoint: `/health`
   - Interval: 30s

#### Railway Setup
1. **New Project**
   - Connect GitHub repo
   - Select `backend` directory

2. **Configure**
   - Add environment variables
   - Set start command: `npm start`

### 3. Database (MongoDB Atlas)

1. **Create Cluster**
   - Choose region closest to backend
   - Enable backup

2. **Network Access**
   - Add backend server IP
   - Or allow from anywhere (0.0.0.0/0) for cloud

3. **Database Access**
   - Create user with read/write permissions
   - Save credentials securely

4. **Connection String**
   - Copy connection string
   - Add to backend `.env` as `MONGODB_URI`

### 4. Scheduled Jobs (Cron)

#### Option 1: Render Cron Jobs
```bash
# Alert checks (every hour)
0 * * * * curl https://api.laraibcreative.studio/api/v1/alerts/check

# Festive collection auto-publish (every 15 minutes)
*/15 * * * * node backend/scripts/check-festive-collections.js
```

#### Option 2: Node-cron in Backend
```javascript
// backend/src/cron/index.js
const cron = require('node-cron');
const alertService = require('../services/alertService');

// Run every hour
cron.schedule('0 * * * *', async () => {
  await alertService.runAllChecks();
});
```

## Post-Deployment

### 1. Verify Endpoints

```bash
# Health check
curl https://api.laraibcreative.studio/health

# API root
curl https://api.laraibcreative.studio/api/v1

# Frontend
curl https://laraibcreative.studio
```

### 2. Test Critical Features

- [ ] User registration/login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Order creation
- [ ] Payment processing
- [ ] Production queue
- [ ] Referral system
- [ ] Loyalty points
- [ ] i18n switching
- [ ] Currency conversion

### 3. Monitor

#### Vercel Analytics
- Check Speed Insights
- Monitor Core Web Vitals
- Review error logs

#### Backend Monitoring
- Check server logs
- Monitor API response times
- Verify database connections

#### Sentry (if configured)
- Check error tracking
- Review performance metrics
- Set up alerts

### 4. Configure Alerts

#### Email Alerts
- Failed payments
- Stockouts
- High abandonment rate
- System errors

#### Slack/Discord (optional)
- Set up webhook for critical alerts
- Configure notification channels

## Performance Optimization

### 1. CDN Setup
- Configure Cloudinary CDN
- Enable image optimization
- Set up caching headers

### 2. Database Optimization
- Verify all indexes are created
- Monitor slow queries
- Set up connection pooling

### 3. Caching
- Enable Redis for sessions (if needed)
- Configure ISR revalidation
- Set up API response caching

## Security Checklist

- [ ] All environment variables set
- [ ] JWT secrets are strong and unique
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] File upload validation working
- [ ] SQL injection protection (MongoDB safe)
- [ ] XSS protection enabled
- [ ] HTTPS enforced
- [ ] Admin routes protected

## Scaling Considerations

### For 100k Monthly Orders

1. **Database**
   - Enable MongoDB Atlas auto-scaling
   - Set up read replicas if needed
   - Monitor connection pool size

2. **Backend**
   - Enable auto-scaling on Render/Railway
   - Set up load balancing
   - Monitor memory/CPU usage

3. **Frontend**
   - Vercel automatically scales
   - Monitor bandwidth usage
   - Check build times

4. **CDN**
   - Cloudinary handles image scaling
   - Monitor bandwidth limits
   - Optimize image sizes

## Rollback Plan

1. **Frontend**
   - Vercel: Previous deployment in dashboard
   - Click "Promote to Production"

2. **Backend**
   - Render: Previous deployment in dashboard
   - Railway: Previous deployment in dashboard

3. **Database**
   - MongoDB Atlas: Point-in-time restore
   - Or restore from backup

## Maintenance

### Daily
- Check error logs
- Monitor alert emails
- Review order processing

### Weekly
- Review analytics dashboard
- Check production queue
- Verify inventory levels

### Monthly
- Update dependencies
- Review performance metrics
- Optimize slow queries
- Update exchange rates

## Support

- **Documentation**: See `SCALING_COMPLETE.md`
- **Issues**: Check GitHub issues
- **Logs**: Vercel/Render dashboards
- **Monitoring**: Sentry, Vercel Analytics

## Success Criteria

- ✅ All tests passing
- ✅ No critical errors in logs
- ✅ API response time < 200ms
- ✅ Frontend Lighthouse score > 95
- ✅ All features working
- ✅ Alerts configured
- ✅ Monitoring active

---

**Ready to deploy!** 🚀
