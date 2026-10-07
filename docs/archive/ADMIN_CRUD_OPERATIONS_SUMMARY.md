# Admin CRUD Operations Summary

## Overview
Complete documentation of all CRUD (Create, Read, Update, Delete) operations available to admin users in the LaraibCreative platform.

**Status**: ✅ **FULL CRUD OPERATIONS IMPLEMENTED**

All admin routes are protected with:
- `authenticate` middleware (JWT token verification)
- `adminOnly` or `restrictTo('admin', 'superadmin')` middleware (role-based access control)

---

## 1. Products Management ✅

### Base Route: `/api/v1/admin/products`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Create** | POST | `/` | Create new product with images | ✅ |
| **Read** | GET | `/` | Get all products (with filters, search, pagination) | ✅ |
| **Read** | GET | `/:id/edit` | Get product for editing | ✅ |
| **Update** | PUT | `/:id` | Update existing product | ✅ |
| **Delete** | DELETE | `/:id` | Delete product (soft delete) | ✅ |
| **Bulk Delete** | DELETE | `/bulk-delete` | Delete multiple products | ✅ |
| **Bulk Update** | PATCH | `/bulk-update` | Update multiple products | ✅ |
| **Duplicate** | POST | `/:id/duplicate` | Duplicate product | ✅ |
| **Export** | GET | `/export` | Export products to CSV | ✅ |

**Protection**: All routes protected with `authenticate` + `adminOnly`

**Features**:
- Advanced filtering (category, status, suit type, price range)
- Search functionality
- Pagination
- Sorting
- Image upload (max 10 images)
- Soft delete (preserves data)
- Bulk operations

---

## 2. Orders Management ✅

### Base Route: `/api/v1/admin/orders`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Read** | GET | `/` | Get all orders (with filters, search, pagination) | ✅ |
| **Read** | GET | `/:id` | Get order by ID | ✅ |
| **Update** | PUT | `/:id/status` | Update order status | ✅ |
| **Update** | PUT | `/:id/shipping-address` | Update shipping address | ✅ |
| **Update** | PUT | `/:id/tracking` | Update tracking information | ✅ |
| **Action** | POST | `/:id/verify-payment` | Verify payment | ✅ |
| **Action** | POST | `/:id/cancel` | Cancel order | ✅ |
| **Action** | POST | `/:id/refund` | Process refund | ✅ |
| **Action** | POST | `/:id/notes` | Add internal note | ✅ |
| **Action** | POST | `/:id/notify` | Send notification | ✅ |
| **Export** | GET | `/export` | Export orders to CSV | ✅ |
| **Invoice** | GET | `/:id/invoice` | Download invoice PDF | ✅ |

**Note**: Orders are NOT deleted (by design - for audit trail and legal compliance)

**Protection**: All routes protected with `authenticate` + `adminOnly`

---

## 3. Categories Management ✅

### Base Route: `/api/v1/categories`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Read** | GET | `/` | Get all categories (public) | ✅ |
| **Read** | GET | `/:id` | Get category by ID (public) | ✅ |
| **Read** | GET | `/slug/:slug` | Get category by slug (public) | ✅ |
| **Create** | POST | `/` | Create new category | ✅ **Admin Only** |
| **Update** | PUT | `/:id` | Update category | ✅ **Admin Only** |
| **Delete** | DELETE | `/:id` | Delete category | ✅ **Admin Only** |

**Protection**: Create/Update/Delete protected with admin middleware

**Features**:
- Hierarchical categories (parent/subcategories)
- SEO-friendly slugs
- Image upload
- Product count tracking
- Prevents deletion if category has products or subcategories

---

## 4. Blog Posts Management ✅

### Base Route: `/api/v1/blog`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Read** | GET | `/admin/all` | Get all blogs (including drafts) | ✅ **Admin Only** |
| **Read** | GET | `/admin/:id` | Get blog by ID for admin | ✅ **Admin Only** |
| **Create** | POST | `/admin` | Create new blog post | ✅ **Admin Only** |
| **Update** | PUT | `/admin/:id` | Update blog post | ✅ **Admin Only** |
| **Delete** | DELETE | `/admin/:id` | Delete blog post | ✅ **Admin Only** |
| **Bulk Delete** | DELETE | `/admin/bulk-delete` | Delete multiple posts | ✅ **Admin Only** |
| **Publish** | PATCH | `/admin/:id/publish` | Publish blog post | ✅ **Admin Only** |
| **Unpublish** | PATCH | `/admin/:id/unpublish` | Unpublish blog post | ✅ **Admin Only** |
| **Schedule** | PATCH | `/admin/:id/schedule` | Schedule blog post | ✅ **Admin Only** |

**Protection**: All admin routes protected with `protect` + `restrictTo('admin', 'superadmin')`

**Features**:
- Draft management
- Scheduling
- SEO optimization
- Related products/posts
- Analytics tracking

---

## 5. Reviews Management ✅

### Base Route: `/api/v1/reviews`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Read** | GET | `/admin` | Get all reviews (admin view) | ✅ **Admin Only** |
| **Update** | PATCH | `/admin/:id/approve` | Approve review | ✅ **Admin Only** |
| **Update** | PATCH | `/admin/:id/reject` | Reject review | ✅ **Admin Only** |
| **Delete** | DELETE | `/admin/:id` | Delete review | ✅ **Admin Only** |

