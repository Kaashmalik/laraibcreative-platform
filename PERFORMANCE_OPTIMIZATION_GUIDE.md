# Performance Optimization Guide
## Laraib Creative E-Commerce Platform

---

## 1. FRONTEND PERFORMANCE

### 1.1 Image Optimization

#### Current Issue
```javascript
// ❌ Bad - No optimization
<img src={item.image} alt={item.title} className="w-full h-full object-cover" />
```

#### Solution: Use Next.js Image Component

```typescript
// ✅ Good - Optimized
import Image from 'next/image';

<Image
  src={item.image}
  alt={item.title}
  width={400}
  height={400}
  loading="lazy"
  quality={75}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="w-full h-full object-cover"
/>
```

#### Implementation for Product Images

```typescript
// frontend/src/components/ProductImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  width = 400,
  height = 400,
  priority = false
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative bg-gray-100 overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={75}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoadingComplete={() => setIsLoading(false)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

### 1.2 Component Memoization

#### Current Issue
```typescript
// ❌ Bad - Re-renders on every parent render
export default function OrderItem({ item, onRemove }) {
  return (
    <div>
      <h4>{item.title}</h4>
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </div>
  );
}
```

#### Solution: Use React.memo

```typescript
// ✅ Good - Only re-renders if props change
import { memo, useCallback } from 'react';

interface OrderItemProps {
  item: CartItem;
  onRemove: (id: string) => void;
}

const OrderItem = memo(function OrderItem({ item, onRemove }: OrderItemProps) {
  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <div>
      <h4>{item.title}</h4>
      <button onClick={handleRemove}>Remove</button>
    </div>
  );
});

export default OrderItem;
```

### 1.3 Callback Optimization

#### Current Issue
```typescript
// ❌ Bad - New function created on every render
const handleNext = () => {
  if (validateStep(currentStep)) {
    setCurrentStep(currentStep + 1);
  }
};
```

#### Solution: Use useCallback

```typescript
// ✅ Good - Function memoized
const handleNext = useCallback(() => {
  if (validateStep(currentStep)) {
    setCurrentStep(currentStep + 1);
  }
}, [currentStep, validateStep]);
```

### 1.4 State Management Optimization

#### Current Issue
```typescript
// ❌ Bad - Entire form re-renders on any field change
const [formData, setFormData] = useState({
  customerInfo: { fullName: '', email: '', phone: '' },
  shippingAddress: { fullAddress: '', city: '', province: '' },
  payment: { method: 'bank-transfer' }
});

const updateFormData = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};
```

#### Solution: Split State

```typescript
// ✅ Good - Only affected components re-render
const [customerInfo, setCustomerInfo] = useState({
  fullName: '',
  email: '',
  phone: ''
});

const [shippingAddress, setShippingAddress] = useState({
  fullAddress: '',
  city: '',
  province: ''
});

const [payment, setPayment] = useState({
  method: 'bank-transfer'
});

const updateCustomerInfo = useCallback((field, value) => {
  setCustomerInfo(prev => ({
    ...prev,
    [field]: value
  }));
}, []);
```

### 1.5 Code Splitting

#### Implement Dynamic Imports

```typescript
// frontend/src/app/(customer)/checkout/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const OrderReview = dynamic(() => import('@/components/checkout/OrderReview'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded" />
});

const PaymentMethod = dynamic(() => import('@/components/checkout/PaymentMethod'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded" />
});

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {currentStep === 3 && <PaymentMethod {...props} />}
      {currentStep === 4 && <OrderReview {...props} />}
    </Suspense>
  );
}
```

### 1.6 Bundle Size Optimization

#### Analyze Bundle

```bash
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... next config
});

# Run analysis
ANALYZE=true npm run build
```

#### Tree Shaking

```typescript
// ❌ Bad - Imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ Good - Imports only needed function
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);
```

---

## 2. BACKEND PERFORMANCE

### 2.1 Database Query Optimization

#### Current Issue
```javascript
// ❌ Bad - N+1 query problem
const orders = await Order.find();
for (const order of orders) {
  const user = await User.findById(order.userId); // Query in loop!
  order.user = user;
}
```

#### Solution: Use Populate

```javascript
// ✅ Good - Single query with join
const orders = await Order.find()
  .populate('userId', 'fullName email phone')
  .lean(); // Returns plain objects, faster
