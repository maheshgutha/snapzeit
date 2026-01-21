-- ============================================
-- PHASE 1-5: Admin Panel Enhancement Tables
-- ============================================

-- Activity Logs table for audit purposes
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'user', 'photographer', 'booking', 'settings'
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform settings table
CREATE TABLE public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_active BOOLEAN DEFAULT true,
    target_audience TEXT DEFAULT 'all', -- 'all', 'users', 'photographers'
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Disputes table for booking disputes
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    raised_by UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    resolution TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photographer verification documents
CREATE TABLE public.photographer_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES public.photographers(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL, -- 'id_card', 'business_license', 'portfolio_proof'
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Content moderation queue for reviews
CREATE TABLE public.moderation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL, -- 'review', 'portfolio', 'bio'
    content_id UUID NOT NULL,
    content_preview TEXT,
    reason TEXT, -- auto-flagged reason or manual report
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add featured flag and custom commission to photographers
ALTER TABLE public.photographers 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_commission_rate NUMERIC;

-- Enable RLS on all new tables
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can access these tables
CREATE POLICY "Admins can manage activity_logs" ON public.activity_logs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage platform_settings" ON public.platform_settings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage disputes" ON public.disputes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage verifications" ON public.photographer_verifications FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage moderation" ON public.moderation_queue FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Users can view active announcements
CREATE POLICY "Users can view active announcements" ON public.announcements FOR SELECT USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));

-- Users can create disputes for their bookings
CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = raised_by);
CREATE POLICY "Users can view own disputes" ON public.disputes FOR SELECT USING (auth.uid() = raised_by);

-- Photographers can upload verification docs
CREATE POLICY "Photographers can upload verifications" ON public.photographer_verifications FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM photographers WHERE id = photographer_id AND user_id = auth.uid()));
CREATE POLICY "Photographers can view own verifications" ON public.photographer_verifications FOR SELECT 
USING (EXISTS (SELECT 1 FROM photographers WHERE id = photographer_id AND user_id = auth.uid()));

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('default_commission_rate', '0.05', 'Default commission rate for bookings'),
('supported_currencies', '["USD", "EUR", "GBP", "INR"]', 'List of supported currencies'),
('min_booking_hours', '1', 'Minimum booking duration in hours'),
('max_booking_hours', '12', 'Maximum booking duration in hours')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;