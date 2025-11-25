-- ===========================================
-- LaraibCreative Supabase Schema
-- Part 1: Extensions, Enums, and Core Tables
-- ===========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super-admin');
CREATE TYPE customer_type AS ENUM ('new', 'returning', 'vip');
CREATE TYPE product_type AS ENUM ('ready-made', 'custom-only', 'both');
CREATE TYPE availability_status AS ENUM ('in-stock', 'made-to-order', 'out-of-stock', 'discontinued');
CREATE TYPE order_status AS ENUM (
  'pending-payment', 'payment-verified', 'material-arranged', 
  'in-progress', 'quality-check', 'ready-dispatch', 
  'dispatched', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE order_type AS ENUM ('standard', 'custom', 'replica');
CREATE TYPE order_priority AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE order_source AS ENUM ('website', 'whatsapp', 'instagram', 'phone', 'walk-in');
CREATE TYPE address_type AS ENUM ('shipping', 'billing');
CREATE TYPE points_type AS ENUM ('earned', 'redeemed', 'expired', 'adjusted');
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'rewarded');

-- ===========================================
-- PROFILES TABLE (extends auth.users)
-- ===========================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  customer_type customer_type DEFAULT 'new',
  profile_image TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ADDRESSES TABLE
-- ===========================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'Punjab',
  postal_code TEXT,
  country TEXT DEFAULT 'Pakistan',
  is_default BOOLEAN DEFAULT false,
  type address_type DEFAULT 'shipping',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CATEGORIES TABLE
-- ===========================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  seo JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PRODUCTS TABLE
-- ===========================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  design_code TEXT,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_type product_type DEFAULT 'both',
  availability_status availability_status DEFAULT 'in-stock',
  primary_image TEXT,
  thumbnail_image TEXT,
  fabric JSONB DEFAULT '{}',
  pricing JSONB NOT NULL DEFAULT '{"basePrice": 0}',
  customization JSONB DEFAULT '{}',
  inventory JSONB DEFAULT '{}',
  seo JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  purchased INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PRODUCT IMAGES TABLE
-- ===========================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PRODUCT COLORS TABLE
-- ===========================================

CREATE TABLE product_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex_code TEXT,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- WISHLISTS TABLE
-- ===========================================

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ===========================================
-- ORDERS TABLE
-- ===========================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_info JSONB NOT NULL,
  status order_status DEFAULT 'pending-payment',
  order_type order_type DEFAULT 'standard',
  priority order_priority DEFAULT 'normal',
  source order_source DEFAULT 'website',
  shipping_address JSONB,
  billing_address JSONB,
  pricing JSONB NOT NULL,
  payment JSONB DEFAULT '{}',
  tracking JSONB DEFAULT '{}',
  custom_details JSONB,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ORDER ITEMS TABLE
-- ===========================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  custom_details JSONB,
  measurements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ORDER STATUS HISTORY TABLE
-- ===========================================

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ORDER NOTES TABLE
-- ===========================================

CREATE TABLE order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MEASUREMENTS TABLE
-- ===========================================

CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Default',
  measurements JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- REVIEWS TABLE
-- ===========================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  admin_response TEXT,
  admin_response_at TIMESTAMPTZ,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- BLOGS TABLE
-- ===========================================

CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  seo JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- SETTINGS TABLE
-- ===========================================

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LOYALTY POINTS TABLE
-- ===========================================

CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type points_type NOT NULL,
  source TEXT,
  reference_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- REFERRALS TABLE
-- ===========================================

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status referral_status DEFAULT 'pending',
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active, is_deleted);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
