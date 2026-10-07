# 🔄 Migration Guide

## From Express API to tRPC

### Step 1: Identify API Calls

Find all `fetch` calls to `/api/v1/*`:

```typescript
// Before
const response = await fetch('/api/v1/products');
const data = await response.json();
```

### Step 2: Replace with tRPC

```typescript
// After
const { data } = trpc.product.getAll.useQuery();
```

### Step 3: Update Mutations

```typescript
// Before
await fetch('/api/v1/orders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});

// After
const createOrder = trpc.order.create.useMutation();
await createOrder.mutateAsync(orderData);
```

## From React Context to Zustand

### Step 1: Identify Context Usage

```typescript
// Before
const { user, login } = useAuth();
```

### Step 2: Replace with Zustand

```typescript
// After
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);
```

### Step 3: Update Provider

Remove Context Provider from layout:

```typescript
// Before
<AuthProvider>
  <CartProvider>
    {children}
  </CartProvider>
</AuthProvider>

// After
<TRPCProvider>
  {children}
</TRPCProvider>
```

## Adding i18n to Existing Components

### Step 1: Import useTranslations

```typescript
import { useTranslations } from 'next-intl';
```

### Step 2: Replace Hardcoded Text

```typescript
// Before
<h1>Welcome</h1>
<button>Add to Cart</button>

// After
const t = useTranslations('common');
<h1>{t('welcome')}</h1>
<button>{t('addToCart')}</button>
```

### Step 3: Add Translations

Update `messages/en.json` and `messages/ur.json`:

```json
{
  "common": {
    "welcome": "Welcome",
    "addToCart": "Add to Cart"
  }
}
```

## Adding Currency Support

### Step 1: Import useCurrency Hook

```typescript
import { useCurrency } from '@/components/shared/CurrencySwitcher';
```

### Step 2: Format Prices

```typescript
// Before
<span>Rs. {price}</span>

// After
const { format } = useCurrency();
<span>{format(price, 'PKR')}</span>
```

## Migrating to Production Queue

### Step 1: Create Queue Entry on Order

```javascript
// backend/src/controllers/orderController.js
const ProductionQueue = require('../models/ProductionQueue');

exports.createOrder = async (req, res) => {
  // Create order...
  
  // Create production queue entry
  await ProductionQueue.create({
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: 'pending',
    priority: order.isRushOrder ? 'urgent' : 'normal',
  });
  
  // ...
};
```

### Step 2: Update Status on Order Change

```javascript
// When order status changes
const queueItem = await ProductionQueue.findOne({ orderId: order._id });
if (queueItem) {
  await queueItem.updateStatus('assigned', req.user._id);
}
```

## Adding Referral System

### Step 1: Generate Code on Registration

```javascript
// backend/src/controllers/authController.js
const Referral = require('../models/Referral');

exports.register = async (req, res) => {
  // Create user...
  
  // Generate referral code
  const code = Referral.generateCode(user._id);
  await Referral.create({
    referrerId: user._id,
    referralCode: code,
    status: 'pending',
  });
  
  // ...
};
```

### Step 2: Apply Code on Registration

```javascript
// If user has referral code
if (req.body.referralCode) {
  const referral = await Referral.findByCode(req.body.referralCode);
  if (referral) {
    referral.refereeId = user._id;
    await referral.save();
  }
}
```

### Step 3: Complete on First Order

```javascript
// backend/src/controllers/orderController.js
const referralController = require('./referralController');

exports.createOrder = async (req, res) => {
  // Create order...
  
  // Check if first order
  const previousOrders = await Order.countDocuments({
    customer: req.user._id,
  });
  
  if (previousOrders === 0) {
    // Complete referral
    await referralController.completeReferral({
      body: { orderId: order._id },
      user: req.user,
    }, res);
  }
  
  // ...
};
```

## Adding Loyalty Points

### Step 1: Award Points on Order

```javascript
// backend/src/controllers/orderController.js
const LoyaltyAccount = require('../models/LoyaltyPoints');

exports.createOrder = async (req, res) => {
  // Create order...
  
  // Award loyalty points (1% of order value)
  if (order.payment.status === 'completed') {
    const points = Math.floor(order.total * 0.01);
    const account = await LoyaltyAccount.getOrCreate(req.user._id);
    await account.addPoints(points, 'order', order._id);
  }
  
  // ...
};
```

### Step 2: Allow Redemption at Checkout

```javascript
// backend/src/controllers/orderController.js
exports.createOrder = async (req, res) => {
  // If user wants to redeem points
  if (req.body.redeemPoints) {
    const account = await LoyaltyAccount.findOne({ userId: req.user._id });
    if (account.currentBalance >= req.body.redeemPoints) {
      await account.redeemPoints(req.body.redeemPoints);
      order.discount += req.body.redeemPoints;
    }
  }
  
  // ...
};
```

## Adding Alert System

### Step 1: Set Up Cron Job

```javascript
// backend/src/cron/index.js
const cron = require('node-cron');
const alertService = require('../services/alertService');

// Run every hour
cron.schedule('0 * * * *', async () => {
  await alertService.runAllChecks();
});
```

### Step 2: Add to Server Startup

```javascript
// backend/src/server.js
require('./cron');
```

## Adding Festive Collections

### Step 1: Create Collection

```javascript
// backend/src/controllers/festiveCollectionController.js
const FestiveCollection = require('../models/FestiveCollection');

exports.createCollection = async (req, res) => {
  const collection = await FestiveCollection.create({
    name: 'Eid Collection 2024',
    type: 'eid',
    publishDate: new Date('2024-06-15'),
    unpublishDate: new Date('2024-07-15'),
    products: req.body.productIds,
    status: 'scheduled',
  });
  
  res.json({ success: true, data: { collection } });
};
```

### Step 2: Auto-Publish Check

```javascript
// backend/src/cron/festiveCollections.js
const FestiveCollection = require('../models/FestiveCollection');

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  
  // Publish scheduled collections
  await FestiveCollection.updateMany(
    {
      status: 'scheduled',
      publishDate: { $lte: now },
    },
    { status: 'published' }
  );
  
  // Unpublish expired collections
  await FestiveCollection.updateMany(
    {
      status: 'published',
      unpublishDate: { $lte: now },
    },
    { status: 'unpublished' }
  );
});
```

## Checklist

- [ ] Replace all Express API calls with tRPC
- [ ] Migrate Context to Zustand
- [ ] Add i18n to all components
- [ ] Add currency formatting
- [ ] Set up production queue
- [ ] Integrate referral system
- [ ] Add loyalty points
- [ ] Configure alerts
- [ ] Set up festive collections
- [ ] Test all features

---

For more details, see `INTEGRATION_EXAMPLES.md`.

