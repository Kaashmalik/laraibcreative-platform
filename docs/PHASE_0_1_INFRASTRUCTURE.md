# Phase 0-1: Infrastructure & Database Setup

## Phase 0: Project Setup (Week 1)

### 0.1 Environment Setup
- [ ] Create TiDB Cloud account (serverless tier free)
- [ ] Configure TiDB cluster (region: Singapore for Pakistan)
- [ ] Set up Cloudflare DNS for laraibcreative.studio
- [ ] Configure environment variables

### 0.2 Environment Variables
```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TiDB Cloud (new)
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=
TIDB_PASSWORD=
TIDB_DATABASE=laraibcreative

# Cloudinary (existing)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App URLs
NEXT_PUBLIC_APP_URL=https://laraibcreative.studio
```

### 0.3 Install Dependencies
```bash
cd frontend
npm install mysql2 @tidbcloud/serverless
```

---

## Phase 1: Database Architecture (Week 1-2)

### 1.1 TiDB Connection Setup

```typescript
// lib/tidb/connection.ts
import { connect } from '@tidbcloud/serverless'

const config = {
  host: process.env.TIDB_HOST,
  username: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
}

export const tidb = connect(config)

// For transactions
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
})
```

### 1.2 Supabase Schema Updates

```sql
-- Add TiDB reference to profiles
ALTER TABLE profiles ADD COLUMN tidb_synced_at TIMESTAMPTZ;

-- Cart items (realtime sync)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  quantity INTEGER DEFAULT 1,
  customization JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));
```

### 1.3 TiDB Schema

```sql
-- Categories
CREATE TABLE categories (
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
  INDEX idx_active (is_active)
);

-- Products
CREATE TABLE products (
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
  pricing JSON NOT NULL,
  fabric JSON,
  primary_image TEXT,
  thumbnail_image TEXT,
  customization JSON,
  inventory JSON,
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
  INDEX idx_active (is_active, is_deleted),
  FULLTEXT INDEX idx_search (title, description)
);

-- Product Variants
CREATE TABLE product_variants (
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
  INDEX idx_product (product_id)
);

-- Product Images
CREATE TABLE product_images (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(500),
  type ENUM('main', 'gallery', 'detail', 'model') DEFAULT 'gallery',
  display_order INT DEFAULT 0,
  INDEX idx_product (product_id)
);

-- Orders
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(36),
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  status ENUM('pending-payment', 'payment-verified', 'confirmed', 'in-stitching', 'quality-check', 'ready-dispatch', 'dispatched', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending-payment',
  order_type ENUM('standard', 'custom', 'replica') DEFAULT 'standard',
  shipping_address JSON NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  stitching_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cod', 'card', 'jazzcash', 'easypaisa', 'bank_transfer') DEFAULT 'cod',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  tracking_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Order Items
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36),
  product_snapshot JSON NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_stitched BOOLEAN DEFAULT false,
  measurements JSON,
  customization JSON,
  INDEX idx_order (order_id)
);

-- Reviews
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36),
  rating TINYINT NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  images JSON,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_approved (is_approved)
);

-- Analytics Events (TiFlash enabled)
CREATE TABLE analytics_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36),
  session_id VARCHAR(100),
  product_id VARCHAR(36),
  data JSON,
  device_type ENUM('mobile', 'tablet', 'desktop'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (event_type),
  INDEX idx_created (created_at)
);

-- Enable TiFlash for analytics
ALTER TABLE analytics_events SET TIFLASH REPLICA 1;
ALTER TABLE orders SET TIFLASH REPLICA 1;
```

### 1.4 Migration Script

```typescript
// scripts/setup-tidb.ts
import { pool } from '../frontend/src/lib/tidb/connection'
import fs from 'fs'
import path from 'path'

async function runMigrations() {
  const connection = await pool.getConnection()
  
  try {
    const schemaPath = path.join(__dirname, '../tidb/migrations/001_initial_schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    const statements = schema.split(';').filter(s => s.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement)
        console.log('Executed:', statement.substring(0, 50) + '...')
      }
    }
    
    console.log('✅ TiDB migrations complete')
  } finally {
    connection.release()
  }
}

runMigrations().catch(console.error)
```

### Deliverables
- [ ] TiDB cluster created and connected
- [ ] Supabase schema updated
- [ ] TiDB schema created
- [ ] Connection libraries working
- [ ] Test queries successful
