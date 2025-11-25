-- ===========================================
-- LaraibCreative Supabase Schema
-- Part 2: Row Level Security Policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super-admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ===========================================
-- ADDRESSES POLICIES
-- ===========================================

CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT
  USING (is_admin());

-- ===========================================
-- CATEGORIES POLICIES
-- ===========================================

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin());

-- ===========================================
-- PRODUCTS POLICIES
-- ===========================================

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true AND is_deleted = false);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin());

-- ===========================================
-- PRODUCT IMAGES POLICIES
-- ===========================================

CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (is_admin());

-- ===========================================
-- PRODUCT COLORS POLICIES
-- ===========================================

CREATE POLICY "Anyone can view product colors"
  ON product_colors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product colors"
  ON product_colors FOR ALL
  USING (is_admin());

-- ===========================================
-- WISHLISTS POLICIES
-- ===========================================

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- ORDERS POLICIES
-- ===========================================

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (is_admin());

-- ===========================================
-- ORDER ITEMS POLICIES
-- ===========================================

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  USING (is_admin());

-- ===========================================
-- ORDER STATUS HISTORY POLICIES
-- ===========================================

CREATE POLICY "Users can view own order history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order history"
  ON order_status_history FOR ALL
  USING (is_admin());

-- ===========================================
-- ORDER NOTES POLICIES
-- ===========================================

CREATE POLICY "Admins can manage order notes"
  ON order_notes FOR ALL
  USING (is_admin());

-- ===========================================
-- MEASUREMENTS POLICIES
-- ===========================================

CREATE POLICY "Users can manage own measurements"
  ON measurements FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- REVIEWS POLICIES
-- ===========================================

CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  USING (is_admin());

-- ===========================================
-- BLOGS POLICIES
-- ===========================================

CREATE POLICY "Anyone can view published blogs"
  ON blogs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage blogs"
  ON blogs FOR ALL
  USING (is_admin());

-- ===========================================
-- SETTINGS POLICIES
-- ===========================================

CREATE POLICY "Anyone can view public settings"
  ON settings FOR SELECT
  USING (category = 'public');

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (is_admin());

-- ===========================================
-- LOYALTY POINTS POLICIES
-- ===========================================

CREATE POLICY "Users can view own points"
  ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage points"
  ON loyalty_points FOR ALL
  USING (is_admin());

-- ===========================================
-- REFERRALS POLICIES
-- ===========================================

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage referrals"
  ON referrals FOR ALL
  USING (is_admin());
