# Monitoring Setup Guide
## LaraibCreative Production Monitoring

Comprehensive guide for setting up monitoring, alerting, and observability for the production deployment.

---

## Table of Contents

1. [Monitoring Stack](#monitoring-stack)
2. [Health Check Setup](#health-check-setup)
3. [Error Tracking (Sentry)](#error-tracking-sentry)
4. [Analytics (Google Analytics)](#analytics-google-analytics)
5. [Application Performance Monitoring](#application-performance-monitoring)
6. [Log Aggregation](#log-aggregation)
7. [Uptime Monitoring](#uptime-monitoring)
8. [Alert Configuration](#alert-configuration)
9. [Dashboard Setup](#dashboard-setup)
10. [Monitoring Best Practices](#monitoring-best-practices)

---

## Monitoring Stack

### Recommended Tools

| Category | Tool | Purpose |
|----------|------|---------|
| **Error Tracking** | Sentry | Frontend & Backend errors |
| **Analytics** | Google Analytics 4 | User behavior & conversions |
| **APM** | Vercel Analytics | Frontend performance |
| **Logs** | Render Logs / Winston | Application logs |
| **Uptime** | UptimeRobot / Pingdom | Service availability |
| **Metrics** | Render Metrics | Backend metrics |
| **Database** | MongoDB Atlas Metrics | Database performance |

---

## Health Check Setup

### Backend Health Endpoints

The backend provides multiple health check endpoints:

1. **Basic Health:** `GET /api/health`
   - Quick status check
   - Used by load balancers

2. **Detailed Health:** `GET /api/health/detailed`
   - Comprehensive system status
   - Database, memory, CPU metrics

3. **Readiness:** `GET /api/health/ready`
   - Kubernetes readiness probe
   - Checks if service can accept traffic

4. **Liveness:** `GET /api/health/live`
   - Kubernetes liveness probe
   - Checks if service is alive

5. **Metrics:** `GET /api/health/metrics`
   - Prometheus-style metrics
   - For monitoring tools

### Configure Render Health Check

1. Go to Render Dashboard → Your Service
2. Go to **Settings** → **Health Check Path**
3. Set: `/api/health`
4. Set **Health Check Interval:** 30 seconds
5. Save changes

### Configure Vercel Health Check

Vercel automatically monitors deployments. No additional configuration needed.

---

## Error Tracking (Sentry)

### Backend Setup

1. **Create Sentry Project**
   - Go to [Sentry](https://sentry.io)
   - Create new project: Node.js
   - Get DSN

2. **Install Sentry SDK**
   ```bash
   cd backend
   npm install @sentry/node @sentry/profiling-node
   ```

3. **Configure Sentry**
   Create `backend/src/config/sentry.js`:
   ```javascript
   const Sentry = require('@sentry/node');
   const { ProfilingIntegration } = require('@sentry/profiling-node');

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV || 'production',
     integrations: [
       new ProfilingIntegration(),
     ],
     tracesSampleRate: 1.0,
     profilesSampleRate: 1.0,
   });

   module.exports = Sentry;
   ```

4. **Add to server.js**
   ```javascript
   const Sentry = require('./src/config/sentry');
   // Add before routes
   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.tracingHandler());
   // Add after routes, before error handler
   app.use(Sentry.Handlers.errorHandler());
   ```

5. **Add Environment Variable**
   ```bash
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ENVIRONMENT=production
   ```

### Frontend Setup

1. **Create Sentry Project**
   - Create new project: React
   - Get DSN

2. **Install Sentry SDK**
   ```bash
   cd frontend
   npm install @sentry/nextjs
   ```

3. **Initialize Sentry**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

4. **Add Environment Variables**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
   ```

### Sentry Configuration

**Alert Rules:**
- Error rate > 10 errors/minute
- New issue detected
- Performance degradation > 50%

**Release Tracking:**
- Track releases by git commit
- Monitor error rates per release
- Set up release health

---

## Analytics (Google Analytics 4)

### Setup

1. **Create GA4 Property**
   - Go to [Google Analytics](https://analytics.google.com)
   - Create new property
   - Get Measurement ID: `G-XXXXXXXXXX`

2. **Add to Frontend**
   - Add to `frontend/.env`:
     ```bash
     NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     ```

3. **Implement Tracking**
   - Create `frontend/src/lib/analytics.js`:
     ```javascript
     export const trackEvent = (eventName, eventParams) => {
       if (typeof window !== 'undefined' && window.gtag) {
         window.gtag('event', eventName, eventParams);
       }
     };
     ```

4. **Track Key Events**
   - Page views
   - Product views
   - Add to cart
   - Checkout started
   - Purchase completed
   - Custom order submitted

### Vercel Analytics

1. **Enable in Vercel**
   - Go to Project Settings → Analytics
   - Enable Web Analytics
   - Enable Speed Insights

2. **View Analytics**
   - Dashboard → Analytics tab
   - Real-time metrics
   - Performance data

---

## Application Performance Monitoring

### Backend APM (Render)

Render provides built-in metrics:

1. **Access Metrics**
   - Dashboard → Your Service → Metrics
   - CPU, Memory, Request count
   - Response times

2. **Set Up Alerts**
   - Configure alert thresholds
   - Email notifications
   - Slack integration (optional)

### Frontend APM (Vercel)

1. **Vercel Analytics**
   - Automatic performance tracking
   - Core Web Vitals
   - Real User Monitoring

2. **View Metrics**
   - Dashboard → Analytics
   - Performance tab
   - Speed Insights

---

## Log Aggregation

### Backend Logs (Winston)

Winston is already configured with:
- Daily log rotation
- Error logs
- Combined logs
- Log levels

**Access Logs:**
- Render Dashboard → Logs tab
- Real-time log streaming
- Log search and filtering

**Log Retention:**
- 14 days for error logs
- 7 days for warning logs
- Configured in environment variables

### Frontend Logs

1. **Browser Console**
   - Monitor client-side errors
   - Use Sentry for error tracking

2. **Vercel Logs**
   - Deployment logs
   - Function logs
   - Access via Vercel dashboard

---

## Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. **Sign Up**
   - Go to [UptimeRobot](https://uptimerobot.com)
   - Create free account

2. **Add Monitors**
   - **Frontend:**
     - Type: HTTPS
     - URL: `https://www.laraibcreative.studio`
     - Interval: 5 minutes
   
   - **Backend:**
     - Type: HTTPS
     - URL: `https://your-backend-url.com/api/health`
     - Interval: 5 minutes

3. **Configure Alerts**
   - Email notifications
   - SMS (paid)
   - Slack integration

### Option 2: Pingdom

1. **Sign Up**
   - Go to [Pingdom](https://www.pingdom.com)
   - Create account

2. **Add Checks**
   - Similar to UptimeRobot
   - More advanced features
   - Paid service

### Option 3: Custom Monitoring

Create a simple monitoring script:

```bash
#!/bin/bash
# scripts/monitor-uptime.sh

FRONTEND_URL="https://www.laraibcreative.studio"
BACKEND_URL="https://your-backend-url.com"

# Check frontend
if curl -f -s "$FRONTEND_URL" > /dev/null; then
  echo "✅ Frontend is up"
else
  echo "❌ Frontend is down"
  # Send alert
fi

# Check backend
if curl -f -s "$BACKEND_URL/api/health" > /dev/null; then
  echo "✅ Backend is up"
else
  echo "❌ Backend is down"
  # Send alert
fi
```

---

## Alert Configuration

### Critical Alerts (Immediate)

**Triggers:**
- Service down > 1 minute
- Error rate > 1%
- Response time (p95) > 2x baseline
- Database connection failures
- Memory usage > 90%

**Channels:**
- Email (immediate)
- SMS (if available)
- Slack (team channel)
- PagerDuty (if configured)

### Warning Alerts (Monitor)

**Triggers:**
- Error rate > 0.5%
- Response time (p95) > 1.5x baseline
- CPU usage > 70%
- Memory usage > 80%
- Slow queries detected

**Channels:**
- Email
- Slack

### Alert Examples

**Render Alerts:**
1. Go to Dashboard → Your Service → Alerts
2. Configure:
   - CPU > 70% for 5 minutes
   - Memory > 80% for 5 minutes
   - Response time > 1s for 5 minutes

**Sentry Alerts:**
1. Go to Settings → Alerts
2. Create alert rules:
   - Error rate spike
   - New issue
   - Performance degradation

---

## Dashboard Setup

### Recommended Dashboards

1. **Operations Dashboard**
   - Service uptime
   - Error rates
   - Response times
   - Resource usage

2. **Business Dashboard**
   - User metrics
   - Conversion rates
   - Revenue metrics
   - Order volume

3. **Performance Dashboard**
   - Core Web Vitals
   - API performance
   - Database performance
   - CDN performance

### Tools for Dashboards

- **Grafana** (if self-hosted)
- **Datadog** (paid)
- **New Relic** (paid)
- **Render Dashboard** (built-in)
- **Vercel Dashboard** (built-in)

---

## Monitoring Best Practices

### 1. Set Up Monitoring Before Launch

- ✅ Configure all monitoring tools
- ✅ Set up alerts
- ✅ Test alerting system
- ✅ Document runbooks

### 2. Monitor Key Metrics

- ✅ Error rates
- ✅ Response times
- ✅ Uptime
- ✅ Resource usage
- ✅ Business metrics

### 3. Regular Reviews

- ✅ Daily: Check error logs
- ✅ Weekly: Review performance metrics
- ✅ Monthly: Comprehensive audit

### 4. Alert Fatigue Prevention

- ✅ Set appropriate thresholds
- ✅ Use alert grouping
- ✅ Implement alert escalation
- ✅ Regular alert review

### 5. Documentation

- ✅ Document alert procedures
- ✅ Create runbooks
- ✅ Update dashboards
- ✅ Share knowledge

---

## Quick Setup Checklist

### Backend Monitoring

- [ ] Health check endpoint configured
- [ ] Render metrics enabled
- [ ] Sentry configured
- [ ] Winston logging configured
- [ ] Alert rules set up

### Frontend Monitoring

- [ ] Vercel Analytics enabled
- [ ] Google Analytics configured
- [ ] Sentry configured
- [ ] Error tracking working
- [ ] Performance monitoring active

### Database Monitoring

- [ ] MongoDB Atlas metrics enabled
- [ ] Slow query logging enabled
- [ ] Index usage monitored
- [ ] Connection pool monitored

### Uptime Monitoring

- [ ] UptimeRobot/Pingdom configured
- [ ] Health checks set up
- [ ] Alert notifications configured
- [ ] Status page updated

---

## Monitoring Tools Comparison

| Tool | Cost | Best For | Setup Time |
|------|------|----------|------------|
| **Sentry** | Free tier available | Error tracking | 30 min |
| **Google Analytics** | Free | User analytics | 15 min |
| **UptimeRobot** | Free | Uptime monitoring | 10 min |
| **Render Metrics** | Included | Backend metrics | 0 min |
| **Vercel Analytics** | Included | Frontend metrics | 0 min |
| **Datadog** | Paid | Full-stack APM | 2 hours |
| **New Relic** | Paid | Enterprise APM | 2 hours |

---

## Cost Estimation

### Free Tier (Recommended Start)

- Sentry: Free (5,000 events/month)
- Google Analytics: Free
- UptimeRobot: Free (50 monitors)
- Render Metrics: Included
- Vercel Analytics: Included

**Total: $0/month**

### Paid Tier (Scale Up)

- Sentry: $26/month (50K events)
- Datadog: $15/host/month
- Pingdom: $10/month
- Additional tools as needed

**Total: ~$50-100/month**

---

## Implementation Timeline

### Week 1: Basic Monitoring
- [ ] Health checks
- [ ] Error tracking (Sentry)
- [ ] Basic analytics (GA4)

### Week 2: Advanced Monitoring
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Alert configuration

### Week 3: Optimization
- [ ] Dashboard setup
- [ ] Alert tuning
- [ ] Documentation

---

**Last Updated:** December 2024  
**Next Review:** January 2025

