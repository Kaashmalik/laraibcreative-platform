# Product Management System - Quick Reference

## Quick Start

### Frontend Usage

#### 1. List Products
```typescript
import api from '@/lib/api';

const { data } = await api.products.getAllAdmin({
  page: 1,
  limit: 20,
  search: 'shirt',
  category: 'category_id',
  status: 'in-stock'
});
```

#### 2. Create Product
```typescript
const formData = new FormData();
formData.append('title', 'Product Title');
formData.append('description', 'Product description...');
formData.append('category', 'category_id');
formData.append('pricing', JSON.stringify({ basePrice: 5000 }));
// Add images
images.forEach(img => formData.append('images', img.file));

await api.products.createAdmin(formData);
```

#### 3. Update Product
```typescript
const formData = new FormData();
// ... add updated fields
await api.products.updateAdmin(productId, formData);
```

#### 4. Delete Product
```typescript
await api.products.deleteAdmin(productId);
```

#### 5. Bulk Operations
```typescript
// Bulk delete
await api.products.bulkDelete(['id1', 'id2']);

// Bulk update
await api.products.bulkUpdateAdmin(['id1', 'id2'], {
  isFeatured: true,
  'availability.status': 'in-stock'
});
```

#### 6. Duplicate Product
```typescript
const { data } = await api.products.duplicate(productId);
// Redirect to edit page: /admin/products/edit/${data._id}
```

#### 7. Export Products
```typescript
const response = await api.products.export({
  search: 'shirt',
  category: 'category_id'
});
// Response is a blob, create download link
```

### Backend API Endpoints

All endpoints require: `Authorization: Bearer <token>`

```
GET    /api/v1/admin/products              # List products
POST   /api/v1/admin/products              # Create product
GET    /api/v1/admin/products/:id/edit     # Get for edit
PUT    /api/v1/admin/products/:id          # Update product
DELETE /api/v1/admin/products/:id          # Delete product
DELETE /api/v1/admin/products/bulk-delete  # Bulk delete
PATCH  /api/v1/admin/products/bulk-update  # Bulk update
POST   /api/v1/admin/products/:id/duplicate # Duplicate
GET    /api/v1/admin/products/export       # Export CSV
```

### Form Validation

```typescript
import { productFormSchema } from '@/lib/validations/product-schemas';
import { zodResolver } from '@hookform/resolvers';
import { useForm } from 'react-hook-form';

const form = useForm({
  resolver: zodResolver(productFormSchema),
  // ... default values
});
```

### Using the Product Form Hook

```typescript
import { useProductForm } from '@/hooks/useProductForm';

const {
  register,
  handleSubmit,
  errors,
  isSubmitting,
  isValid
} = useProductForm({
  initialData: product, // For edit mode
  onSubmit: async (data) => {
    await api.products.createAdmin(data);
  }
});
```

## Common Patterns

### Image Upload
```typescript
// Images are automatically uploaded via FormData
const formData = new FormData();
images.forEach((img, index) => {
  formData.append(`images[${index}]`, img.file);
});
```

### Form Data Structure
```typescript
{
  title: string;
  description: string;
  designCode: string; // Format: LC-YYYY-XXX
  category: string; // Category ID
  pricing: {
    basePrice: number;
    customStitchingCharge?: number;
    // ... other pricing fields
  };
  images: Array<{
    url: string;
    publicId?: string;
    altText?: string;
  }>;
  // ... other fields
}
```

## Error Handling

```typescript
try {
  await api.products.createAdmin(formData);
} catch (error) {
  const message = error.response?.data?.message || 'Failed to create product';
  // Show error to user
}
```

## Documentation Files

- **Complete Guide**: `PRODUCT_MANAGEMENT_COMPLETE_IMPLEMENTATION.md`
- **Frontend Guide**: `frontend/PRODUCT_MANAGEMENT_SYSTEM_IMPLEMENTATION.md`
- **Backend Guide**: `backend/BACKEND_PRODUCT_MANAGEMENT_IMPLEMENTATION.md`
- **Final Summary**: `PRODUCT_MANAGEMENT_FINAL_SUMMARY.md`

