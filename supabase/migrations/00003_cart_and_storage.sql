-- ===========================================
-- Migration: Cart Items & Storage Buckets Setup
-- Phase 1: Infrastructure
-- ===========================================

-- Cart Items Table (Real-time sync)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id TEXT NOT NULL, -- References TiDB products.id
  variant_id TEXT, -- References TiDB product_variants.id
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  customization JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Either user_id or session_id must be set
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Indexes for cart
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Cart RLS Policies
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for cart
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;

-- ===========================================
-- Measurements Table (User saved measurements)
-- ===========================================

CREATE TABLE IF NOT EXISTS measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT 'My Measurements',
  is_default BOOLEAN DEFAULT false,
  
  -- Upper Body (in inches)
  bust DECIMAL(4,1),
  waist DECIMAL(4,1),
  hip DECIMAL(4,1),
  shoulder DECIMAL(4,1),
  arm_length DECIMAL(4,1),
  armhole DECIMAL(4,1),
  bicep DECIMAL(4,1),
  wrist DECIMAL(4,1),
  
  -- Length
  front_length DECIMAL(4,1),
  back_length DECIMAL(4,1),
  
  -- Neck
  neck_circumference DECIMAL(4,1),
  front_neck_depth DECIMAL(4,1),
  back_neck_depth DECIMAL(4,1),
  
  -- Bottom (optional)
  bottom_length DECIMAL(4,1),
  bottom_waist DECIMAL(4,1),
  thigh DECIMAL(4,1),
  inseam DECIMAL(4,1),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurements(user_id);

-- Enable RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Measurements RLS Policies
CREATE POLICY "Users can manage own measurements"
  ON measurements FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- Update Profiles for TiDB sync
-- ===========================================

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS tidb_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- ===========================================
-- Storage Buckets Setup (Run in Supabase Dashboard)
-- ===========================================

-- Note: Buckets must be created via Supabase Dashboard or API
-- This is documentation for the required buckets:

/*
BUCKETS TO CREATE:

1. review-images (PUBLIC)
   - For customer review photos
   - Max file size: 5MB
   - Allowed types: image/*

2. order-attachments (PRIVATE)
   - For custom design references
   - Max file size: 10MB
   - Allowed types: image/*, application/pdf

3. payment-receipts (PRIVATE)
   - For bank transfer proofs
   - Max file size: 5MB
   - Allowed types: image/*, application/pdf

4. profile-images (PUBLIC)
   - For user avatars
   - Max file size: 2MB
   - Allowed types: image/*

5. custom-designs (PRIVATE)
   - For admin uploaded designs
   - Max file size: 20MB
   - Allowed types: image/*
*/

-- ===========================================
-- Storage Policies (Run after bucket creation)
-- ===========================================

-- Review Images: Authenticated users can upload, anyone can view
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Order Attachments: Only order owner can access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('order-attachments', 'order-attachments', false);

-- Payment Receipts: Only order owner and admins can access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

-- Profile Images: Owner can upload, anyone can view
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- ===========================================
-- Trigger for updated_at
-- ===========================================

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_measurements_updated_at
  BEFORE UPDATE ON measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
