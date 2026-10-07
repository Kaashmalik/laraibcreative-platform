# LaraibCreative Testing Checklist
**Version:** 2.0
**Date:** January 9, 2026

---

## Overview

This checklist provides comprehensive testing procedures for the LaraibCreative platform after the audit and implementation fixes.

---

## Pre-Testing Setup

### Environment Setup
- [ ] Backend server is running (`npm run dev`)
- [ ] Frontend server is running (`npm run dev`)
- [ ] MongoDB is connected
- [ ] Redis is connected (optional but recommended)
- [ ] Environment variables are configured
- [ ] Sentry DSN is configured (optional but recommended)

### Database Setup
- [ ] MongoDB collections exist
- [ ] Database indexes are created
- [ ] Seed data is loaded (if needed)

### Dependencies
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] No missing dependencies in package.json

---

## Authentication Flow Testing

### Registration
- [ ] Navigate to `/auth/register`
- [ ] Fill in all required fields (fullName, email, password, phone)
- [ ] Password strength indicator shows correct strength
- [ ] Password confirmation matches password
- [ ] Terms of service checkbox is checked
- [ ] Click "Create Account" button
- [ ] Loading spinner appears
- [ ] Success toast appears: "Registration successful! Please verify your email."
- [ ] Redirected to `/auth/verify-email`
- [ ] User cannot login without email verification
- [ ] User receives verification email (check email service)
- [ ] Duplicate email registration fails with error message

### Email Verification
- [ ] Navigate to `/auth/verify-email`
- [ ] Click verification link from email
- [ ] Page shows "Email Verified Successfully" message
- [ ] User can now login
- [ ] "Resend Verification Email" button works
- [ ] Expired token shows appropriate error
- [ ] Invalid token shows appropriate error

### Login
- [ ] Navigate to `/auth/login`
- [ ] Enter correct email and password
- [ ] Click "Sign In" button
- [ ] Loading spinner appears
- [ ] Success toast appears: "Login successful! Redirecting..."
- [ ] Redirected to `/account` or intended page
- [ ] User can access protected routes
- [ ] Cookies are set (accessToken, refreshToken)

#### Login - Negative Cases
- [ ] Incorrect email shows error
- [ ] Incorrect password shows error
- [ ] Empty fields show validation errors
- [ ] Non-existent email shows error
- [ ] Locked account shows appropriate error

### Logout
- [ ] Click logout button
- [ ] Success toast appears
- [ ] Redirected to home page
- [ ] Cookies are cleared
- [ ] Cannot access protected routes (redirects to login)
- [ ] Return URL is preserved for post-login redirect

### Password Reset
- [ ] Navigate to `/auth/forgot-password`
- [ ] Enter email address
- [ ] Click "Send Reset Link"
- [ ] Success message appears
- [ ] User receives password reset email
- [ ] Click reset link from email
- [ ] Navigate to `/auth/reset-password?token=...`
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Password validation works (min 8 chars)
- [ ] Passwords match validation works
- [ ] Click "Reset Password"
- [ ] Success message appears
- [ ] Can login with new password
- [ ] Old password no longer works

#### Password Reset - Negative Cases
- [ ] Invalid/expired token shows error
- [ ] Passwords don't match shows error
- [ ] Password too short shows error
- [ ] Non-existent email shows success (security best practice)

### Token Refresh
- [ ] Access token expires after 15 minutes
- [ ] Refresh token is valid for 7 days
- [ ] Automatic token refresh on 401 error
- [ ] Request is retried after refresh
- [ ] User is not logged out during refresh
- [ ] Refresh token expiration redirects to login
- [ ] Multiple refresh attempts work correctly

---

## UI Components Testing

### Profile Form
- [ ] Navigate to `/account/profile`
- [ ] Form loads with current user data
- [ ] Profile image displays correctly
- [ ] All fields are editable (except email)
- [ ] Profile image upload button works
- [ ] Image preview shows after selection
- [ ] Click "Save Changes"
- [ ] Loading spinner appears
- [ ] Success message appears
- [ ] Data is updated in database
- [ ] Form shows updated data on reload
- [ ] Validation errors display for invalid data

### Address Form
- [ ] Navigate to `/account/addresses`
- [ ] Existing addresses display
- [ ] Click "Add Address"
- [ ] Form appears with animation
- [ ] All fields are required (except addressLine2, whatsapp)
- [ ] Province dropdown has all Pakistan provinces
- [ ] City dropdown has major cities
- [ ] "Set as default" checkbox works
- [ ] Click "Add Address"
- [ ] Success message appears
- [ ] Address appears in list
- [ ] Can edit existing address
- [ ] Can delete existing address
- [ ] Can set default address
- [ ] Default address indicator shows correctly

