# Security Improvements Implementation Guide
## Laraib Creative E-Commerce Platform

---

## 1. JWT TOKEN SECURITY

### Current Issue
Tokens stored in localStorage are vulnerable to XSS attacks.

### Solution: HttpOnly Cookies

**Backend Changes:**

```javascript
// backend/src/middleware/auth.middleware.js
const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,        // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    maxAge: maxAge,
    path: '/'
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth/refresh-token'
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
};

module.exports = { setAuthCookies, clearAuthCookies };
```

**Frontend Changes:**

```typescript
// frontend/src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Token is automatically sent via HttpOnly cookies
      const response = await api.auth.verifyToken();
      const user = response.data?.user || response.user;
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      const user = response.data?.user || response.user;
      
      if (user) {
        setUser(user);
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.auth.register(userData);
      const user = response.data?.user || response.user;
      
      if (user) {
        setUser(user);
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Backend will clear HttpOnly cookies
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updatedUser } : null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

## 2. INPUT VALIDATION & SANITIZATION

### Install Dependencies

```bash
npm install express-validator dompurify zod
npm install --save-dev @types/dompurify
```

### Backend Validation Middleware

```javascript
// backend/src/middleware/validation.middleware.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name contains invalid characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, numbers, and special characters'),
  
  body('phone')
    .matches(/^[0-9+\-\s()]{10,}$/)
    .withMessage('Invalid phone number'),
  
  body('whatsapp')
    .optional()
    .matches(/^[0-9+\-\s()]{10,}$/)
    .withMessage('Invalid WhatsApp number'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};
```

### Frontend Input Sanitization

```typescript
// frontend/src/lib/sanitization.ts
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain special characters (@$!%*?&)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

### Frontend Form Component with Validation

```typescript
// frontend/src/components/checkout/CustomerInfoForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { sanitizeInput, validateEmail, validatePhone } from '@/lib/sanitization';
import type { CustomerInfoFormProps } from '@/types/checkout-components';
import type { CustomerInfo } from '@/types/checkout';

export default function CustomerInfoForm({
  data = {},
  onUpdate,
  onNext,
  errors = {}
}: CustomerInfoFormProps) {
  const [localData, setLocalData] = useState<Partial<CustomerInfo>>(data);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>(errors);

  const handleChange = useCallback((field: keyof CustomerInfo, value: string) => {
    // Sanitize input
    const sanitized = sanitizeInput(value);
    
    setLocalData(prev => ({
      ...prev,
      [field]: sanitized
    }));

    // Clear error for this field
    if (localErrors[field]) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [localErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (localData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!localData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(localData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!localData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(localData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (localData.whatsapp && !validatePhone(localData.whatsapp)) {
      newErrors.whatsapp = 'Invalid WhatsApp number';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [localData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUpdate(localData as CustomerInfo);
      onNext();
    }
  }, [localData, validateForm, onUpdate, onNext]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localData.fullName ?? ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.fullName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {localErrors.fullName && (
          <p className="mt-1 text-sm text-red-600">{localErrors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={localData.email ?? ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your email"
        />
        {localErrors.email && (
          <p className="mt-1 text-sm text-red-600">{localErrors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={localData.phone ?? ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your phone number"
        />
        {localErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{localErrors.phone}</p>
        )}
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Number (Optional)
        </label>
        <input
          type="tel"
          value={localData.whatsapp ?? ''}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.whatsapp ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your WhatsApp number"
        />
        {localErrors.whatsapp && (
          <p className="mt-1 text-sm text-red-600">{localErrors.whatsapp}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
      >
        Continue to Shipping
      </button>
    </form>
  );
}
```

---

## 3. FILE UPLOAD SECURITY

### Backend File Validation

