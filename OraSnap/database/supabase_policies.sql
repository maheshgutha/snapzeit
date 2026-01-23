-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR ORASNAP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_captions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- USER ROLES TABLE POLICIES
-- =====================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PHOTOGRAPHERS TABLE POLICIES
-- =====================================================

-- Public can view approved photographers
CREATE POLICY "Public can view approved photographers" ON photographers
  FOR SELECT USING (status = 'approved' AND is_blocked = FALSE);

-- Photographers can view their own profile
CREATE POLICY "Photographers can view own profile" ON photographers
  FOR SELECT USING (auth.uid() = user_id);

-- Photographers can update their own profile
CREATE POLICY "Photographers can update own profile" ON photographers
  FOR UPDATE USING (auth.uid() = user_id);

-- Photographers can insert their own profile
CREATE POLICY "Photographers can insert own profile" ON photographers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all photographers
CREATE POLICY "Admins can view all photographers" ON photographers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all photographers
CREATE POLICY "Admins can manage photographers" ON photographers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT user_id FROM photographers WHERE id = photographer_id)
  );

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Photographers can update bookings for their services
CREATE POLICY "Photographers can update their bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM photographers WHERE id = photographer_id)
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all bookings
CREATE POLICY "Admins can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (moderation_status = 'approved');

-- Users can create reviews for their bookings
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND user_id = auth.uid() AND status = 'completed'
    )
  );

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Photographers can view reviews about them
CREATE POLICY "Photographers can view their reviews" ON reviews
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM photographers WHERE id = photographer_id)
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent
CREATE POLICY "Users can update sent messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can send system messages
CREATE POLICY "Admins can send system messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) AND message_type IN ('system', 'admin')
  );

-- =====================================================
-- ADMIN SETTINGS TABLE POLICIES
-- =====================================================

-- Only admins can view admin settings
CREATE POLICY "Only admins can view admin settings" ON admin_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update admin settings
CREATE POLICY "Only admins can update admin settings" ON admin_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ACTIVITY LOGS TABLE POLICIES
-- =====================================================

-- Only admins can view activity logs
CREATE POLICY "Only admins can view activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- ANNOUNCEMENTS TABLE POLICIES
-- =====================================================

-- Public can view active announcements
CREATE POLICY "Public can view active announcements" ON announcements
  FOR SELECT USING (
    is_active = TRUE AND 
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DISPUTES TABLE POLICIES
-- =====================================================

-- Users can view disputes they're involved in
CREATE POLICY "Users can view their disputes" ON disputes
  FOR SELECT USING (
    auth.uid() = complainant_id OR auth.uid() = respondent_id
  );

-- Users can create disputes for their bookings
CREATE POLICY "Users can create disputes" ON disputes
  FOR INSERT WITH CHECK (
    auth.uid() = complainant_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND 
      (user_id = auth.uid() OR photographer_id IN (
        SELECT id FROM photographers WHERE user_id = auth.uid()
      ))
    )
  );

-- Admins can manage all disputes
CREATE POLICY "Admins can manage disputes" ON disputes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- MODERATION QUEUE TABLE POLICIES
-- =====================================================

-- Only admins can view moderation queue
CREATE POLICY "Only admins can view moderation queue" ON moderation_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can manage moderation queue
CREATE POLICY "Only admins can manage moderation queue" ON moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert into moderation queue
CREATE POLICY "System can insert moderation items" ON moderation_queue
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- PHOTOGRAPHER VERIFICATIONS TABLE POLICIES
-- =====================================================

-- Photographers can view their own verifications
CREATE POLICY "Photographers can view own verifications" ON photographer_verifications
  FOR SELECT USING (
    photographer_id IN (
      SELECT id FROM photographers WHERE user_id = auth.uid()
    )
  );

-- Photographers can submit verifications
CREATE POLICY "Photographers can submit verifications" ON photographer_verifications
  FOR INSERT WITH CHECK (
    photographer_id IN (
      SELECT id FROM photographers WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all verifications
CREATE POLICY "Admins can manage verifications" ON photographer_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PLATFORM SETTINGS TABLE POLICIES
-- =====================================================

-- Public can view public settings
CREATE POLICY "Public can view public settings" ON platform_settings
  FOR SELECT USING (is_public = TRUE);

-- Admins can view all settings
CREATE POLICY "Admins can view all platform settings" ON platform_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage platform settings
CREATE POLICY "Admins can manage platform settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- GENERATED CAPTIONS TABLE POLICIES
-- =====================================================

-- Photographers can view their own captions
CREATE POLICY "Photographers can view own captions" ON generated_captions
  FOR SELECT USING (
    photographer_id IN (
      SELECT id FROM photographers WHERE user_id = auth.uid()
    )
  );

-- System can insert captions
CREATE POLICY "System can insert captions" ON generated_captions
  FOR INSERT WITH CHECK (true);

-- Admins can view all captions
CREATE POLICY "Admins can view all captions" ON generated_captions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );