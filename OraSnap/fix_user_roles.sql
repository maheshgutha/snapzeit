-- Quick fix: Create user_roles table and add admin role
-- Run this in Supabase SQL Editor

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'photographer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles" ON user_roles
  FOR ALL USING (auth.role() = 'service_role');

-- Insert admin role for your user
INSERT INTO user_roles (user_id, role, created_at)
VALUES ('4d1da160-7ef9-49c4-9a3d-2127ee345b03', 'admin', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify
SELECT * FROM user_roles WHERE user_id = '4d1da160-7ef9-49c4-9a3d-2127ee345b03';