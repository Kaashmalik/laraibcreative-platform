# Comprehensive Testing Guide

## Overview

This guide provides complete documentation for the unit testing setup, test files, and best practices for the LaraibCreative frontend application.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Files](#test-files)
5. [Mock Data and Fixtures](#mock-data-and-fixtures)
6. [Coverage Reports](#coverage-reports)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)

## Setup and Configuration

### Installation

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

### Jest Configuration

The Jest configuration is in `jest.config.js`:

- **Test Environment**: `jest-environment-jsdom` for React components
- **Setup Files**: `jest.setup.js` for global mocks and configuration
- **Module Mapping**: Path aliases configured for `@/` imports
- **Coverage Thresholds**: 80% for branches, functions, lines, and statements

### Setup File

The `jest.setup.js` file includes:
- Next.js router mocks
- Next.js Image and Link component mocks
- localStorage and sessionStorage mocks
- IntersectionObserver and ResizeObserver mocks
- Global cleanup after each test

## Test Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── __mocks__/
│   │   │   └── test-utils.tsx       # Test utilities and helpers
│   │   ├── __fixtures__/
│   │   │   ├── cart.fixtures.ts     # Cart mock data
│   │   │   └── validation.fixtures.ts # Validation mock data
│   │   ├── store/
│   │   │   └── cartStore.test.ts    # Cart store tests
│   │   ├── hooks/
│   │   │   ├── useCart.test.tsx     # useCart hook tests
│   │   │   ├── useAuth.test.tsx     # useAuth hook tests
│   │   │   └── useDebounce.test.ts  # useDebounce hook tests
│   │   ├── lib/
│   │   │   ├── formatters.test.js   # Formatter function tests
│   │   │   ├── utils.test.js        # Utility function tests
│   │   │   └── api.test.js          # API client tests
│   │   └── validations/
│   │       └── product-schemas.test.ts # Validation schema tests
│   └── ...
├── jest.config.js                    # Jest configuration
└── jest.setup.js                     # Jest setup file
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test cartStore.test.ts

# Run tests matching a pattern
npm test -- cart

# Run tests in a specific directory
npm test -- __tests__/store
```

## Test Files

### 1. Cart Store Tests (`cartStore.test.ts`)

**Coverage**: Add, remove, update, calculate totals, promo codes, shipping

**Key Test Cases**:
- ✅ Add new item to cart
- ✅ Update quantity for existing item
- ✅ Handle customizations
- ✅ Validate quantity limits (1-99)
- ✅ Check stock availability
- ✅ Calculate totals (subtotal, tax, shipping, discount)
- ✅ Remove items
- ✅ Clear cart
- ✅ Apply/remove promo codes
- ✅ Calculate shipping
- ✅ Error handling
- ✅ Edge cases (empty cart, no stock limit, etc.)

### 2. Formatter Tests (`formatters.test.js`)

**Coverage**: All formatting utility functions

**Key Test Cases**:
- ✅ `formatCurrency` - Currency formatting with PKR
- ✅ `formatPhoneNumber` - Pakistani phone number formatting
- ✅ `formatOrderNumber` - Order number with LC prefix
- ✅ `formatFileSize` - Human-readable file sizes
- ✅ `formatTimeAgo` - Relative time formatting
- ✅ `formatMeasurement` - Measurement formatting
- ✅ `formatPercentage` - Percentage formatting
- ✅ `formatNumber` - Number with thousands separator
- ✅ `formatDateRange` - Date range formatting
- ✅ `formatAddress` - Address formatting
- ✅ `formatCardNumber` - Card number masking
- ✅ `formatName` - Name proper case formatting
- ✅ `formatPriceRange` - Price range formatting

### 3. Utils Tests (`utils.test.js`)

**Coverage**: Utility helper functions

**Key Test Cases**:
- ✅ `cn` - Class name merging with Tailwind
- ✅ `formatCurrency` - Currency formatting
- ✅ `formatDate` - Date formatting (short, medium, long, full)
- ✅ `truncateText` - Text truncation with ellipsis
- ✅ `generateSlug` - URL-friendly slug generation
- ✅ `debounce` - Function debouncing
- ✅ `throttle` - Function throttling
- ✅ `deepClone` - Deep object/array cloning
- ✅ `isEmpty` - Empty value checking
- ✅ `capitalize` - Text capitalization
- ✅ `generateId` - Random ID generation
- ✅ `generateSKU` - SKU generation

### 4. Validation Schema Tests (`product-schemas.test.ts`)

**Coverage**: Zod validation schemas

**Key Test Cases**:
- ✅ Valid product data passes validation
- ✅ Invalid data is rejected
- ✅ Required fields validation
- ✅ Format validation (design code, SKU)
- ✅ Range validation (price, stock)
- ✅ Optional fields handling

### 5. Hook Tests

#### useCart (`useCart.test.tsx`)

**Coverage**: Cart hook functionality

**Key Test Cases**:
- ✅ Returns cart state and actions
- ✅ Calls store methods correctly
- ✅ Handles errors gracefully
- ✅ Wraps store methods with error handling

#### useAuth (`useAuth.test.tsx`)

**Coverage**: Authentication hook

**Key Test Cases**:
- ✅ Throws error when used outside provider
- ✅ Returns auth context inside provider
- ✅ Handles login success/failure
- ✅ Handles logout
- ✅ Manages token in localStorage

#### useDebounce (`useDebounce.test.ts`)

**Coverage**: Debounce hook

**Key Test Cases**:
- ✅ Returns initial value immediately
- ✅ Debounces value changes
- ✅ Cancels previous timeout on rapid changes
- ✅ Respects delay parameter

### 6. API Tests (`api.test.js`)

**Coverage**: API client functions

**Key Test Cases**:
- ✅ Auth endpoints (login, register, logout)
- ✅ Product endpoints (getAll, getById)
- ✅ Cart endpoints (sync, applyPromoCode)
- ✅ Error handling (network errors, API errors)

## Mock Data and Fixtures

### Cart Fixtures (`cart.fixtures.ts`)

```typescript
- mockProducts: Array of test products with various stock levels
- mockCustomizations: Sample cart item customizations
- mockCartItems: Sample cart items
- mockEmptyCart: Empty cart state
- mockCartWithItems: Cart with items and calculated totals
```

### Validation Fixtures (`validation.fixtures.ts`)

```typescript
- validProductData: Valid product data for testing
- invalidProductData: Invalid product data for error testing
- validCustomOrderData: Valid custom order data
- invalidCustomOrderData: Invalid custom order data
- validCheckoutData: Valid checkout data
- invalidCheckoutData: Invalid checkout data
```

### Test Utilities (`test-utils.tsx`)

```typescript
- AllTheProviders: Wrapper component with all providers
- customRender: Custom render function with providers
- waitForAsync: Helper for async updates
- mockUser: Mock user data
- mockAdminUser: Mock admin user
- mockProduct: Mock product data
- mockCartItem: Mock cart item
- createMockProduct: Factory function for products
- createMockCartItem: Factory function for cart items
- createMockUser: Factory function for users
- createMockApiResponse: Factory for API responses
- createMockApiError: Factory for API errors
```

## Coverage Reports

### Generating Coverage

```bash
npm run test:coverage
```

### Coverage Thresholds

Configured in `jest.config.js`:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Report Location

Coverage reports are generated in `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- `coverage/coverage-final.json` - JSON format

### Interpreting Coverage

1. **Statements**: Percentage of code statements executed
2. **Branches**: Percentage of conditional branches executed
3. **Functions**: Percentage of functions called
4. **Lines**: Percentage of lines executed

### Improving Coverage

1. Identify uncovered code in the HTML report
2. Add test cases for uncovered branches
3. Test error scenarios
4. Test edge cases
5. Test boundary conditions

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22.x'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run tests
        working-directory: ./frontend
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
test:frontend:
  stage: test
  image: node:22
  cache:
    paths:
      - frontend/node_modules/
  script:
    - cd frontend
    - npm ci
    - npm run test:ci
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: frontend/coverage/cobertura-coverage.xml
```

### Vercel Integration

Add to `vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "testCommand": "cd frontend && npm run test:ci"
}
```

## Best Practices

### 1. Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### 2. Mocking

- Mock external dependencies (API, localStorage, etc.)
- Use fixtures for consistent test data
- Reset mocks between tests
- Mock at the appropriate level

### 3. Assertions

- Use specific matchers (`toBe`, `toEqual`, `toContain`)
- Test both positive and negative cases
- Test edge cases and boundary conditions
- Test error scenarios

### 4. Async Testing

- Use `async/await` for async operations
- Use `waitFor` for DOM updates
- Use `act` for state updates
- Handle promises correctly

### 5. Coverage

- Aim for >80% coverage
- Focus on critical business logic
- Don't sacrifice quality for coverage
- Review uncovered code regularly

### 6. Performance

- Keep tests fast (< 5 seconds total)
- Use `jest.useFakeTimers()` for time-dependent tests
- Avoid unnecessary async operations
- Clean up after tests

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check `jest.config.js` moduleNameMapper
   - Verify path aliases are correct

2. **Async test failures**
   - Use `waitFor` for async updates
   - Ensure proper cleanup

3. **Mock not working**
   - Check mock placement (before imports)
   - Verify mock implementation

4. **Coverage not generating**
   - Check `collectCoverageFrom` in config
   - Verify test files are being executed

## Next Steps

1. Add integration tests for complete user flows
2. Add E2E tests with Playwright or Cypress
3. Add visual regression tests
4. Set up test coverage badges
5. Add performance testing
6. Add accessibility testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: January 2024
**Maintained By**: Development Team

