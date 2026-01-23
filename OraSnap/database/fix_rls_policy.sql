-- Fix RLS policy infinite recursion
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;

-- Disable RLS temporarily
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Insert admin role for your user
INSERT INTO user_roles (user_id, role, created_at)
VALUES ('4d1da160-7ef9-49c4-9a3d-2127ee345b03', 'admin', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- Re-enable RLS with simple policy
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create simple policy that allows users to read their own roles
CREATE POLICY "Allow users to read own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Verify the admin role exists
SELECT * FROM user_roles WHERE user_id = '4d1da160-7ef9-49c4-9a3d-2127ee345b03';