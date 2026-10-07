# Implementation Guide - Step by Step

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Variables

Add to `backend/.env`:
```env
# Sentry
SENTRY_DSN=your-backend-sentry-dsn
NODE_ENV=production

# JWT (if not already set)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=your-frontend-sentry-dsn
```

### 3. Initialize Sentry

**Backend** - Add to `server.js` (before routes):
```javascript
// At the top
const { initSentry, sentryRequestHandler, sentryErrorHandler } = require('./src/config/sentry');

// Initialize Sentry
initSentry();

// After app creation, before routes
app.use(sentryRequestHandler);

// After all routes, before error handler
app.use(sentryErrorHandler);
```

**Frontend** - Create `frontend/sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

Create `frontend/sentry.server.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});
```

### 4. Add Request ID Middleware

In `backend/server.js`, add after body parsing:
```javascript
const { requestIdMiddleware } = require('./src/middleware/requestId.middleware');
app.use(requestIdMiddleware);
```

### 5. Update Error Handler

Convert `backend/src/middleware/errorHandler.js` to use `AppError`:
```javascript
const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // If it's already an AppError, use it
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.toJSON(),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    });
  }

  // Convert other errors to AppError
  // ... (see MIGRATION_SUMMARY.md for full implementation)
};
```

## Next Steps

See `MIGRATION_SUMMARY.md` for the complete migration plan.

