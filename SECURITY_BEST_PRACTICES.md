# Security Best Practices Guide
## LaraibCreative E-commerce Platform

This document provides security best practices for developers working on the LaraibCreative platform.

---

## 1. Input Validation & Sanitization

### Always Validate User Input

```javascript
// ✅ GOOD: Use Joi validation
const { validateUserRegistration } = require('../middleware/validate.middleware');
router.post('/register', validateUserRegistration, register);

// ❌ BAD: No validation
router.post('/register', register);
```

### Sanitize All User Input

```javascript
// ✅ GOOD: Input is automatically sanitized by middleware
// The sanitizeInput middleware runs on all requests

// ❌ BAD: Using raw user input
const title = req.body.title; // Dangerous!
```

### Validate ObjectIds

```javascript
// ✅ GOOD: Validate ObjectId format
const { validateObjectId } = require('../middleware/validate.middleware');
router.get('/products/:id', validateObjectId('id'), getProduct);

// ❌ BAD: Direct use without validation
const product = await Product.findById(req.params.id);
```

---

## 2. Database Queries

### Use Mongoose Methods

```javascript
// ✅ GOOD: Parameterized query
const product = await Product.findById(id);
const user = await User.findOne({ email: email });

// ❌ BAD: Raw queries with user input
const query = `db.products.find({ title: "${req.body.title}" })`;
```

### Never Trust User Input in Queries

```javascript
// ✅ GOOD: Mongoose handles sanitization
const products = await Product.find({ category: categoryId });

// ❌ BAD: User input directly in query
const products = await Product.find({ $where: `this.title == "${userInput}"` });
```

---

## 3. Authentication & Authorization

### Always Check Authentication

```javascript
// ✅ GOOD: Use protect middleware
const { protect } = require('../middleware/auth.middleware');
router.get('/profile', protect, getProfile);

// ❌ BAD: No authentication check
router.get('/profile', getProfile);
```

### Check Authorization

```javascript
// ✅ GOOD: Check user role
const { protect, adminOnly } = require('../middleware/auth.middleware');
router.delete('/products/:id', protect, adminOnly, deleteProduct);

// ❌ BAD: No authorization check
router.delete('/products/:id', protect, deleteProduct);
```

### Verify User Ownership

```javascript
// ✅ GOOD: Verify user owns resource
const order = await Order.findById(orderId);
if (order.user.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Access denied' });
}

// ❌ BAD: No ownership check
const order = await Order.findById(orderId);
```

---

## 4. File Uploads

### Always Validate Files

```javascript
// ✅ GOOD: Use file upload security middleware
const { fileUploadSecurity } = require('../middleware/fileUploadSecurity.middleware');
router.post('/upload', 
  uploadMultiple('images', 10),
  fileUploadSecurity('product'),
  uploadImages
);

// ❌ BAD: No file validation
router.post('/upload', uploadMultiple('images', 10), uploadImages);
```

### Validate File Content

```javascript
// ✅ GOOD: Magic number validation is automatic
// The fileUploadSecurity middleware checks file content

// ❌ BAD: Trusting file extension only
if (file.originalname.endsWith('.jpg')) {
  // Accept file - DANGEROUS!
}
```

---

## 5. Error Handling

### Don't Leak Information

```javascript
// ✅ GOOD: Generic error message in production
res.status(500).json({
  success: false,
  message: process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'An error occurred'
});

// ❌ BAD: Exposing error details
res.status(500).json({
  error: err.message,
  stack: err.stack,
  database: err.databaseError
});
```

### Log Security Events

```javascript
// ✅ GOOD: Log security events
console.warn(`[Security] XSS attempt from ${req.ip}`);
console.warn(`[Security] MongoDB injection attempt in ${key}`);

// ❌ BAD: Silent failures
// No logging
```

---

## 6. Password Security

### Hash Passwords Properly

```javascript
// ✅ GOOD: bcrypt with 12 rounds (automatic in User model)
const user = await User.create({ email, password }); // Auto-hashed

// ❌ BAD: Plain text storage
const user = await User.create({ email, password: plainPassword });
```

### Validate Password Strength

```javascript
// ✅ GOOD: Password validation in schema
password: Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
  .required()

// ❌ BAD: No password requirements
password: Joi.string().required()
```

---

## 7. JWT Tokens

### Use Strong Secrets

```javascript
// ✅ GOOD: 32+ character secrets (validated at startup)
JWT_SECRET=your-very-long-and-random-secret-key-here-minimum-32-chars

// ❌ BAD: Short or weak secrets
JWT_SECRET=secret
```

### Set Appropriate Expiry

