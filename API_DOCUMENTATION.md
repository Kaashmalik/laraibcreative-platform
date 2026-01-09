# LaraibCreative API Documentation
**Version:** 2.0
**Last Updated:** January 9, 2026

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Products](#products-endpoints)
   - [Orders](#orders-endpoints)
   - [Users](#users-endpoints)
   - [Cart](#cart-endpoints)
   - [Addresses](#addresses-endpoints)
   - [Measurements](#measurements-endpoints)
8. [Webhooks](#webhooks)
9. [Caching](#caching)
10. [Security](#security)

---

## Overview

The LaraibCreative API is a RESTful API built with Node.js and Express. It provides endpoints for managing products, orders, users, authentication, and more.

### Key Features:
- JWT-based authentication with httpOnly cookies
- CSRF protection
- Redis caching
- Rate limiting
- Error tracking with Sentry
- Performance monitoring

---

## Authentication

### JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are set as httpOnly cookies:

- **accessToken**: Short-lived token (15 minutes)
- **refreshToken**: Long-lived token (7 days or 30 days)

### How to Authenticate

1. **Login**: Send credentials to `/api/v1/auth/login`
2. **Receive Tokens**: Tokens are set as httpOnly cookies automatically
3. **Make Requests**: Include cookies in subsequent requests (handled automatically by browsers)
4. **Token Refresh**: Automatic on 401 errors

### Protected Routes

Protected routes require authentication. The API checks for the `accessToken` cookie.

### Example Request

```javascript
// Login
const response = await fetch('https://api.laraibcreative.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Access protected endpoint
const products = await fetch('https://api.laraibcreative.com/api/v1/products', {
  credentials: 'include' // Cookies sent automatically
});
```

---

## Base URL

**Production:** `https://api.laraibcreative.com/api/v1`

**Development:** `http://localhost:5000/api/v1`

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "requestId": "uuid"
}
```

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password |
| `USER_NOT_FOUND` | User not found |
| `USER_EXISTS` | User already exists |
| `TOKEN_EXPIRED` | JWT token expired |
| `TOKEN_INVALID` | Invalid JWT token |
| `CSRF_TOKEN_MISSING` | CSRF token required |
| `CSRF_TOKEN_INVALID` | Invalid CSRF token |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Resource not found |
| `INSUFFICIENT_PERMISSIONS` | Insufficient permissions |

---

## Rate Limiting

### Default Limits

- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 requests per minute per IP
- **Upload Endpoints**: 10 requests per minute per IP

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "03001234567",
  "whatsapp": "03001234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

---

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "profileImage": "image_url"
    }
  }
}
```

**Cookies Set:**
- `accessToken` (httpOnly, secure, 15min)
- `refreshToken` (httpOnly, secure, 7d)

---

#### POST /auth/logout
Logout and invalidate tokens.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### POST /auth/refresh-token
Refresh access token using refresh token.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

#### GET /auth/me
Get current authenticated user.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567",
      "whatsapp": "03001234567",
      "profileImage": "image_url",
      "role": "customer",
      "isEmailVerified": true
    }
  }
}
```

---

#### PUT /auth/profile
Update user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "03009876543",
  "whatsapp": "03009876543"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Updated",
      "email": "john@example.com",
      "phone": "03009876543"
    }
  }
}
```

---

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### GET /auth/verify-email/:token
Verify email with token.

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

#### POST /auth/resend-verification
Resend verification email.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### Products Endpoints

#### GET /products
Get all products with filtering and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` - Filter by category ID
- `subcategory` - Filter by subcategory
- `fabric` - Filter by fabric
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `occasion` - Filter by occasion
- `color` - Filter by color
- `availability` - Filter by availability (in-stock, out-of-stock, pre-order)
- `featured` - Filter by featured status (true/false)
- `suitType` - Filter by suit type
- `search` - Search query
- `sort` - Sort order (price-asc, price-desc, newest, popular)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "product_id",
        "title": "Elegant Bridal Suit",
        "slug": "elegant-bridal-suit",
        "description": "Beautiful bridal suit...",
        "price": 25000,
        "salePrice": 20000,
        "images": [
          {
            "url": "image_url",
            "alt": "Product image"
          }
        ],
        "category": {
          "_id": "category_id",
          "name": "Bridal"
        },
        "stock": 10,
        "isFeatured": true,
        "isNewArrival": false,
        "isBestSeller": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

#### GET /products/featured
Get featured products.

**Query Parameters:**
- `limit` (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...]
  }
}
```

---

#### GET /products/new-arrivals
Get new arrivals.

**Query Parameters:**
- `limit` (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...]
  }
}
```

---

#### GET /products/best-sellers
Get best-selling products.

**Query Parameters:**
- `limit` (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...]
  }
}
```

---

#### GET /products/:id
Get product by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "product_id",
      "title": "Elegant Bridal Suit",
      "slug": "elegant-bridal-suit",
      "description": "Beautiful bridal suit...",
      "price": 25000,
      "salePrice": 20000,
      "images": [...],
      "category": {...},
      "fabric": {...},
      "colors": ["#FF0000", "#00FF00"],
      "sizes": ["S", "M", "L", "XL"],
      "stock": 10,
      "measurements": {
        "shirtLength": 42,
        "shoulderWidth": 16,
        "sleeveLength": 22
      },
      "customization": {
        "isStitchingAvailable": true,
        "stitchingPrice": 5000
      },
      "seo": {
        "title": "Elegant Bridal Suit",
        "description": "Beautiful bridal suit...",
        "keywords": ["bridal", "wedding", "suit"]
      }
    }
  }
}
```

---

#### GET /products/slug/:slug
Get product by slug.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {...}
  }
}
```

