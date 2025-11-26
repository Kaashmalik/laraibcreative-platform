# Deployment Checklist - LaraibCreative

## Pre-Deployment

### 1. Environment Variables
Ensure all variables are set in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TiDB Cloud
TIDB_HOST=
TIDB_PORT=4000
TIDB_USER=
TIDB_PASSWORD=
TIDB_DATABASE=laraibcreative

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Notifications
RESEND_API_KEY=
WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://laraibcreative.com
NEXTAUTH_SECRET=
```

### 2. Database Migrations

**Supabase:**
```bash
npx supabase db push
```

**TiDB Cloud:**
- Run schema from `docs/TIDB_SCHEMA.md` in SQL Editor

### 3. Storage Buckets
Create in Supabase Dashboard:
- [ ] `review-images` (Public)
- [ ] `order-attachments` (Private)
- [ ] `payment-receipts` (Private)
- [ ] `profile-images` (Public)

### 4. Cloudinary Setup
- [ ] Create folders: `laraibcreative/products`, `laraibcreative/categories`
- [ ] Configure upload presets
- [ ] Set CORS origins

---

## Vercel Deployment

### 1. Connect Repository
```bash
vercel link
vercel env pull
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Domain Setup
- [ ] Add custom domain: `laraibcreative.com`
- [ ] Configure DNS (A/CNAME records)
- [ ] Enable SSL (automatic)

---

## Post-Deployment

### 1. Verify Core Features
- [ ] Homepage loads
- [ ] Products display
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] Authentication
- [ ] Admin panel access

### 2. Performance Checks
```bash
# Lighthouse audit
npx lighthouse https://laraibcreative.com --output html

# Core Web Vitals
# Target: LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### 3. SEO Verification
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt: `/robots.txt`
- [ ] Meta tags present
- [ ] OG images working
- [ ] Submit to Google Search Console

### 4. Analytics Setup
- [ ] Google Analytics configured
- [ ] Sentry error tracking
- [ ] Custom events firing

### 5. Security Checks
- [ ] RLS policies active
- [ ] API routes protected
- [ ] Admin routes secured
- [ ] CORS configured
- [ ] Rate limiting (if applicable)

---

## Monitoring

### Daily
- [ ] Check Sentry for errors
- [ ] Review order processing

### Weekly
- [ ] Analytics review
- [ ] Performance metrics
- [ ] Customer feedback

### Monthly
- [ ] Security audit
- [ ] Dependency updates
- [ ] Cost review (TiDB, Supabase, Cloudinary)

---

## Rollback Plan

If critical issues arise:

```bash
# Vercel: Revert to previous deployment
vercel rollback

# Database: Restore from backup
# Supabase: Dashboard > Backups
# TiDB: Dashboard > Backups
```

---

## Contact

**Technical Issues:**
- TiDB Cloud Support: https://tidbcloud.com/support
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support

---

## Success Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time | < 3s | Lighthouse |
| LCP | < 2.5s | Core Web Vitals |
| FID | < 100ms | Core Web Vitals |
| CLS | < 0.1 | Core Web Vitals |
| Error Rate | < 0.1% | Sentry |
| Uptime | 99.9% | UptimeRobot |
