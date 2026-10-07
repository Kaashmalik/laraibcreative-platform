# Integration Testing Guide

## Overview

Comprehensive integration and E2E testing suite for LaraibCreative platform covering all critical user flows.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Backend Integration Tests](#backend-integration-tests)
3. [Frontend E2E Tests](#frontend-e2e-tests)
4. [Test Database Setup](#test-database-setup)
5. [Running Tests](#running-tests)
6. [CI/CD Integration](#cicd-integration)

## Test Structure

```
backend/
├── src/__tests__/
│   ├── setup/
│   │   ├── test-db.js          # Database setup/teardown
│   │   ├── test-helpers.js     # Test utilities
│   │   ├── test-server.js      # Express app for testing
│   │   └── jest.setup.js       # Jest global setup
│   └── integration/
│       ├── user-flow.test.js           # Registration/login
│       ├── product-cart-flow.test.js   # Browse/add to cart
│       ├── checkout-flow.test.js       # Guest checkout
│       ├── custom-order-flow.test.js   # Custom orders
│       ├── order-status-flow.test.js   # Order tracking
│       ├── admin-product-flow.test.js # Admin product CRUD
│       └── admin-order-flow.test.js    # Admin order management

frontend/
├── e2e/
│   ├── auth-flow.spec.ts           # Auth E2E tests
│   ├── product-cart-flow.spec.ts  # Product/cart E2E
│   ├── checkout-flow.spec.ts      # Checkout E2E
│   ├── custom-order-flow.spec.ts  # Custom order E2E
│   ├── order-status-flow.spec.ts  # Order status E2E
│   ├── admin-product-flow.spec.ts # Admin product E2E
│   └── admin-order-flow.spec.ts   # Admin order E2E
└── playwright.config.ts            # Playwright config
```

## Backend Integration Tests

### Test Database Setup

**File**: `backend/src/__tests__/setup/test-db.js`

- Connects to separate test database
- Clears collections between tests
- Handles connection/disconnection

**Usage**:
```javascript
const { setupTestDB, teardownTestDB } = require('../setup/test-db');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});
```

### Test Helpers

**File**: `backend/src/__tests__/setup/test-helpers.js`

Provides:
- `createTestUser()` - Create test user
- `createTestAdmin()` - Create admin user
- `createTestProduct()` - Create test product
- `createTestOrder()` - Create test order
- `generateTestToken()` - Generate JWT token
- `getAuthHeaders()` - Get auth headers

### Test Flows

#### 1. User Registration and Login (`user-flow.test.js`)

**Tests**:
- ✅ Register new user
- ✅ Reject invalid email
- ✅ Reject weak password
- ✅ Reject duplicate email
- ✅ Login with valid credentials
- ✅ Reject invalid credentials
- ✅ Reject inactive user login
- ✅ Verify token
- ✅ Logout

#### 2. Product Browse and Cart (`product-cart-flow.test.js`)

**Tests**:
- ✅ Get all products
- ✅ Filter by category
- ✅ Filter by price range
- ✅ Search products
- ✅ Paginate products
- ✅ Get product by ID
- ✅ Add product to cart
- ✅ Update cart quantity
- ✅ Remove from cart
- ✅ Stock validation

#### 3. Guest Checkout (`checkout-flow.test.js`)

**Tests**:
- ✅ Create guest order
- ✅ Calculate order totals
- ✅ Reject order without items
- ✅ Reject invalid payment method
- ✅ Require COD receipt
- ✅ Track order by number

#### 4. Custom Order (`custom-order-flow.test.js`)

**Tests**:
- ✅ Create custom order
- ✅ Require design idea
- ✅ Require measurements
- ✅ Calculate estimated price
- ✅ Get user custom orders

#### 5. Order Status (`order-status-flow.test.js`)

**Tests**:
- ✅ Get user orders
- ✅ Filter by status
- ✅ Get order details
- ✅ Prevent viewing other user orders
- ✅ Track order (public)

#### 6. Admin Product Management (`admin-product-flow.test.js`)

**Tests**:
- ✅ Create product as admin
- ✅ Reject non-admin creation
- ✅ Validate required fields
- ✅ Update product
- ✅ Delete product
- ✅ Filter and search products

#### 7. Admin Order Management (`admin-order-flow.test.js`)

**Tests**:
- ✅ Get all orders as admin
- ✅ Filter orders
- ✅ Require admin role
- ✅ Update order status
- ✅ Reject invalid status
- ✅ Verify payment
- ✅ Reject payment
- ✅ Add admin notes
- ✅ Download invoice

## Frontend E2E Tests

### Playwright Configuration

**File**: `frontend/playwright.config.ts`

- Tests multiple browsers (Chrome, Firefox, Safari)
- Mobile testing (Pixel 5, iPhone 12)
- Auto-starts dev server
- Screenshots and videos on failure

### E2E Test Flows

#### 1. Authentication Flow (`auth-flow.spec.ts`)

**Tests**:
- Register new user
- Login with valid credentials
- Show error for invalid credentials
- Logout successfully

#### 2. Product and Cart Flow (`product-cart-flow.spec.ts`)

**Tests**:
- Browse products
- Filter by category
- Search products
- Add product to cart
- View cart
- Update quantity
- Remove item from cart

#### 3. Checkout Flow (`checkout-flow.spec.ts`)

**Tests**:
- Complete guest checkout
- Validate required fields
- Apply promo code
- Submit order successfully

#### 4. Custom Order Flow (`custom-order-flow.spec.ts`)

**Tests**:
- Complete custom order wizard
- Save and restore draft
- Navigate through all steps

#### 5. Order Status Flow (`order-status-flow.spec.ts`)

**Tests**:
- View order status
- Track order by number
- View order details

#### 6. Admin Product Flow (`admin-product-flow.spec.ts`)

**Tests**:
- Create new product
- Edit product
- Delete product

#### 7. Admin Order Flow (`admin-order-flow.spec.ts`)

**Tests**:
- View all orders
- Update order status
- Filter orders
- Download invoice

## Test Database Setup

### Environment Variables

Create `.env.test`:

```env
MONGODB_TEST_URI=mongodb://localhost:27017/laraibcreative-test
NODE_ENV=test
JWT_SECRET=test-secret-key
```

### Database Operations

**Setup**:
- Connects to test database
- Clears all collections
- Creates indexes

**Teardown**:
- Clears collections
- Disconnects from database

**Isolation**:
- Each test suite uses fresh database
- Collections cleared between suites
- No data leakage between tests

## Running Tests

### Backend Integration Tests

```bash
cd backend

# Run all integration tests
npm test

# Run specific test file
npm test user-flow.test.js

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

### Frontend E2E Tests

```bash
cd frontend

# Install Playwright browsers (first time)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test
npx playwright test auth-flow.spec.ts
```

## CI/CD Integration

### GitHub Actions

**File**: `.github/workflows/integration-tests.yml`

```yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22.x'
      - run: cd backend && npm ci
      - run: cd backend && npm test
        env:
          MONGODB_TEST_URI: mongodb://localhost:27017/laraibcreative-test

  frontend-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22.x'
      - uses: microsoft/playwright@v1
        with:
          browsers: chromium
      - run: cd frontend && npm ci
      - run: cd frontend && npm run test:e2e
    - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Authentication in Tests

### Backend Tests

```javascript
const { createTestUser, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');

const user = await createTestUser();
const token = generateTestToken(user._id, user.role);

const response = await request(app)
  .get('/api/v1/orders')
  .set(getAuthHeaders(token))
  .expect(200);
```

### Frontend E2E Tests

```typescript
// Login helper
async function loginAsUser(page, email = 'test@example.com', password = 'password123') {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*\/$|\/dashboard/i);
}
```

## Test Data Management

### Fixtures

**Backend**: Created dynamically in tests using helpers
**Frontend**: Use test data from API or create via UI

### Cleanup

- Backend: Automatic via `setupTestDB`/`teardownTestDB`
- Frontend: Tests are independent, no cleanup needed

## Best Practices

### 1. Test Isolation

- Each test should be independent
- No shared state between tests
- Clean database between suites

### 2. Realistic Data

- Use realistic test data
- Test with various data scenarios
- Include edge cases

### 3. Error Scenarios

- Test both success and failure paths
- Validate error messages
- Test boundary conditions

### 4. Performance

- Keep tests fast (< 30s per suite)
- Use parallel execution where possible
- Mock external services

### 5. Maintainability

- Use helper functions
- Reusable test utilities
- Clear test descriptions

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `MONGODB_TEST_URI` is set
   - Ensure MongoDB is running
   - Verify test database exists

2. **Authentication Failures**
   - Check JWT_SECRET matches
   - Verify token generation
   - Check user role in token

3. **Playwright Timeouts**
   - Increase timeout in config
   - Check dev server is running
   - Verify selectors are correct

4. **Test Failures**
   - Check test data setup
   - Verify API endpoints
   - Review error messages

## Coverage Goals

- **Backend**: >70% coverage
- **Frontend E2E**: All critical flows covered
- **Integration**: All API endpoints tested

## Next Steps

1. Add performance tests
2. Add load testing
3. Add visual regression tests
4. Add accessibility tests
5. Add security tests

---

**Last Updated**: January 2024
**Status**: ✅ Complete