---

### Orders Endpoints

#### POST /orders
Create a new order.

**Authentication:** Optional (guest checkout supported)

**Request Body:**
```json
{
  "email": "customer@example.com",
  "phone": "03001234567",
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "03001234567",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Lahore",
    "province": "Punjab",
    "postalCode": "54000"
  },
  "items": [
    {
      "productId": "product_id",
      "variantId": "variant_id",
      "quantity": 1,
      "unitPrice": 25000,
      "totalPrice": 25000,
      "isStitched": true,
      "stitchingPrice": 5000,
      "measurements": {
        "shirtLength": 42,
        "shoulderWidth": 16
      },
      "customization": {
        "color": "#FF0000",
        "size": "M"
      }
    }
  ],
  "subtotal": 25000,
  "stitchingFee": 5000,
  "shippingFee": 500,
  "discountAmount": 0,
  "total": 30500,
  "paymentMethod": "cod",
  "notes": "Special instructions"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "order_id",
      "orderNumber": "ORD-2024-001234",
      "status": "pending",
      "items": [...],
      "total": 30500,
      "payment": {
        "method": "cod",
        "status": "pending"
      },
      "shippingAddress": {...},
      "createdAt": "2024-01-09T10:00:00Z"
    }
  }
}
```

---

#### GET /orders
Get user's orders.

**Authentication:** Required

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {...}
  }
}
```

---

#### GET /orders/:id
Get order by ID.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_id",
      "orderNumber": "ORD-2024-001234",
      "status": "processing",
      "items": [...],
      "total": 30500,
      "payment": {...},
      "shippingAddress": {...},
      "tracking": {
        "carrier": "Leopard",
        "trackingNumber": "TRK123456",
        "status": "in-transit"
      },
      "statusHistory": [...]
    }
  }
}
```

---

#### PATCH /orders/:id/cancel
Cancel an order.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order": {...}
  }
}
```

---

### Users Endpoints

#### PUT /users/:id
Update user information.

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "03009876543"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {...}
  }
}
```

---

### Cart Endpoints

#### GET /cart
Get user's cart.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "cart_id",
      "items": [
        {
          "productId": "product_id",
          "quantity": 2,
          "product": {...}
        }
      ],
      "subtotal": 50000,
      "totalItems": 2
    }
  }
}
```

---

#### POST /cart/items
Add item to cart.

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1,
  "variantId": "variant_id",
  "customization": {
    "color": "#FF0000",
    "size": "M"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": {...}
  }
}
```

---

#### PUT /cart/items/:itemId
Update cart item quantity.

**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "cart": {...}
  }
}
```

---

#### DELETE /cart/items/:itemId
Remove item from cart.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cart": {...}
  }
}
```

