-- ===========================================
-- Migration: Loyalty & Referral System
-- Phase 7: Advanced Features
-- ===========================================

-- Add loyalty columns to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

-- Generate referral codes for existing users
UPDATE profiles 
SET referral_code = UPPER(SUBSTRING(COALESCE(full_name, 'USER'), 1, 3) || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4))
WHERE referral_code IS NULL;

-- Loyalty Transactions Table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted', 'bonus')),
  source VARCHAR(50) NOT NULL,
  description TEXT,
  order_id TEXT, -- References TiDB order
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_created ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_type ON loyalty_transactions(type);

-- Enable RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert loyalty transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR current_setting('app.service_role', true) = 'true');

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
  points_awarded INTEGER DEFAULT 0,
  order_id TEXT, -- First order that completed the referral
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ===========================================
-- Helper Functions
-- ===========================================

-- Function to increment loyalty points
CREATE OR REPLACE FUNCTION increment_loyalty_points(
  p_user_id UUID,
  p_points_to_add INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    loyalty_points = loyalty_points + p_points_to_add,
    lifetime_points = CASE 
      WHEN p_points_to_add > 0 THEN lifetime_points + p_points_to_add 
      ELSE lifetime_points 
    END
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process referral
CREATE OR REPLACE FUNCTION process_referral(
  p_referral_code VARCHAR(10),
  p_new_user_id UUID
)
RETURNS void AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_points INTEGER := 500;
BEGIN
  -- Find referrer
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_new_user_id THEN
    -- Create referral record
    INSERT INTO referrals (referrer_id, referred_id, referral_code, status)
    VALUES (v_referrer_id, p_new_user_id, p_referral_code, 'pending');
    
    -- Update referred_by on new user
    UPDATE profiles SET referred_by = v_referrer_id WHERE id = p_new_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete referral (called after first order)
CREATE OR REPLACE FUNCTION complete_referral(
  p_referred_id UUID,
  p_order_id TEXT
)
RETURNS void AS $$
DECLARE
  v_referral RECORD;
  v_referral_points INTEGER := 500;
BEGIN
  -- Find pending referral
  SELECT * INTO v_referral
  FROM referrals
  WHERE referred_id = p_referred_id AND status = 'pending';
  
  IF v_referral IS NOT NULL THEN
    -- Complete the referral
    UPDATE referrals
    SET 
      status = 'completed',
      points_awarded = v_referral_points,
      order_id = p_order_id,
      completed_at = NOW()
    WHERE id = v_referral.id;
    
    -- Award points to referrer
    PERFORM increment_loyalty_points(v_referral.referrer_id, v_referral_points);
    
    -- Record transaction
    INSERT INTO loyalty_transactions (user_id, points, type, source, description, order_id)
    VALUES (
      v_referral.referrer_id,
      v_referral_points,
      'bonus',
      'referral',
      'Referral bonus for successful referral',
      p_order_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- Trigger: Generate referral code for new users
-- ===========================================

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(
      SUBSTRING(COALESCE(NEW.full_name, 'USER'), 1, 3) || 
      SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT), 1, 4)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_referral_code ON profiles;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();