### Measurement Form
- [ ] Navigate to `/account/measurements`
- [ ] Existing measurement profiles display
- [ ] Click "New Profile"
- [ ] Form appears with animation
- [ ] Profile name is required
- [ ] Size label dropdown works
- [ ] Upper body measurements section displays
- [ ] Lower body measurements section displays
- [ ] Dupatta measurements section displays
- [ ] All measurements accept decimal values
- [ ] Measurements are in inches
- [ ] Click "Save Profile"
- [ ] Success message appears
- [ ] Profile appears in list
- [ ] Can edit existing profile
- [ ] Can delete existing profile
- [ ] Can use profile measurements
- [ ] Profile shows measurement count

---

## API Testing

### Authentication Endpoints

#### POST /api/v1/auth/register
- [ ] Valid registration returns 201
- [ ] Response contains user data
- [ ] Response contains success message
- [ ] Duplicate email returns 409
- [ ] Invalid data returns 422
- [ ] Password validation works
- [ ] Email validation works
- [ ] Phone validation works

#### POST /api/v1/auth/login
- [ ] Valid credentials return 200
- [ ] Response contains user data
- [ ] Cookies are set (accessToken, refreshToken)
- [ ] Invalid credentials return 401
- [ ] Non-existent user returns 401
- [ ] Locked account returns 403
- [ ] Unverified account returns 403

#### POST /api/v1/auth/logout
- [ ] Authenticated request returns 200
- [ ] Cookies are cleared
- [ ] Unauthenticated request returns 401

#### POST /api/v1/auth/refresh-token
- [ ] Valid refresh token returns 200
- [ ] New access token is set
- [ ] Invalid refresh token returns 401
- [ ] Expired refresh token returns 401

#### GET /api/v1/auth/me
- [ ] Authenticated request returns 200
- [ ] Response contains user data
- [ ] Unauthenticated request returns 401
- [ ] Expired token returns 401

#### PUT /api/v1/auth/profile
- [ ] Valid update returns 200
- [ ] Response contains updated user data
- [ ] Email cannot be changed
- [ ] Unauthenticated request returns 401
- [ ] Invalid data returns 422

#### POST /api/v1/auth/forgot-password
- [ ] Valid email returns 200
- [ ] Reset email is sent
- [ ] Non-existent email returns 200 (security)
- [ ] Invalid email returns 422

#### POST /api/v1/auth/reset-password
- [ ] Valid token returns 200
- [ ] Password is updated
- [ ] Invalid token returns 400
- [ ] Expired token returns 400
- [ ] Password validation works

#### GET /api/v1/auth/verify-email/:token
- [ ] Valid token returns 200
- [ ] User is verified
- [ ] Invalid token returns 400
- [ ] Expired token returns 400

#### POST /api/v1/auth/resend-verification
- [ ] Authenticated request returns 200
- [ ] Verification email is sent
- [ ] Unauthenticated request returns 401
- [ ] Already verified user returns 400

### Product Endpoints

#### GET /api/v1/products
- [ ] Returns 200 status
- [ ] Response contains products array
- [ ] Pagination works (page, limit)
- [ ] Filtering works (category, fabric, price, etc.)
- [ ] Sorting works (price-asc, price-desc, newest, popular)
- [ ] Search works
- [ ] Cache headers present
- [ ] Response time is acceptable (< 500ms)

#### GET /api/v1/products/featured
- [ ] Returns 200 status
- [ ] Returns only featured products
- [ ] Limit parameter works
- [ ] Cache headers present

#### GET /api/v1/products/new-arrivals
- [ ] Returns 200 status
- [ ] Returns only new arrivals
- [ ] Limit parameter works
- [ ] Cache headers present

#### GET /api/v1/products/best-sellers
- [ ] Returns 200 status
- [ ] Returns only best sellers
- [ ] Limit parameter works
- [ ] Cache headers present

#### GET /api/v1/products/:id
- [ ] Valid ID returns 200
- [ ] Response contains product data
- [ ] Invalid ID returns 404
- [ ] Cache headers present

#### GET /api/v1/products/slug/:slug
- [ ] Valid slug returns 200
- [ ] Response contains product data
- [ ] Invalid slug returns 404
- [ ] Cache headers present

### Order Endpoints

#### POST /api/v1/orders
- [ ] Valid order returns 201
- [ ] Response contains order data
- [ ] Order number is generated
- [ ] Guest checkout works
- [ ] Authenticated checkout works
- [ ] Validation works for required fields
- [ ] Pricing calculation is correct
- [ ] Shipping fee is calculated
- [ ] Total is correct
- [ ] Invalid data returns 422

