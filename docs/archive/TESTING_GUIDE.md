# 🧪 Testing Guide

## Setup

### Install Dependencies

```bash
# Frontend
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Backend
cd backend
npm install --save-dev jest supertest @types/jest
```

### Configuration

#### Frontend Jest Config (`frontend/jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### Backend Jest Config (`backend/jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## Unit Tests

### Testing tRPC Routers

```typescript
// frontend/src/server/routers/__tests__/auth.test.ts
import { appRouter } from '../_app';
import { createContext } from '../../trpc-context';

describe('Auth Router', () => {
  it('should login user', async () => {
    const ctx = await createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
});
```

### Testing Zustand Stores

```typescript
// frontend/src/store/__tests__/authStore.test.ts
import { useAuthStore } from '../authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  it('should login user', async () => {
    const login = useAuthStore.getState().login;
    const result = await login('test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('should logout user', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    const logout = useAuthStore.getState().logout;
    
    await logout();
    
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
```

### Testing React Components

```typescript
// frontend/src/components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    _id: '1',
    title: 'Test Product',
    price: 1000,
  };

  it('should render product', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

## Integration Tests

### Testing API Endpoints

```javascript
// backend/src/__tests__/routes/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth Routes', () => {
  it('should register user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+923001234567',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Testing Database Operations

```javascript
// backend/src/__tests__/models/Tailor.test.js
const Tailor = require('../../models/Tailor');
const mongoose = require('mongoose');

describe('Tailor Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create tailor', async () => {
    const tailor = await Tailor.create({
      name: 'Test Tailor',
      email: 'tailor@example.com',
      phone: '+923001234567',
    });

    expect(tailor._id).toBeDefined();
    expect(tailor.name).toBe('Test Tailor');
  });

  it('should check capacity', async () => {
    const tailor = await Tailor.create({
      name: 'Test Tailor',
      email: 'tailor2@example.com',
      phone: '+923001234568',
      capacity: {
        maxOrdersPerDay: 5,
        currentOrders: 4,
      },
    });

    expect(tailor.hasCapacity).toBe(true);
  });
});
```

## E2E Tests

### Using Playwright

```typescript
// frontend/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('should complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.goto('/cart');
  await page.click('[data-testid="checkout"]');
  
  // Fill form
  await page.fill('[name="fullName"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="phone"]', '+923001234567');
  
  await page.click('[data-testid="place-order"]');
  
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

## Running Tests

```bash
# Frontend unit tests
cd frontend
npm test

# Frontend with coverage
npm run test:coverage

# Backend tests
cd backend
npm test

# E2E tests
cd frontend
npm run test:e2e
```

## Coverage Goals

- **Unit Tests**: 80% coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: Main user flows

## Test Files Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── __tests__/
│   ├── store/
│   │   └── __tests__/
│   └── server/
│       └── routers/
│           └── __tests__/
└── e2e/

backend/
├── src/
│   ├── __tests__/
│   ├── controllers/
│   │   └── __tests__/
│   ├── models/
│   │   └── __tests__/
│   └── services/
│       └── __tests__/
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Services**: Don't call real APIs in tests
3. **Use Test Database**: Separate test database
4. **Clean Up**: Clear data after tests
5. **Meaningful Names**: Descriptive test names
6. **AAA Pattern**: Arrange, Act, Assert

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

For more testing examples, see `INTEGRATION_EXAMPLES.md`.

