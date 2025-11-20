/**
 * Security Middleware
 * Comprehensive security configurations for the application
 * 
 * Features:
 * - Helmet.js security headers
 * - CORS configuration
 * - HTTPS enforcement
 * - Request size limits
 * - Security error handling
 */

const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// ============================================
// HELMET CONFIGURATION
// ============================================

/**
 * Configure Helmet with security headers
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://res.cloudinary.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  
  // X-DNS-Prefetch-Control
  dnsPrefetchControl: true,
  
  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-Powered-By (remove)
  hidePoweredBy: true,
  
  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // Strict-Transport-Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Permissions-Policy
  permittedCrossDomainPolicies: false,
  
  // X-XSS-Protection (legacy, but still useful)
  xssFilter: true
});

// ============================================
// CORS CONFIGURATION
// ============================================

/**
 * CORS whitelist from environment
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://www.laraibcreative.studio',
      'https://laraibcreative.studio',
      process.env.FRONTEND_URL
    ].filter(Boolean);

/**
 * CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// ============================================
// HTTPS ENFORCEMENT
// ============================================

/**
 * Middleware to enforce HTTPS in production
 */
const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Check if request is secure
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.status(403).json({
        success: false,
        message: 'HTTPS required. Please use a secure connection.'
      });
    }
  }
  next();
};

// ============================================
// REQUEST SIZE LIMITS
// ============================================

/**
 * Body parser size limits
 */
const bodyParserLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true }
};

// ============================================
// SECURITY MIDDLEWARE STACK
// ============================================

/**
 * Apply all security middleware
 */
const applySecurityMiddleware = (app) => {
  // 1. Helmet security headers (must be first)
  app.use(helmetConfig);
  
  // 2. CORS (before routes)
  app.use(cors(corsOptions));
  
  // 3. MongoDB injection protection
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`[Security] Sanitized MongoDB injection attempt in ${key} from IP: ${req.ip}`);
    }
  }));
  
  // 4. HTTP Parameter Pollution protection
  app.use(hpp({
    whitelist: [
      'page',
      'limit',
      'sort',
      'fields',
      'category',
      'price',
      'rating'
    ]
  }));
  
  // 6. HTTPS enforcement (production only)
  if (process.env.NODE_ENV === 'production') {
    app.use(enforceHTTPS);
  }
  
  return app;
};

// ============================================
// SECURITY ERROR HANDLER
// ============================================

/**
 * Security-specific error handler
 * Prevents information leakage
 */
const securityErrorHandler = (err, req, res, next) => {
  // Log security errors
  if (err.name === 'CORS' || err.message.includes('CORS')) {
    console.warn(`[Security] CORS violation from ${req.ip}: ${req.headers.origin}`);
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation. Request blocked.'
    });
  }
  
  // MongoDB injection attempt
  if (err.message && err.message.includes('mongo')) {
    console.warn(`[Security] MongoDB injection attempt from ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid request format.'
    });
  }
  
  // XSS attempt
  if (err.message && err.message.includes('xss')) {
    console.warn(`[Security] XSS attempt from ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected.'
    });
  }
  
  next(err);
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  helmetConfig,
  corsOptions,
  enforceHTTPS,
  bodyParserLimits,
  applySecurityMiddleware,
  securityErrorHandler,
  allowedOrigins
};