```

#### Implement Indexes

```javascript
// backend/src/models/Order.js
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, index: true },
  createdAt: { type: Date, index: true },
  // ... other fields
});

// Compound index for common queries
orderSchema.index({ userId: 1, createdAt: -1 });
```

### 2.2 Pagination

#### Implement Pagination

```javascript
// backend/src/controllers/orderController.js
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments();

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 2.3 Caching

#### Implement Redis Caching

```javascript
// backend/src/middleware/cache.middleware.js
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 60) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    client.get(key, (err, data) => {
      if (err) throw err;

      if (data) {
        res.json(JSON.parse(data));
      } else {
        res.sendResponse = res.json;
        res.json = (body) => {
          client.setex(key, duration, JSON.stringify(body));
          res.sendResponse(body);
        };
        next();
      }
    });
  };
};

module.exports = { cacheMiddleware };
```

#### Use Caching in Routes

```javascript
// backend/src/routes/productRoutes.js
const { cacheMiddleware } = require('../middleware/cache.middleware');

router.get('/products', cacheMiddleware(300), getProducts); // Cache for 5 minutes
router.get('/products/:id', cacheMiddleware(600), getProductById); // Cache for 10 minutes
```

### 2.4 API Response Optimization

#### Implement Field Selection

```javascript
// ❌ Bad - Returns all fields
const user = await User.findById(userId);

// ✅ Good - Returns only needed fields
const user = await User.findById(userId).select('fullName email phone');
```

#### Implement Compression

```javascript
// backend/src/server.js
const compression = require('compression');

app.use(compression());
```

### 2.5 Async Operations

#### Use Async Queues

```javascript
// backend/src/services/emailQueue.js
const Queue = require('bull');
const emailQueue = new Queue('email', process.env.REDIS_URL);

// Add job to queue
emailQueue.add({
  to: user.email,
  subject: 'Order Confirmation',
  template: 'order-confirmation'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

// Process jobs
emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

---

## 3. MONITORING & METRICS

### 3.1 Frontend Performance Monitoring

```typescript
// frontend/src/lib/performance.ts
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    const body = JSON.stringify(metric);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', body);
    } else {
      fetch('/api/metrics', { body, method: 'POST', keepalive: true });
    }
  }
};
```

### 3.2 Backend Performance Monitoring

```javascript
// backend/src/middleware/performance.middleware.js
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });

    // Send to monitoring service
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
};

module.exports = { performanceMiddleware };
```

---

## 4. OPTIMIZATION CHECKLIST

### Frontend
- [ ] Implement Next.js Image optimization
- [ ] Add React.memo to components
- [ ] Use useCallback for event handlers
- [ ] Split state for better re-render control
- [ ] Implement code splitting with dynamic imports
- [ ] Analyze and reduce bundle size
- [ ] Implement lazy loading
- [ ] Add performance monitoring

### Backend
- [ ] Add database indexes
- [ ] Implement pagination
- [ ] Add Redis caching
- [ ] Optimize API responses
- [ ] Implement compression
- [ ] Use async queues for heavy operations
- [ ] Add performance monitoring
- [ ] Implement rate limiting

### Database
- [ ] Create indexes on frequently queried fields
- [ ] Use compound indexes for common queries
- [ ] Implement query optimization
- [ ] Monitor slow queries
- [ ] Archive old data

---

## 5. PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.8s | TBD |
| Largest Contentful Paint (LCP) | < 2.5s | TBD |
| Cumulative Layout Shift (CLS) | < 0.1 | TBD |
| Time to Interactive (TTI) | < 3.8s | TBD |
| API Response Time | < 200ms | TBD |
| Database Query Time | < 100ms | TBD |
| Bundle Size | < 200KB | TBD |

---

**Status:** Ready for Implementation
**Priority:** High
**Estimated Time:** 2-3 days