#### GET /api/v1/orders
- [ ] Authenticated request returns 200
- [ ] Returns user's orders
- [ ] Pagination works
- [ ] Status filtering works
- [ ] Unauthenticated request returns 401

#### GET /api/v1/orders/:id
- [ ] Valid ID returns 200
- [ ] Returns order details
- [ ] User can only access own orders
- [ ] Invalid ID returns 404
- [ ] Unauthorized access returns 403

#### PATCH /api/v1/orders/:id/cancel
- [ ] Valid cancellation returns 200
- [ ] Order status is updated
- [ ] User can only cancel own orders
- [ ] Cannot cancel completed orders
- [ ] Cannot cancel shipped orders
- [ ] Unauthenticated request returns 401

### Cart Endpoints

#### GET /api/v1/cart
- [ ] Authenticated request returns 200
- [ ] Returns cart data
- [ ] Returns items array
- [ ] Returns subtotal
- [ ] Returns total items
- [ ] Unauthenticated request returns 401

#### POST /api/v1/cart/items
- [ ] Valid item returns 201
- [ ] Item is added to cart
- [ ] Cart is updated
- [ ] Duplicate items update quantity
- [ ] Unauthenticated request returns 401
- [ ] Invalid product returns 404

#### PUT /api/v1/cart/items/:itemId
- [ ] Valid update returns 200
- [ ] Quantity is updated
- [ ] Item is removed if quantity is 0
- [ ] Unauthenticated request returns 401
- [ ] Invalid item returns 404

#### DELETE /api/v1/cart/items/:itemId
- [ ] Valid deletion returns 200
- [ ] Item is removed
- [ ] Cart is updated
- [ ] Unauthenticated request returns 401
- [ ] Invalid item returns 404

### Address Endpoints

#### GET /api/v1/auth/addresses
- [ ] Authenticated request returns 200
- [ ] Returns addresses array
- [ ] Default address is marked
- [ ] Unauthenticated request returns 401

#### POST /api/v1/auth/addresses
- [ ] Valid address returns 201
- [ ] Address is created
- [ ] Validation works
- [ ] Unauthenticated request returns 401
- [ ] Invalid data returns 422

#### PUT /api/v1/auth/addresses/:id
- [ ] Valid update returns 200
- [ ] Address is updated
- [ ] User can only update own addresses
- [ ] Unauthenticated request returns 401
- [ ] Invalid ID returns 404

#### DELETE /api/v1/auth/addresses/:id
- [ ] Valid deletion returns 200
- [ ] Address is deleted
- [ ] User can only delete own addresses
- [ ] Cannot delete default address
- [ ] Unauthenticated request returns 401

#### PATCH /api/v1/auth/addresses/:id/default
- [ ] Valid update returns 200
- [ ] Address is set as default
- [ ] Previous default is unset
- [ ] Unauthenticated request returns 401
- [ ] Invalid ID returns 404

### Measurement Endpoints

#### GET /api/v1/auth/measurements
- [ ] Authenticated request returns 200
- [ ] Returns profiles array
- [ ] Unauthenticated request returns 401

#### POST /api/v1/auth/measurements
- [ ] Valid profile returns 201
- [ ] Profile is created
- [ ] Validation works
- [ ] Unauthenticated request returns 401
- [ ] Invalid data returns 422

#### PUT /api/v1/auth/measurements/:id
- [ ] Valid update returns 200
- [ ] Profile is updated
- [ ] User can only update own profiles
- [ ] Unauthenticated request returns 401
- [ ] Invalid ID returns 404

#### DELETE /api/v1/auth/measurements/:id
- [ ] Valid deletion returns 200
- [ ] Profile is deleted
- [ ] User can only delete own profiles
- [ ] Unauthenticated request returns 401
- [ ] Invalid ID returns 404

---

## Security Testing

### CSRF Protection
- [ ] CSRF token is generated
- [ ] CSRF token is included in response headers
- [ ] CSRF token is required for state-changing requests
- [ ] Invalid CSRF token returns 403
- [ ] Missing CSRF token returns 403
- [ ] GET requests don't require CSRF token

### Rate Limiting
- [ ] Rate limit headers are present
- [ ] Rate limit is enforced
- [ ] Rate limit exceeded returns 429
- [ ] Rate limit resets after window
- [ ] Different endpoints have different limits

### Input Sanitization
- [ ] XSS attacks are prevented
- [ ] SQL injection is prevented
- [ ] NoSQL injection is prevented
- [ ] Malicious input is sanitized

### Authentication Security
- [ ] httpOnly cookies are set
- [ ] Secure cookies are set in production
- [ ] SameSite cookies are set
- [ ] JWT tokens expire
- [ ] Refresh tokens work
- [ ] Account locking works
- [ ] Password hashing works

