# Quick Start: Testing

## Installation

```bash
cd frontend
npm install
```

## Run Tests

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# CI mode (for continuous integration)
npm run test:ci
```

## Test Structure

```
src/__tests__/
├── store/          # Store tests (cartStore)
├── hooks/          # Custom hook tests
├── lib/            # Utility function tests
├── validations/    # Validation schema tests
├── __mocks__/      # Test utilities
└── __fixtures__/   # Mock data
```

## Coverage

Target: >80% coverage for:
- Branches
- Functions
- Lines
- Statements

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Documentation

- **TESTING_GUIDE.md** - Complete testing guide
- **TESTING_SUMMARY.md** - Implementation summary

## CI/CD

Tests run automatically on:
- Push to main/develop
- Pull requests

See `.github/workflows/test.yml` for configuration.