```javascript
// ✅ GOOD: Short-lived access tokens
{ expiresIn: '15m' } // Access token
{ expiresIn: '7d' }  // Refresh token

// ❌ BAD: Long-lived tokens
{ expiresIn: '30d' } // Too long!
```

---

## 8. API Security

### Implement Rate Limiting

```javascript
// ✅ GOOD: Rate limiting on all endpoints
const { generalLimiter, authLimiter } = require('../middleware/rateLimiter');
router.post('/login', authLimiter, login);
router.get('/products', generalLimiter, getProducts);

// ❌ BAD: No rate limiting
router.post('/login', login);
```

### Use HTTPS in Production

```javascript
// ✅ GOOD: HTTPS enforcement (automatic in production)
// The enforceHTTPS middleware checks for HTTPS

// ❌ BAD: Allowing HTTP in production
// No HTTPS check
```

---

## 9. CORS Configuration

### Whitelist Origins

```javascript
// ✅ GOOD: Specific origin whitelist
const allowedOrigins = [
  'https://laraibcreative.com',
  'https://www.laraibcreative.com'
];

// ❌ BAD: Allow all origins
origin: '*' // Dangerous!
```

---

## 10. Environment Variables

### Never Commit Secrets

```javascript
// ✅ GOOD: Use .env file (in .gitignore)
JWT_SECRET=your-secret-here
MONGODB_URI=mongodb://...

// ❌ BAD: Hardcoded secrets
const JWT_SECRET = 'my-secret-key'; // Never do this!
```

### Validate Environment Variables

```javascript
// ✅ GOOD: Validate at startup
require('./config/validateEnv')();

// ❌ BAD: No validation
// Missing env vars cause runtime errors
```

---

## 11. XSS Prevention

### Sanitize HTML Content

```javascript
// ✅ GOOD: Use sanitize middleware
// All input is automatically sanitized

// ❌ BAD: Output raw user input
res.json({ content: req.body.content }); // Dangerous if rendered as HTML!
```

### Use Content Security Policy

```javascript
// ✅ GOOD: CSP configured in Helmet
// Prevents inline scripts and styles

// ❌ BAD: No CSP
// Allows any script execution
```

---

## 12. CSRF Protection

### Use CSRF Tokens for Forms

```javascript
// ✅ GOOD: CSRF token required
const { csrfProtection, addCSRFToken } = require('../middleware/csrf.middleware');
router.get('/form', addCSRFToken, renderForm);
router.post('/submit', csrfProtection, submitForm);

// ❌ BAD: No CSRF protection
router.post('/submit', submitForm);
```

---

## 13. Security Headers

### Use Helmet.js

```javascript
// ✅ GOOD: Helmet configured (automatic in server.js)
// All security headers are set

// ❌ BAD: No security headers
// Vulnerable to various attacks
```

---

## 14. Logging & Monitoring

### Log Security Events

```javascript
// ✅ GOOD: Log security events
console.warn(`[Security] ${event} from ${req.ip}`);

// ❌ BAD: No security logging
// Can't detect attacks
```

### Monitor Failed Attempts

```javascript
// ✅ GOOD: Track failed login attempts
user.incLoginAttempts();
if (user.loginAttempts >= 5) {
  user.lockAccount();
}

// ❌ BAD: No account lockout
// Vulnerable to brute force
```

---

## 15. Dependency Management

### Keep Dependencies Updated

```bash
# ✅ GOOD: Regular updates
npm audit
npm update
npm audit fix

# ❌ BAD: Outdated packages
# May contain known vulnerabilities
```

### Review Security Advisories

```bash
# ✅ GOOD: Check for vulnerabilities
npm audit

# ❌ BAD: Ignore security warnings
```

---

## Checklist for New Features

When adding new features, ensure:

- [ ] Input validation with Joi schemas
- [ ] Input sanitization (automatic via middleware)
- [ ] Authentication check (if needed)
- [ ] Authorization check (if needed)
- [ ] Rate limiting (if public endpoint)
- [ ] Error handling (no information leakage)
- [ ] Security logging (for sensitive operations)
- [ ] File upload validation (if file uploads)
- [ ] ObjectId validation (if using IDs)
- [ ] CORS configuration (if new origins needed)

---

## Common Security Mistakes to Avoid

1. **Trusting User Input** - Always validate and sanitize
2. **Exposing Error Details** - Generic messages in production
3. **Weak Secrets** - Use strong, random secrets
4. **No Rate Limiting** - Implement on all endpoints
5. **Missing Authorization** - Check user permissions
6. **Insecure File Uploads** - Validate file type and content
7. **No HTTPS** - Enforce in production
8. **Weak Passwords** - Enforce complexity requirements
9. **Long-Lived Tokens** - Use short expiry times
10. **No Logging** - Log security events

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Last Updated:** December 2024