---

## Performance Testing

### Response Times
- [ ] API responses < 500ms (average)
- [ ] API responses < 1000ms (95th percentile)
- [ ] API responses < 2000ms (99th percentile)
- [ ] Page load time < 3 seconds
- [ ] Time to interactive < 4 seconds

### Caching
- [ ] Redis cache is working
- [ ] Cache hit rate > 70%
- [ ] Cache invalidation works
- [ ] Cache headers are present
- [ ] Cache TTL is appropriate

### Database Performance
- [ ] Queries are indexed
- [ ] Slow queries < 100ms
- [ ] Connection pooling works
- [ ] No N+1 queries

---

## Error Handling Testing

### Client-Side Errors
- [ ] Network errors show toast
- [ ] Validation errors show inline
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission denied
- [ ] 404 errors show not found
- [ ] 500 errors show generic message

### Server-Side Errors
- [ ] Errors are logged
- [ ] Errors are sent to Sentry
- [ ] Error responses are consistent
- [ ] Stack traces hidden in production
- [ ] Request IDs are logged

---

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet
- [ ] Firefox Mobile

---

## Responsive Design Testing

### Desktop (1920x1080)
- [ ] Layout is correct
- [ ] All elements are visible
- [ ] No horizontal scroll
- [ ] Images are optimized

### Tablet (768x1024)
- [ ] Layout adapts correctly
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Touch targets are adequate

### Mobile (375x667)
- [ ] Layout is responsive
- [ ] Mobile menu works
- [ ] Forms are usable
- [ ] Touch targets are > 44px
- [ ] No horizontal scroll

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Skip links work

### Screen Reader
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] ARIA labels are present
- [ ] Semantic HTML is used

### Color Contrast
- [ ] Text contrast ratio > 4.5:1
- [ ] Large text contrast ratio > 3:1
- [ ] Color is not the only indicator

---

## Integration Testing

### End-to-End Flows

#### Registration to Order Flow
- [ ] Register new account
- [ ] Verify email
- [ ] Login
- [ ] Browse products
- [ ] Add product to cart
- [ ] Add address
- [ ] Add measurements
- [ ] Proceed to checkout
- [ ] Complete order
- [ ] View order details

#### Guest Checkout Flow
- [ ] Browse products
- [ ] Add product to cart
- [ ] Proceed to checkout as guest
- [ ] Enter email and phone
- [ ] Add address
- [ ] Complete order
- [ ] Create account from order

#### Password Reset Flow
- [ ] Request password reset
- [ ] Receive email
- [ ] Reset password
- [ ] Login with new password

---

## Load Testing

### Concurrent Users
- [ ] 10 concurrent users work
- [ ] 50 concurrent users work
- [ ] 100 concurrent users work
- [ ] 500 concurrent users work

### Requests Per Second
- [ ] 10 RPS works
- [ ] 50 RPS works
- [ ] 100 RPS works
- [ ] 500 RPS works

---

## Deployment Testing

### Staging Environment
- [ ] All tests pass on staging
- [ ] Environment variables are configured
- [ ] Database migrations run
- [ ] Redis is connected
- [ ] Sentry is configured
- [ ] Performance is acceptable

### Production Environment
- [ ] All tests pass on production
- [ ] SSL certificate is valid
- [ ] CDN is configured
- [ ] Monitoring is working
- [ ] Error tracking is working
- [ ] Performance is acceptable

---

## Documentation Testing

### API Documentation
- [ ] All endpoints are documented
- [ ] Examples are correct
- [ ] Error codes are documented
- [ ] Authentication is documented

### User Documentation
- [ ] Setup guide is complete
- [ ] Deployment guide is complete
- [ ] Troubleshooting guide is complete

---

## Final Checklist

### Before Release
- [ ] All critical tests pass
- [ ] All high-priority tests pass
- [ ] All medium-priority tests pass
- [ ] No critical bugs
- [ ] No high-priority bugs
- [ ] Performance is acceptable
- [ ] Security is adequate
- [ ] Documentation is complete

### After Release
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Fix any critical issues
- [ ] Plan next release

---

## Test Results

### Summary
- **Total Tests:** 200+
- **Passed:** ___
- **Failed:** ___
- **Skipped:** ___
- **Pass Rate:** ___%

### Critical Issues
- [ ] None
- [ ] Issue #1: ___
- [ ] Issue #2: ___

### High Priority Issues
- [ ] None
- [ ] Issue #1: ___
- [ ] Issue #2: ___

### Medium Priority Issues
- [ ] None
- [ ] Issue #1: ___
- [ ] Issue #2: ___

---

**Test Date:** ___
**Tested By:** ___
**Next Test Date:** ___