---

### Addresses Endpoints

#### GET /auth/addresses
Get user's addresses.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "_id": "address_id",
        "label": "Home",
        "fullName": "John Doe",
        "phone": "03001234567",
        "addressLine1": "123 Main Street",
        "city": "Lahore",
        "province": "Punjab",
        "postalCode": "54000",
        "isDefault": true
      }
    ]
  }
}
```

---

#### POST /auth/addresses
Add new address.

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Home",
  "fullName": "John Doe",
  "phone": "03001234567",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Lahore",
  "province": "Punjab",
  "postalCode": "54000",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {...}
  }
}
```

---

#### PUT /auth/addresses/:id
Update address.

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Office",
  "fullName": "John Doe",
  "phone": "03009876543",
  "addressLine1": "456 Business Ave",
  "city": "Karachi",
  "province": "Sindh",
  "postalCode": "75000"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "address": {...}
  }
}
```

---

#### DELETE /auth/addresses/:id
Delete address.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

#### PATCH /auth/addresses/:id/default
Set default address.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Default address updated",
  "data": {
    "address": {...}
  }
}
```

---

### Measurements Endpoints

#### GET /auth/measurements
Get user's measurement profiles.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "_id": "profile_id",
        "name": "My Measurements",
        "sizeLabel": "M",
        "measurements": {
          "shirtLength": 42,
          "shoulderWidth": 16,
          "sleeveLength": 22,
          "bust": 38,
          "waist": 32,
          "hip": 40
        }
      }
    ]
  }
}
```

---

#### POST /auth/measurements
Create measurement profile.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Measurements",
  "sizeLabel": "M",
  "measurements": {
    "shirtLength": 42,
    "shoulderWidth": 16,
    "sleeveLength": 22,
    "bust": 38,
    "waist": 32,
    "hip": 40,
    "trouserLength": 38,
    "trouserWaist": 32
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Measurement profile created",
  "data": {
    "profile": {...}
  }
}
```

---

#### PUT /auth/measurements/:id
Update measurement profile.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Measurements",
  "measurements": {...}
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Measurement profile updated",
  "data": {
    "profile": {...}
  }
}
```

---

#### DELETE /auth/measurements/:id
Delete measurement profile.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Measurement profile deleted"
}
```

---

## Webhooks

### Payment Webhook

**Endpoint:** `POST /webhooks/payment`

**Authentication:** HMAC signature

**Payload:**
```json
{
  "event": "payment.success",
  "data": {
    "orderId": "order_id",
    "transactionId": "txn_id",
    "amount": 30500,
    "currency": "PKR"
  }
}
```

---

## Caching

### Cache Headers

```http
X-Cache: HIT
X-Cache-Key: products:featured
Cache-Control: public, max-age=300
```

### Cache Invalidation

Cache is automatically invalidated on:
- Product updates
- Order creation
- Cart modifications
- Profile updates

---

## Security

### CSRF Protection

All state-changing requests (POST, PUT, DELETE, PATCH) require a CSRF token.

**Get CSRF Token:**
```http
GET /api/v1/auth/me
X-CSRF-Token: token_from_response
```

**Include CSRF Token:**
```http
X-CSRF-Token: your_csrf_token
```

### Rate Limiting

See [Rate Limiting](#rate-limiting) section for details.

### Input Sanitization

All input is automatically sanitized to prevent XSS and injection attacks.

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## Testing

### Example cURL Commands

```bash
# Register
curl -X POST https://api.laraibcreative.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"Password123","phone":"03001234567"}'

# Login
curl -X POST https://api.laraibcreative.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","password":"Password123"}'

# Get products
curl -X GET https://api.laraibcreative.com/api/v1/products \
  -b cookies.txt

# Get user profile
curl -X GET https://api.laraibcreative.com/api/v1/auth/me \
  -b cookies.txt

# Logout
curl -X POST https://api.laraibcreative.com/api/v1/auth/logout \
  -b cookies.txt
```

---

## Support

For API support, contact:
- Email: api@laraibcreative.com
- Documentation: https://docs.laraibcreative.com
- Status Page: https://status.laraibcreative.com

---

**Last Updated:** January 9, 2026
**API Version:** 2.0