```javascript
// backend/src/middleware/fileUploadSecurity.middleware.js
const fileType = require('file-type');
const path = require('path');

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  pdf: ['application/pdf'],
  document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,      // 5MB
  pdf: 10 * 1024 * 1024,       // 10MB
  document: 5 * 1024 * 1024    // 5MB
};

/**
 * Validate file content and type
 */
const validateFileContent = async (file, allowedTypes = 'image') => {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZES[allowedTypes]) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZES[allowedTypes] / 1024 / 1024}MB`);
    }

    // Check file type by magic number
    const type = await fileType.fromBuffer(file.buffer);
    
    if (!type) {
      throw new Error('Unable to determine file type');
    }

    const allowedMimes = ALLOWED_MIME_TYPES[allowedTypes] || ALLOWED_MIME_TYPES.image;
    
    if (!allowedMimes.includes(type.mime)) {
      throw new Error(`File type ${type.mime} is not allowed. Allowed types: ${allowedMimes.join(', ')}`);
    }

    return {
      valid: true,
      mime: type.mime,
      ext: type.ext
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  // Remove path traversal attempts
  const sanitized = path.basename(filename);
  
  // Remove special characters
  return sanitized
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
};

module.exports = {
  validateFileContent,
  sanitizeFilename,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES
};
```

### Updated Upload Middleware

```javascript
// backend/src/middleware/upload.middleware.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { validateFileContent, sanitizeFilename } = require('./fileUploadSecurity.middleware');

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Validate file before upload
    const validation = await validateFileContent(file, 'image');
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return {
      folder: 'laraibcreative/products',
      public_id: sanitizeFilename(file.originalname),
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };
  }
});

const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  }
});

module.exports = { productUpload };
```

---

## 4. RATE LIMITING

### Install Dependencies

```bash
npm install express-rate-limit redis
```

### Rate Limiting Middleware

```javascript
// backend/src/middleware/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Auth endpoints rate limiter
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Register endpoint rate limiter
const registerLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:register:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  skipSuccessfulRequests: true,
  message: 'Too many registration attempts, please try again later'
});

// API endpoint rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  registerLimiter,
  apiLimiter
};
```

### Apply Rate Limiters to Routes

```javascript
// backend/src/routes/authRoutes.js
const express = require('express');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
```

---

## 5. SECURITY HEADERS

### Install Dependencies

```bash
npm install helmet
```

### Apply Security Headers

```javascript
// backend/src/server.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

module.exports = app;
```

---

## 6. ENVIRONMENT VARIABLES PROTECTION

### Create .env.example

```bash
# .env.example
# Copy this file to .env and fill in your values

# Database
MONGODB_URI=mongodb://localhost:27017/laraibcreative
MONGODB_USER=
MONGODB_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Environment
NODE_ENV=development
```

### Validate Environment Variables

```javascript
// backend/src/config/env.js
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = { validateEnv };
```

---

## 7. SECURE ERROR HANDLING

### Error Handler Middleware

```javascript
// backend/src/middleware/errorHandler.middleware.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error (but not sensitive data)
  logger.error('Error:', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    // Don't log sensitive data
    userId: req.user?._id
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  };

  res.status(err.status || 500).json(response);
};

module.exports = { errorHandler };
```

---

## 8. CSRF PROTECTION

### Install Dependencies

```bash
npm install csurf
```

### Apply CSRF Protection

```javascript
// backend/src/middleware/csrf.middleware.js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const csrfProtection = csrf({ cookie: false });

module.exports = { csrfProtection };
```

---

## Implementation Checklist

- [ ] Implement HttpOnly cookies for JWT tokens
- [ ] Add input validation and sanitization
- [ ] Implement file upload security
- [ ] Add rate limiting to sensitive endpoints
- [ ] Apply security headers
- [ ] Validate environment variables
- [ ] Implement secure error handling
- [ ] Add CSRF protection
- [ ] Enable HTTPS in production
- [ ] Set up security monitoring
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

**Status:** Ready for Implementation
**Priority:** Critical
**Estimated Time:** 2-3 days
