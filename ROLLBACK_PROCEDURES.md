# Rollback Procedures
## LaraibCreative Production Deployment

This document outlines step-by-step procedures for rolling back deployments in case of issues.

---

## Table of Contents

1. [Frontend Rollback (Vercel)](#frontend-rollback-vercel)
2. [Backend Rollback (Render)](#backend-rollback-render)
3. [Database Rollback](#database-rollback)
4. [Emergency Rollback Script](#emergency-rollback-script)
5. [Post-Rollback Verification](#post-rollback-verification)

---

## Frontend Rollback (Vercel)

### Method 1: Via Vercel Dashboard (Recommended)

1. **Access Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project: `laraibcreative`

2. **View Deployments**
   - Click on **Deployments** tab
   - You'll see a list of all deployments

3. **Select Previous Deployment**
   - Find the last known good deployment
   - Check deployment details (commit hash, timestamp)

4. **Promote to Production**
   - Click the **⋯** (three dots) menu on the deployment
   - Select **Promote to Production**
   - Confirm the action

5. **Verify Rollback**
   - Wait for deployment to complete (1-2 minutes)
   - Visit your domain: `https://www.laraibcreative.studio`
   - Verify site is working correctly

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Method 3: Via Git (Revert Commit)

```bash
# Revert the problematic commit
git revert <commit-hash>

# Push to main branch
git push origin main

# Vercel will automatically deploy the reverted version
```

---

## Backend Rollback (Render)

### Method 1: Via Render Dashboard (Recommended)

1. **Access Render Dashboard**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Select your service: `laraibcreative-backend`

2. **View Events**
   - Click on **Events** tab
   - You'll see deployment history

3. **Find Previous Deployment**
   - Scroll to find the last known good deployment
   - Note the deployment ID and timestamp

4. **Rollback**
   - Click on the **⋯** (three dots) menu
   - Select **Rollback to this deploy**
   - Confirm the action

5. **Monitor Rollback**
   - Watch the Events tab for rollback progress
   - Wait for service to restart (2-5 minutes)

6. **Verify Rollback**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

### Method 2: Via Git (Revert Commit)

```bash
# Revert the problematic commit
git revert <commit-hash>

# Push to main branch
git push origin main

# Render will automatically deploy the reverted version
```

### Method 3: Manual Rollback Script

```bash
# Run rollback script
./scripts/rollback-backend.sh <deployment-id>
```

---

## Database Rollback

### When to Rollback Database

- Data corruption
- Incorrect migration
- Accidental data deletion
- Schema changes causing issues

### MongoDB Atlas Rollback

#### Option 1: Point-in-Time Recovery (M10+ Clusters)

1. **Access MongoDB Atlas**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Select your cluster

2. **Navigate to Backups**
   - Click on **Backups** tab
   - Select **Point-in-Time Restore**

3. **Select Restore Point**
   - Choose timestamp before the issue
   - Click **Restore**

4. **Restore to New Cluster**
   - Creates a new cluster with restored data
   - Update connection string after restore
   - Switch application to new cluster

#### Option 2: Manual Backup Restore

```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." \
  --drop \
  ./backups/backup-YYYY-MM-DD
```

#### Option 3: Restore Specific Collections

```bash
# Restore only affected collections
mongorestore --uri="mongodb+srv://..." \
  --db=laraibcreative \
  --collection=products \
  ./backups/backup-YYYY-MM-DD/laraibcreative/products.bson
```

---

## Emergency Rollback Script

Create `scripts/emergency-rollback.sh`:

```bash
#!/bin/bash

# Emergency Rollback Script
# Use when quick rollback is needed

set -e

echo "=========================================="
echo "EMERGENCY ROLLBACK"
echo "=========================================="
echo ""

read -p "Are you sure you want to rollback? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Rollback cancelled."
  exit 0
fi

# Rollback Frontend
echo "Rolling back frontend..."
# Add Vercel CLI commands or API calls

# Rollback Backend
echo "Rolling back backend..."
# Add Render API calls or git revert

# Verify
echo "Verifying rollback..."
./scripts/verify-deployment.sh

echo "✅ Rollback complete!"
```

---

## Post-Rollback Verification

### Checklist

- [ ] **Frontend:**
  - [ ] Site loads correctly
  - [ ] No console errors
  - [ ] API calls working
  - [ ] Images loading
  - [ ] Authentication working

- [ ] **Backend:**
  - [ ] Health check responds
  - [ ] API endpoints working
  - [ ] Database connected
  - [ ] No error logs

- [ ] **Database:**
  - [ ] Data integrity verified
  - [ ] No missing records
  - [ ] Indexes intact

- [ ] **Integration:**
  - [ ] Frontend can connect to backend
  - [ ] CORS working
  - [ ] Authentication flow working
  - [ ] Critical user flows tested

### Verification Script

```bash
# Run post-rollback verification
./scripts/verify-deployment.sh

# Check specific endpoints
curl https://your-backend-url.com/api/health/detailed
curl https://www.laraibcreative.studio
```

---

## Rollback Decision Tree

```
Issue Detected
    │
    ├─ Frontend Issue?
    │   ├─ Yes → Rollback Frontend (Vercel)
    │   └─ No → Continue
    │
    ├─ Backend Issue?
    │   ├─ Yes → Rollback Backend (Render)
    │   └─ No → Continue
    │
    ├─ Database Issue?
    │   ├─ Yes → Restore Database Backup
    │   └─ No → Continue
    │
    └─ Multiple Issues?
        └─ Yes → Full Rollback (All Services)
```

---

## Prevention Strategies

### Before Deployment

1. **Test in Staging**
   - Deploy to staging first
   - Test all critical flows
   - Verify no regressions

2. **Feature Flags**
   - Use feature flags for new features
   - Enable gradually
   - Easy to disable if issues

3. **Database Migrations**
   - Test migrations on staging
   - Create backups before migration
   - Have rollback script ready

4. **Monitoring**
   - Set up alerts
   - Monitor error rates
   - Watch performance metrics

### During Deployment

1. **Gradual Rollout**
   - Deploy to small percentage first
   - Monitor for issues
   - Gradually increase

2. **Canary Deployments**
   - Deploy to subset of users
   - Monitor metrics
   - Rollback if issues detected

---

## Rollback Time Estimates

| Service | Method | Time Estimate |
|---------|--------|---------------|
| Frontend (Vercel) | Dashboard | 1-2 minutes |
| Frontend (Vercel) | Git Revert | 3-5 minutes |
| Backend (Render) | Dashboard | 2-5 minutes |
| Backend (Render) | Git Revert | 5-10 minutes |
| Database (Atlas) | Point-in-Time | 10-30 minutes |
| Database (Atlas) | Manual Restore | 15-45 minutes |

---

## Communication Plan

### During Rollback

1. **Notify Team**
   - Send alert to team chat
   - Explain the issue
   - Estimated resolution time

2. **Update Status Page**
   - Mark service as "degraded" or "down"
   - Provide estimated resolution time

3. **Post-Rollback**
   - Confirm rollback successful
   - Update status to "operational"
   - Document the issue and resolution

---

## Documentation

After rollback:

1. **Document the Issue**
   - What went wrong?
   - Why did it happen?
   - How was it resolved?

2. **Update Procedures**
   - Add to runbook
   - Update deployment checklist
   - Improve testing procedures

3. **Post-Mortem**
   - Schedule post-mortem meeting
   - Identify root cause
   - Implement preventive measures

---

## Quick Reference

### Frontend Rollback (Vercel)
```bash
# Via Dashboard
1. Vercel Dashboard → Deployments
2. Find previous deployment
3. Promote to Production

# Via CLI
vercel rollback [deployment-url]
```

### Backend Rollback (Render)
```bash
# Via Dashboard
1. Render Dashboard → Events
2. Find previous deployment
3. Rollback to this deploy

# Via Git
git revert <commit-hash>
git push origin main
```

### Database Rollback
```bash
# Point-in-Time (M10+)
MongoDB Atlas → Backups → Point-in-Time Restore

# Manual Restore
mongorestore --uri="..." ./backups/backup-YYYY-MM-DD
```

---

**Last Updated:** December 2024  
**Emergency Contact:** [Your Contact Information]

