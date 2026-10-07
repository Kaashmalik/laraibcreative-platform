# Order Management System - Quick Reference

## Quick Start

### Frontend Usage

#### 1. List Orders
```typescript
import api from '@/lib/api';

const { data } = await api.orders.admin.getAll({
  page: 1,
  limit: 20,
  status: 'pending-payment',
  paymentStatus: 'pending',
  dateRange: 'month',
  search: 'LC-2025'
});
```

#### 2. Get Order Details
```typescript
const { data } = await api.orders.admin.getById(orderId);
```

#### 3. Update Order Status
```typescript
await api.orders.admin.updateStatus(orderId, {
  status: 'in-progress',
  note: 'Order processing started',
  notifyCustomer: true
});
```

#### 4. Verify Payment
```typescript
await api.orders.admin.verifyPayment(orderId, {
  verified: true,
  transactionId: 'TXN123456',
  transactionDate: new Date(),
  amountPaid: 5000,
  verificationNotes: 'Payment verified successfully'
});
```

#### 5. Cancel Order
```typescript
await api.orders.admin.cancel(orderId, {
  reason: 'Customer request',
  refundAmount: 2500, // Optional
  notifyCustomer: true
});
```

#### 6. Process Refund
```typescript
await api.orders.admin.processRefund(orderId, {
  reason: 'Order cancelled',
  amount: 5000,
  notifyCustomer: true
});
```

#### 7. Add Internal Note
```typescript
await api.orders.admin.addNote(orderId, {
  text: 'Customer requested rush delivery',
  isImportant: false
});
```

#### 8. Update Shipping Address
```typescript
await api.orders.admin.updateShippingAddress(orderId, {
  addressLine1: '123 Main Street',
  city: 'Lahore',
  province: 'Punjab',
  postalCode: '54000',
  country: 'Pakistan'
});
```

#### 9. Update Tracking
```typescript
await api.orders.admin.updateTracking(orderId, {
  courierService: 'TCS',
  trackingNumber: 'TCS123456789',
  trackingUrl: 'https://tcs.com/track/TCS123456789',
  estimatedDeliveryDate: new Date('2025-02-01')
});
```

#### 10. Download Invoice
```typescript
const response = await api.orders.admin.downloadInvoice(orderId);
const blob = new Blob([response.data], { type: 'application/pdf' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `invoice-${orderNumber}.pdf`;
a.click();
```

#### 11. Send Notification
```typescript
await api.orders.admin.sendNotification(orderId, {
  type: 'custom',
  message: 'Your order is ready for pickup',
  channels: ['email', 'whatsapp']
});
```

#### 12. Export Orders
```typescript
const response = await api.orders.admin.export({
  status: 'delivered',
  dateRange: 'month'
});
const blob = new Blob([response.data], { type: 'text/csv' });
// Download CSV
```

### Backend API Endpoints

All endpoints require: `Authorization: Bearer <token>`

```
GET    /api/v1/admin/orders              # List orders
GET    /api/v1/admin/orders/:id         # Get order
PUT    /api/v1/admin/orders/:id/status  # Update status
POST   /api/v1/admin/orders/:id/verify-payment  # Verify payment
POST   /api/v1/admin/orders/:id/cancel  # Cancel order
POST   /api/v1/admin/orders/:id/refund  # Process refund
POST   /api/v1/admin/orders/:id/notes   # Add note
PUT    /api/v1/admin/orders/:id/shipping-address  # Update address
PUT    /api/v1/admin/orders/:id/tracking  # Update tracking
GET    /api/v1/admin/orders/:id/invoice  # Download invoice
POST   /api/v1/admin/orders/:id/notify  # Send notification
GET    /api/v1/admin/orders/export       # Export CSV
```

## Order Status Flow

```
pending-payment → payment-verified → material-arranged → 
in-progress → quality-check → ready-dispatch → 
dispatched → delivered
```

**Special Statuses:**
- `cancelled` - Can be set from any status
- `refunded` - Set when refund is processed

## Payment Verification Flow

1. Customer uploads payment receipt
2. Admin reviews receipt in PaymentVerification modal
3. Admin verifies or rejects payment
4. If verified:
   - Payment status → `verified`
   - Order status → `payment-verified`
   - Customer notified
5. If rejected:
   - Payment status → `failed`
   - Order status → `pending-payment`
   - Customer notified with reason

## Notification Types

### Automatic
- Order confirmation (on order creation)
- Payment verified (on verification)
- Payment rejected (on rejection)
- Status update (on status change, if notifyCustomer = true)
- Order cancellation (on cancellation)
- Refund processed (on refund)
- Tracking update (on tracking add)

### Manual
- Custom email notification
- Custom WhatsApp notification
- Both channels

## Common Patterns

### Filter Orders
```typescript
const filters = {
  status: 'pending-payment',
  paymentStatus: 'pending',
  dateRange: 'week',
  minAmount: 1000,
  maxAmount: 10000,
  sortBy: 'newest'
};
```

### Status Update with Notification
```typescript
await api.orders.admin.updateStatus(orderId, {
  status: 'dispatched',
  note: 'Order shipped via TCS',
  notifyCustomer: true
});
```

### Cancel with Refund
```typescript
await api.orders.admin.cancel(orderId, {
  reason: 'Out of stock',
  refundAmount: order.pricing.total,
  notifyCustomer: true
});
```

## Error Handling

```typescript
try {
  await api.orders.admin.updateStatus(orderId, data);
  toast.success('Status updated');
} catch (error) {
  const message = error.response?.data?.message || 'Failed to update status';
  toast.error(message);
}
```

## Documentation Files

- **Complete Guide**: `ORDER_MANAGEMENT_COMPLETE_IMPLEMENTATION.md`
- **Implementation Summary**: `ORDER_MANAGEMENT_IMPLEMENTATION_SUMMARY.md`
- **Quick Reference**: `ORDER_MANAGEMENT_QUICK_REFERENCE.md` (this file)

