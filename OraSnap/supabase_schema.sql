-- =====================================================
-- ORASNAP COMPLETE DATABASE SCHEMA FOR SUPABASE
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. PROFILES TABLE (User Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  notify_booking_updates BOOLEAN DEFAULT TRUE,
  notify_booking_reminders BOOLEAN DEFAULT TRUE,
  notify_promotions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USER ROLES TABLE (Role Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'photographer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- =====================================================
-- 3. PHOTOGRAPHERS TABLE (Photographer Profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS photographers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  bio TEXT,
  portfolio_images TEXT[],
  rating DECIMAL(3,2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. BOOKINGS TABLE (Booking Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT NOT NULL,
  special_requests TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 0.05,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. REVIEWS TABLE (Review System)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- =====================================================
-- 6. MESSAGES TABLE (Communication System)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ADMIN SETTINGS TABLE (Platform Configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  min_booking_amount DECIMAL(10,2) DEFAULT 50.00,
  processing_fee DECIMAL(5,2) DEFAULT 2.90,
  auto_approve_photographers BOOLEAN DEFAULT FALSE,
  email_verification_required BOOLEAN DEFAULT TRUE,
  profile_verification_required BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  session_timeout INTEGER DEFAULT 30,
  max_login_attempts INTEGER DEFAULT 5,
  two_factor_auth BOOLEAN DEFAULT TRUE,
  data_encryption BOOLEAN DEFAULT TRUE,
  auto_moderate_reviews BOOLEAN DEFAULT TRUE,
  image_moderation BOOLEAN DEFAULT TRUE,
  profanity_filter_level TEXT DEFAULT 'strict' CHECK (profanity_filter_level IN ('strict', 'moderate', 'lenient')),
  review_queue_limit INTEGER DEFAULT 100,
  api_rate_limit INTEGER DEFAULT 1000,
  webhook_notifications BOOLEAN DEFAULT TRUE,
  third_party_integrations BOOLEAN DEFAULT TRUE,
  analytics_tracking BOOLEAN DEFAULT TRUE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'We are currently performing maintenance...',
  auto_backup BOOLEAN DEFAULT TRUE,
  backup_retention INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- =====================================================
-- 8. ACTIVITY LOGS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. ANNOUNCEMENTS TABLE (Admin Announcements)
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'users', 'photographers', 'admins')),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. DISPUTES TABLE (Dispute Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  complainant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. MODERATION QUEUE TABLE (Content Moderation)
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('review', 'message', 'profile', 'portfolio')),
  content_id UUID NOT NULL,
  content_text TEXT,
  flagged_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. PHOTOGRAPHER VERIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS photographer_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'passport', 'license', 'certificate')),
  document_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. PLATFORM SETTINGS TABLE (Additional Settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. GENERATED CAPTIONS TABLE (AI Features)
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_photographers_user_id ON photographers(user_id);
CREATE INDEX IF NOT EXISTS idx_photographers_status ON photographers(status);
CREATE INDEX IF NOT EXISTS idx_photographers_location ON photographers(location);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_photographer_id ON bookings(photographer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_photographer_id ON reviews(photographer_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photographers_updated_at BEFORE UPDATE ON photographers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public photographer data
CREATE OR REPLACE FUNCTION get_public_photographer(photographer_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialty TEXT,
  location TEXT,
  country TEXT,
  price_per_hour DECIMAL,
  bio TEXT,
  portfolio_images TEXT[],
  rating DECIMAL,
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.specialty,
    p.location,
    p.country,
    p.price_per_hour,
    p.bio,
    p.portfolio_images,
    p.rating,
    p.review_count
  FROM photographers p
  WHERE p.id = photographer_uuid AND p.status = 'approved' AND p.is_blocked = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public photographers list
CREATE OR REPLACE FUNCTION get_public_photographers()
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialty TEXT,
  location TEXT,
  country TEXT,
  price_per_hour DECIMAL,
  rating DECIMAL,
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.specialty,
    p.location,
    p.country,
    p.price_per_hour,
    p.rating,
    p.review_count
  FROM photographers p
  WHERE p.status = 'approved' AND p.is_blocked = FALSE
  ORDER BY p.rating DESC, p.review_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin settings
INSERT INTO admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, description, is_public) VALUES
('site_name', '"OraSnap"', 'Platform name', true),
('site_description', '"Professional Photography Booking Platform"', 'Platform description', true),
('contact_email', '"support@orasnap.com"', 'Contact email', true),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', false),
('supported_image_formats', '["jpg", "jpeg", "png", "webp"]', 'Supported image formats', false)
ON CONFLICT (setting_key) DO NOTHING;