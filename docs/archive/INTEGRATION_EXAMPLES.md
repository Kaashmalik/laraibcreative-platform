# 🔌 Integration Examples

## How to Use New Features

### 1. Using tRPC in Components

```typescript
// frontend/src/components/ProductList.tsx
'use client';

export const dynamic = 'force-dynamic';

import { trpc } from '@/lib/trpc';

export function ProductList() {
  const { data, isLoading } = trpc.product.getAll.useQuery({
    page: 1,
    limit: 12,
    category: 'suits',
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.products.map((product) => (
        <div key={product._id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### 2. Using Zustand Stores

```typescript
// frontend/src/components/UserProfile.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      console.log('Logged in!');
    }
  };

  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      <p>Cart: {cartItems.length} items</p>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### 3. Using Referral System

```typescript
// frontend/src/components/ReferralCode.tsx
'use client';

export const dynamic = 'force-dynamic';

import { trpc } from '@/lib/trpc';
import { Copy } from 'lucide-react';

export function ReferralCode() {
  const { data } = trpc.referral.getCode.useQuery();
  const code = data?.referralCode || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div>
      <p>Your Code: {code}</p>
      <button onClick={handleCopy}>
        <Copy /> Copy
      </button>
    </div>
  );
}
```

### 4. Using Loyalty Points

```typescript
// frontend/src/components/LoyaltyBalance.tsx
'use client';

export const dynamic = 'force-dynamic';

import { trpc } from '@/lib/trpc';

export function LoyaltyBalance() {
  const { data: account } = trpc.loyalty.getAccount.useQuery();
  const redeemMutation = trpc.loyalty.redeemPoints.useMutation();

  const handleRedeem = async () => {
    await redeemMutation.mutateAsync({ points: 100 });
  };

  return (
    <div>
      <p>Balance: {account?.currentBalance || 0} points</p>
      <p>= Rs. {account?.currentBalance || 0}</p>
      <button onClick={handleRedeem}>Redeem 100 Points</button>
    </div>
  );
}
```

### 5. Using Currency Switcher

```typescript
// frontend/src/components/PriceDisplay.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useCurrency } from '@/components/shared/CurrencySwitcher';

export function PriceDisplay({ price }: { price: number }) {
  const { format } = useCurrency();

  return <span>{format(price, 'PKR')}</span>;
}
```

### 6. Using i18n

```typescript
// frontend/src/components/ProductCard.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useTranslations } from 'next-intl';

export function ProductCard() {
  const t = useTranslations('product');

  return (
    <div>
      <button>{t('addToCart')}</button>
      <button>{t('buyNow')}</button>
    </div>
  );
}
```

### 7. Using Facebook Conversion API

```typescript
// frontend/src/components/CheckoutButton.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useFacebookConversion } from '@/hooks/useFacebookConversion';

export function CheckoutButton({ orderId, total }: { orderId: string; total: number }) {
  const { trackPurchase } = useFacebookConversion();

  const handleCheckout = async () => {
    // Complete checkout...
    
    // Track conversion
    await trackPurchase(orderId, total, 'PKR');
  };

  return <button onClick={handleCheckout}>Complete Order</button>;
}
```

### 8. Using Production Queue (Admin)

```typescript
// frontend/src/app/(admin)/production/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { trpc } from '@/lib/trpc';

export default function ProductionPage() {
  const { data } = trpc.productionQueue.getAll.useQuery({
    status: 'pending',
    page: 1,
    limit: 50,
  });

  const updateStatus = trpc.productionQueue.updateStatus.useMutation();

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
  };

  return (
    <div>
      {data?.items.map((item) => (
        <div key={item._id}>
          <p>Order: {item.orderNumber}</p>
          <select
            value={item.status}
            onChange={(e) => handleStatusChange(item._id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="cutting">Cutting</option>
          </select>
        </div>
      ))}
    </div>
  );
}
```

### 9. Using Analytics Dashboard

```typescript
// frontend/src/app/(admin)/analytics/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { trpc } from '@/lib/trpc';

export default function AnalyticsPage() {
  const { data } = trpc.analytics.getDashboard.useQuery({
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
  });

  return (
    <div>
      <h1>Revenue: Rs. {data?.revenue?.totalRevenue?.toLocaleString()}</h1>
      <p>Orders: {data?.revenue?.totalOrders}</p>
      <p>AOV: Rs. {Math.round(data?.revenue?.averageOrderValue || 0)}</p>
    </div>
  );
}
```

### 10. Using Alert System

