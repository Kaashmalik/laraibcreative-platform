# MongoDB Connection Guide & Troubleshooting

**Last Updated:** November 21, 2025  
**Status:** ✅ RESOLVED - Production login working

## Overview

This document provides a complete guide for MongoDB Atlas connection configuration, troubleshooting steps, and the final solution that resolved the production login issues for LaraibCreative platform.

## Table of Contents

1. [Problem Summary](#problem-summary)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Final Solution](#final-solution)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting Steps](#troubleshooting-steps)
6. [Health Check Verification](#health-check-verification)
7. [Connection String Examples](#connection-string-examples)
8. [Best Practices](#best-practices)

---

## Problem Summary

### Initial Issues
- ❌ **Route Error:** Frontend calling `/api/auth/login` instead of `/api/v1/auth/login`
- ❌ **Database Timeout:** `MongooseError: Operation users.findOne() buffering timed out after 10000ms`
- ❌ **Connection Failure:** Backend health check showing "database disconnected"
- ❌ **Login Failure:** Valid admin credentials returning "Invalid email or password"

### Working Locally vs Production
- ✅ **Local Environment:** Admin user login worked perfectly
- ❌ **Production (Render):** Same credentials failed with timeouts

---

## Root Cause Analysis

### 1. API Route Mismatch (Fixed)
**Problem:** Frontend was calling `/api/auth/*` instead of `/api/v1/auth/*`

**Solution:** Updated `frontend/src/lib/constants.js` and `AuthContext.jsx`
```javascript
// Fixed: Ensure API_BASE_URL always ends with /api/v1
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith('/api/v1') 
  ? process.env.NEXT_PUBLIC_API_URL 
  : `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
```

### 2. Windows-Specific DNS Fix Breaking Production (Fixed)
**Problem:** DNS fix for Windows was being applied on Linux servers

**Solution:** Modified `backend/server.js` to only apply DNS fix on Windows
```javascript
// Only load DNS fix on Windows
if (process.platform === 'win32') {
  try {
    require('./dns-fix');
  } catch (err) {
    // Ignore if file doesn't exist
  }
}
```

### 3. ReplicaSet Parameter Causing Connection Issues (Final Fix)
**Problem:** The `replicaSet=atlas-v3hc98-shard-0` parameter in the MongoDB connection string was causing connection failures on Render.

**Key Discovery:** The `check-user.js` script worked locally because it automatically removes the `replicaSet` parameter:
```javascript
// This made the script work locally
if (uri.includes('replicaSet=')) {
    console.log('Removing replicaSet param from URI for robustness...');
    uri = uri.replace(/&?replicaSet=[^&]+/, '');
}
```

---

## Final Solution ✅

### Updated MongoDB Connection String for Production

**Previous (Problematic):**
```
mongodb://laraibcreative:Kaash8111297%24@ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-01.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-02.nbtabul.mongodb.net:27017/laraibcreative?ssl=true&replicaSet=atlas-v3hc98-shard-0&authSource=admin&retryWrites=true&w=majority
```

**Fixed (Working):**
```
mongodb://laraibcreative:Kaash8111297%24@ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-01.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-02.nbtabul.mongodb.net:27017/laraibcreative?ssl=true&authSource=admin&retryWrites=true&w=majority
```

**Key Change:** Removed `&replicaSet=atlas-v3hc98-shard-0` parameter

### Why This Fixed It
1. **Stale ReplicaSet Name:** The replica set name in the connection string was outdated
2. **Cloud Platform Compatibility:** Direct node connections work better than replica set discovery on some cloud platforms
3. **Mongoose Auto-Discovery:** Mongoose automatically discovers the replica set topology once connected to any node

---

## Environment Configuration

### Local Development (.env)
```env
MONGODB_URI=mongodb://laraibcreative:Kaash8111297%24@ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-01.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-02.nbtabul.mongodb.net:27017/laraibcreative?ssl=true&authSource=admin&retryWrites=true&w=majority
NODE_ENV=development
JWT_SECRET=d3OdQFzsEj8kfYcVZtnmVWuXppFx2KTokWi/ywbToVE=
```

### Production (Render)
```env
MONGODB_URI=mongodb://laraibcreative:Kaash8111297%24@ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-01.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-02.nbtabul.mongodb.net:27017/laraibcreative?ssl=true&authSource=admin&retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=d3OdQFzsEj8kfYcVZtnmVWuXppFx2KTokWi/ywbToVE=
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://laraibcreative-backend.onrender.com
```

---

## Troubleshooting Steps

### 1. Check Health Endpoint
```bash
curl https://laraibcreative-backend.onrender.com/health
```

**Expected Response (Healthy):**
```json
{
  "success": true,
  "status": "OK",
  "message": "LaraibCreative API is running",
  "checks": {
    "database": {
      "status": "connected",
      "readyState": 1,
      "host": "ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net",
      "name": "laraibcreative"
    }
  }
}
```

**Problematic Response (Disconnected):**
```json
{
  "success": true,
  "status": "DEGRADED", 
  "message": "API is running but database is not connected",
  "checks": {
    "database": {
      "status": "disconnected",
      "readyState": 0,
      "host": "N/A",
      "name": "N/A"
    }
  }
}
```

### 2. Test User Credentials Locally
Use the diagnostic script to verify user exists and password is correct:

```bash
cd backend
node check-user.js laraibcreative.business@gmail.com AdminPassword123!
```

**Expected Output:**
```
✅ User found: Admin User
📧 Email: laraibcreative.business@gmail.com
🔑 Password 'AdminPassword123!' match: YES ✅
👤 Role: admin
✅ Account Status: Active & Email Verified
```

### 3. Check MongoDB Atlas Configuration

#### IP Whitelist
- Go to **MongoDB Atlas** → **Network Access**
- Ensure `0.0.0.0/0` (Allow from Anywhere) is added
- Status should be **Active**

#### Database User
- Go to **MongoDB Atlas** → **Database Access**
- Verify user `laraibcreative` exists
- Role should be `atlasAdmin@admin` or `readWriteAnyDatabase`

#### Cluster Status
- Go to **MongoDB Atlas** → **Database** → **Clusters**
- Status should be **Active** (green)
- If paused, it will auto-resume when accessed

### 4. Environment Variable Verification

#### For Render
1. Go to **Render Dashboard**
2. Select **laraibcreative-backend** service
3. Go to **Environment** tab
4. Verify `MONGODB_URI` matches the working connection string
5. Check `JWT_SECRET` is set

#### For Vercel (Frontend)
1. Go to **Vercel Dashboard**
2. Select **laraibcreative-platform** project
3. Go to **Settings** → **Environment Variables**
4. Verify `NEXT_PUBLIC_API_URL=https://laraibcreative-backend.onrender.com`

---

## Health Check Verification

### Backend Health Check
- **URL:** `https://laraibcreative-backend.onrender.com/health`
- **Expected:** `"status": "OK"` and `"database.status": "connected"`

### Frontend API Connection
- **Test Login:** Try logging in with admin credentials
- **Network Tab:** Check API calls go to correct `/api/v1/auth/login` endpoint
- **Response:** Should return JWT token on success

### Admin Credentials (Working)
- **Email:** `laraibcreative.business@gmail.com`
- **Password:** `AdminPassword123!`
- **Role:** `admin`

---

## Connection String Examples

### ✅ Working Connection Strings

#### Standard Format (Current)
```
mongodb://laraibcreative:Kaash8111297%24@ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-01.nbtabul.mongodb.net:27017,ac-lfwgrtb-shard-00-02.nbtabul.mongodb.net:27017/laraibcreative?ssl=true&authSource=admin&retryWrites=true&w=majority
```

#### SRV Format (Alternative)
```
mongodb+srv://laraibcreative:Kaash8111297%24@cluster0.vbnsui8.mongodb.net/laraibcreative?retryWrites=true&w=majority
```

### ❌ Problematic Connection Strings

#### With Stale ReplicaSet
```
mongodb://laraibcreative:Kaash8111297%24@ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net:27017/laraibcreative?replicaSet=atlas-v3hc98-shard-0&authSource=admin
```

#### Unencoded Password
```
mongodb://laraibcreative:Kaash8111297$@cluster0.mongodb.net/laraibcreative
```

### Parameter Explanations
- `ssl=true` - Enable SSL/TLS encryption
- `authSource=admin` - Authenticate against admin database
- `retryWrites=true` - Automatically retry write operations
- `w=majority` - Write concern (wait for majority acknowledgment)
- `%24` - URL-encoded `$` character in password

---

## Best Practices

### Connection String Management
1. **Always URL-encode passwords** containing special characters (`$` → `%24`)
2. **Avoid stale replicaSet parameters** - let Mongoose auto-discover
3. **Use explicit node lists** for better reliability on cloud platforms
4. **Include retry and write concern parameters** for production stability

### Environment Variables
1. **Never commit connection strings** to version control
2. **Use consistent variable names** across environments
3. **Validate environment variables** on application startup
4. **Keep production and development databases separate**

### Monitoring & Debugging
1. **Implement health check endpoints** for database connectivity
2. **Log masked connection strings** (hide passwords) for debugging
3. **Set up connection retry logic** with exponential backoff
4. **Monitor database connection status** in production

### Security
1. **Whitelist specific IPs** when possible (use `0.0.0.0/0` only for development)
2. **Use strong, unique passwords** for database users
3. **Enable SSL/TLS encryption** for all connections
4. **Rotate database credentials** regularly
5. **Use dedicated database users** per environment

---

## Quick Reference Commands

### Test Connection Locally
```bash
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
```

### Create Admin User
```bash
node backend/scripts/make-admin.js laraibcreative.business@gmail.com
```

### Check User Credentials
```bash
node backend/check-user.js laraibcreative.business@gmail.com AdminPassword123!
```

### Health Check
```bash
curl https://laraibcreative-backend.onrender.com/health | jq .checks.database
```

---

## Resolution Summary

✅ **Fixed Issues:**
1. API route mismatch (`/api/auth` → `/api/v1/auth`)
2. Windows DNS fix breaking Linux production
3. Stale `replicaSet` parameter causing connection failures

✅ **Working Configuration:**
- Admin user created and verified
- Database connection established
- Health checks passing
- Login functionality working

✅ **Production Status:**
- Backend: `https://laraibcreative-backend.onrender.com` ✅ Online
- Frontend: `https://laraibcreative.studio` ✅ Online
- Database: MongoDB Atlas ✅ Connected

**Total Resolution Time:** ~2 hours of debugging and testing

---

*This document serves as a complete reference for MongoDB connection issues and their solutions for the LaraibCreative platform.*