-- =====================================================
-- LEADS / JOB REQUESTS SCHEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Client ID
  service_type TEXT NOT NULL, -- e.g. Wedding, Portrait
  location TEXT NOT NULL,
  event_date DATE,
  budget_range TEXT, -- e.g. "$500-$1000"
  description TEXT,
  contact_number TEXT,
  contact_name TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Policies (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Clients can create leads
CREATE POLICY "Clients can insert own leads" ON leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Clients can view own leads
CREATE POLICY "Clients can view own leads" ON leads FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Photographers can view OPEN leads
CREATE POLICY "Photographers can view open leads" ON leads FOR SELECT TO authenticated USING (status = 'open');

-- NOTE: Seed data removed to avoid Foreign Key violation. 
-- Valid leads will be created by users via the "Get Best Quotes" form.