```typescript
// frontend/src/app/(admin)/alerts/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { trpc } from '@/lib/trpc';

export default function AlertsPage() {
  const { data } = trpc.alerts.checkAll.useQuery();
  const runChecks = trpc.alerts.checkAll.useMutation();

  return (
    <div>
      <button onClick={() => runChecks.mutate()}>Run Checks</button>
      <p>Failed Payments: {data?.payments?.count || 0}</p>
      <p>Stockouts: {data?.stockouts?.count || 0}</p>
      <p>Abandonment Rate: {data?.abandonment?.abandonmentRate || 0}%</p>
    </div>
  );
}
```

## Backend Examples

### 1. Creating a Tailor

```javascript
// backend/src/controllers/tailorController.js
const Tailor = require('../models/Tailor');

exports.createTailor = async (req, res) => {
  const tailor = await Tailor.create({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+923001234567',
    specializations: ['bridal', 'formal'],
    capacity: {
      maxOrdersPerDay: 5,
      estimatedCompletionDays: 7
    }
  });

  res.json({ success: true, data: { tailor } });
};
```

### 2. Assigning Order to Tailor

```javascript
// backend/src/controllers/productionQueueController.js
const ProductionQueue = require('../models/ProductionQueue');
const Tailor = require('../models/Tailor');

exports.assignTailor = async (req, res) => {
  const { queueId, tailorId } = req.body;

  const tailor = await Tailor.findById(tailorId);
  if (!tailor.hasCapacity) {
    return res.status(400).json({
      success: false,
      message: 'Tailor has reached maximum capacity'
    });
  }

  const queueItem = await ProductionQueue.findById(queueId);
  await queueItem.assignToTailor(tailorId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  await tailor.assignOrder();

  res.json({ success: true });
};
```

### 3. Completing Referral

```javascript
// backend/src/controllers/referralController.js
const Referral = require('../models/Referral');
const LoyaltyAccount = require('../models/LoyaltyPoints');

exports.completeReferral = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  const referral = await Referral.findOne({
    refereeId: order.customer,
    status: 'pending'
  });

  if (referral) {
    referral.status = 'completed';
    referral.triggerOrderId = orderId;
    await referral.save();

    // Credit rewards
    const [referrerAccount, refereeAccount] = await Promise.all([
      LoyaltyAccount.getOrCreate(referral.referrerId),
      LoyaltyAccount.getOrCreate(referral.refereeId)
    ]);

    await Promise.all([
      referrerAccount.addPoints(500, 'referral', orderId),
      refereeAccount.addPoints(500, 'referral', orderId)
    ]);
  }

  res.json({ success: true });
};
```

### 4. Checking Alerts

```javascript
// backend/src/services/alertService.js
const alertService = require('../services/alertService');

// Run in cron job
setInterval(async () => {
  const results = await alertService.runAllChecks();
  console.log('Alerts checked:', results);
}, 60 * 60 * 1000); // Every hour
```

### 5. Auto-Publishing Festive Collections

```javascript
// backend/src/services/festiveCollectionService.js
const FestiveCollection = require('../models/FestiveCollection');

exports.checkAndPublish = async () => {
  const now = new Date();
  
  // Find collections ready to publish
  const toPublish = await FestiveCollection.find({
    status: 'scheduled',
    publishDate: { $lte: now }
  });

  for (const collection of toPublish) {
    collection.status = 'published';
    await collection.save();
    
    // Send email campaign if enabled
    if (collection.emailCampaign.enabled) {
      // Send campaign email...
    }
  }

  // Find collections ready to unpublish
  const toUnpublish = await FestiveCollection.find({
    status: 'published',
    unpublishDate: { $lte: now }
  });

  for (const collection of toUnpublish) {
    collection.status = 'unpublished';
    await collection.save();
  }
};
```

## Testing Examples

### 1. Testing tRPC Router

```typescript
// frontend/src/server/routers/__tests__/product.test.ts
import { appRouter } from '../_app';
import { createContext } from '../../trpc-context';

describe('Product Router', () => {
  it('should get all products', async () => {
    const ctx = await createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.getAll({
      page: 1,
      limit: 10,
    });

    expect(result.products).toBeDefined();
    expect(Array.isArray(result.products)).toBe(true);
  });
});
```

### 2. Testing Zustand Store

```typescript
// frontend/src/store/__tests__/authStore.test.ts
import { useAuthStore } from '../authStore';

describe('Auth Store', () => {
  it('should login user', async () => {
    const login = useAuthStore.getState().login;
    const result = await login('test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().user).toBeDefined();
  });
});
```

## Migration Examples

### Migrating from Express to tRPC

**Before (Express):**
```typescript
const response = await fetch('/api/v1/products');
const data = await response.json();
```

**After (tRPC):**
```typescript
const { data } = trpc.product.getAll.useQuery();
```

### Migrating from Context to Zustand

**Before (Context):**
```typescript
const { user, login } = useAuth();
```

**After (Zustand):**
```typescript
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);
```

---

For more examples, see the actual implementation files in the codebase.