**Protection**: Admin routes protected with admin middleware

---

## 6. Analytics & Dashboard ✅

### Base Route: `/api/v1/admin/dashboard` and `/api/v1/analytics`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Read** | GET | `/dashboard` | Get dashboard overview | ✅ **Admin Only** |
| **Read** | GET | `/analytics/dashboard` | Get analytics overview | ✅ **Admin Only** |
| **Read** | GET | `/analytics/sales` | Get sales report | ✅ **Admin Only** |
| **Read** | GET | `/analytics/customers` | Get customer analytics | ✅ **Admin Only** |
| **Read** | GET | `/analytics/products` | Get product analytics | ✅ **Admin Only** |
| **Read** | GET | `/analytics/suit-type-sales` | Get suit type sales | ✅ **Admin Only** |
| **Read** | GET | `/analytics/replica-conversion` | Get replica conversion | ✅ **Admin Only** |
| **Export** | GET | `/analytics/export` | Export analytics data | ✅ **Admin Only** |

**Protection**: All routes protected with `protect` + `adminOnly`

---

## 7. Settings Management ✅

### Base Route: `/api/v1/settings`

| Operation | Method | Endpoint | Description | Status |
|-----------|--------|----------|-------------|--------|
| **Read** | GET | `/` | Get all settings | ✅ **Admin Only** |
| **Update** | PUT | `/:key` | Update setting | ✅ **Admin Only** |
| **Update** | PUT | `/bulk` | Bulk update settings | ✅ **Admin Only** |

**Protection**: All routes protected with admin middleware

---

## Security Implementation

### Authentication Middleware
- **File**: `backend/src/middleware/auth.middleware.js`
- **Functions**: `authenticate`, `protect`, `adminOnly`, `superAdminOnly`
- **Verification**: JWT token validation
- **Role Check**: Verifies user has `admin` or `super-admin` role

### Route Protection Pattern
```javascript
// Pattern used in all admin routes
router.use(authenticate, adminOnly);
// OR
router.use(protect, restrictTo('admin', 'superadmin'));
```

### Frontend Protection
- **File**: `frontend/src/app/admin/layout.js`
- **Component**: `ProtectedRoute` wrapper
- **Check**: Verifies admin authentication before rendering admin pages

---

## API Client Methods

### Products (`api.products`)
- `getAllAdmin(params)` - Get all products
- `createAdmin(data, images)` - Create product
- `getForEdit(id)` - Get product for editing
- `updateAdmin(id, data, images)` - Update product
- `deleteAdmin(id)` - Delete product
- `bulkDelete(ids)` - Bulk delete
- `bulkUpdateAdmin(ids, updates)` - Bulk update
- `duplicate(id)` - Duplicate product
- `export(filters)` - Export to CSV

### Orders (`api.orders`)
- `getAllAdmin(params)` - Get all orders
- `getByIdAdmin(id)` - Get order by ID
- `updateStatus(id, status)` - Update order status
- `verifyPayment(id)` - Verify payment
- `cancelOrder(id, reason)` - Cancel order
- `processRefund(id, data)` - Process refund
- `updateShippingAddress(id, address)` - Update address
- `updateTracking(id, tracking)` - Update tracking
- `addAdminNote(id, note)` - Add note
- `sendNotification(id, type)` - Send notification
- `exportAdmin(filters)` - Export to CSV
- `downloadInvoice(id)` - Download invoice

### Categories (`api.categories`)
- `getAll(params)` - Get all categories
- `getById(id)` - Get category by ID
- `create(data)` - Create category (Admin)
- `update(id, data)` - Update category (Admin)
- `delete(id)` - Delete category (Admin)

### Blogs (`api.blogs`)
- `getAllAdmin(params)` - Get all blogs (Admin)
- `getByIdAdmin(id)` - Get blog by ID (Admin)
- `create(data)` - Create blog (Admin)
- `update(id, data)` - Update blog (Admin)
- `delete(id)` - Delete blog (Admin)
- `bulkDelete(ids)` - Bulk delete (Admin)

---

## Testing Admin CRUD Operations

### Test Authentication
```bash
# Login as admin
POST /api/v1/auth/login
{
  "email": "admin@laraibcreative.com",
  "password": "password"
}

# Use token in Authorization header
Authorization: Bearer <token>
```

### Test Product CRUD
```bash
# Create
POST /api/v1/admin/products
Authorization: Bearer <token>

# Read
GET /api/v1/admin/products?page=1&limit=20
Authorization: Bearer <token>

# Update
PUT /api/v1/admin/products/:id
Authorization: Bearer <token>

# Delete
DELETE /api/v1/admin/products/:id
Authorization: Bearer <token>
```

---

## Summary

✅ **All CRUD operations are fully implemented and protected**

- **Products**: Full CRUD + Bulk operations
- **Orders**: Read + Update + Actions (no delete by design)
- **Categories**: Full CRUD (admin-only for CUD)
- **Blogs**: Full CRUD + Publishing features
- **Reviews**: Moderation (approve/reject/delete)
- **Analytics**: Read + Export
- **Settings**: Read + Update

**Security**: All admin routes require authentication and admin role verification.

**Last Updated**: Phase 5 - Admin and Analytics Professionalization

