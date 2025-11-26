# TiDB Cloud Schema

Run this SQL in TiDB Cloud Console to create the database schema.

## How to Execute

1. Go to [TiDB Cloud Console](https://tidbcloud.com/)
2. Select your cluster → **SQL Editor**
3. Copy and run each section below

---

## Categories Table

```sql
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id VARCHAR(36),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  seo JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_parent (parent_id),
  INDEX idx_active (is_active)
);
```

---

## Products Table

```sql
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(100) UNIQUE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  design_code VARCHAR(50),
  description TEXT,
  short_description TEXT,
  category_id VARCHAR(36),
  product_type ENUM('ready-made', 'custom-only', 'both') DEFAULT 'both',
  availability ENUM('in-stock', 'made-to-order', 'out-of-stock', 'discontinued') DEFAULT 'in-stock',
  pricing JSON NOT NULL COMMENT '{"base": 5000, "sale": 4500, "stitching": 1500}',
  fabric JSON COMMENT '{"type": "lawn", "brand": "Gul Ahmed", "composition": "100% Cotton"}',
  primary_image TEXT,
  thumbnail_image TEXT,
  customization JSON COMMENT '{"neck_styles": [], "sleeve_options": []}',
  inventory JSON COMMENT '{"total": 100, "reserved": 5}',
  seo JSON,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  purchases INT DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active, is_deleted),
  INDEX idx_featured (is_featured),
  INDEX idx_new (is_new_arrival),
  FULLTEXT INDEX idx_search (title, description)
);
```

---

## Product Variants Table

```sql
CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  name VARCHAR(255),
  color_name VARCHAR(100),
  color_hex VARCHAR(10),
  size VARCHAR(20),
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## Product Images Table

```sql
CREATE TABLE IF NOT EXISTS product_images (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(500),
  type ENUM('main', 'gallery', 'detail', 'model') DEFAULT 'gallery',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## Orders Table

```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(36) COMMENT 'References Supabase profiles.id',
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  status ENUM(
    'pending-payment', 'payment-verified', 'confirmed',
    'in-stitching', 'quality-check', 'ready-dispatch',
    'dispatched', 'delivered', 'cancelled', 'refunded'
  ) DEFAULT 'pending-payment',
  order_type ENUM('standard', 'custom', 'replica') DEFAULT 'standard',
  shipping_address JSON NOT NULL,
  billing_address JSON,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  stitching_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code VARCHAR(50),
  total DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cod', 'card', 'jazzcash', 'easypaisa', 'bank_transfer') DEFAULT 'cod',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_reference VARCHAR(100),
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (order_number),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created (created_at)
);
```

---

## Order Items Table

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36),
  variant_id VARCHAR(36),
  product_snapshot JSON NOT NULL COMMENT 'Frozen product data at order time',
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_stitched BOOLEAN DEFAULT false,
  stitching_price DECIMAL(10,2) DEFAULT 0,
  measurements JSON COMMENT 'Customer measurements for stitched items',
  customization JSON COMMENT 'Neck style, sleeve style, etc.',
  status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

---

## Order Status History Table

```sql
CREATE TABLE IF NOT EXISTS order_status_history (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL,
  note TEXT,
  updated_by VARCHAR(36) COMMENT 'Admin user ID from Supabase',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (order_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

---

## Reviews Table

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL COMMENT 'Supabase profile ID',
  order_id VARCHAR(36),
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  images JSON COMMENT 'Array of image URLs from Supabase Storage',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  admin_reply TEXT,
  admin_reply_at TIMESTAMP,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_customer (customer_id),
  INDEX idx_approved (is_approved),
  INDEX idx_rating (rating),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## Analytics Events Table (TiFlash Enabled)

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36),
  session_id VARCHAR(100),
  product_id VARCHAR(36),
  category_id VARCHAR(36),
  order_id VARCHAR(36),
  data JSON,
  device_type ENUM('mobile', 'tablet', 'desktop'),
  browser VARCHAR(50),
  referrer TEXT,
  page_url TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (event_type),
  INDEX idx_user (user_id),
  INDEX idx_product (product_id),
  INDEX idx_created (created_at)
);

-- Enable TiFlash for real-time analytics
ALTER TABLE analytics_events SET TIFLASH REPLICA 1;
ALTER TABLE orders SET TIFLASH REPLICA 1;
ALTER TABLE order_items SET TIFLASH REPLICA 1;
```

---

## Discount Codes Table

```sql
CREATE TABLE IF NOT EXISTS discount_codes (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  maximum_discount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
);
```

---

## Sample Data (Optional)

```sql
-- Insert sample categories
INSERT INTO categories (id, name, slug, description, display_order, is_featured) VALUES
(UUID(), 'Lawn Suits', 'lawn-suits', 'Premium lawn fabric suits for summer', 1, true),
(UUID(), 'Chiffon Suits', 'chiffon-suits', 'Elegant chiffon suits for formal occasions', 2, true),
(UUID(), 'Cotton Suits', 'cotton-suits', 'Comfortable cotton suits for daily wear', 3, true),
(UUID(), 'Silk Suits', 'silk-suits', 'Luxurious silk suits for special events', 4, true),
(UUID(), 'Winter Collection', 'winter-collection', 'Warm winter suits and shawls', 5, false);
```

---

## Verification

After running all migrations, verify with:

```sql
SHOW TABLES;

-- Check TiFlash status
SELECT TABLE_NAME, REPLICA_COUNT 
FROM information_schema.tiflash_replica 
WHERE TABLE_SCHEMA = 'laraibcreative';
```
