-- Create admin user script
-- Run this in your Supabase SQL Editor

-- 1. First, create a user account in Supabase Auth (do this in the Auth section of Supabase dashboard)
-- Email: admin@orasnap.com
-- Password: Admin123!

-- 2. Then run this SQL to set up the admin profile and role
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from the auth.users table

-- Insert admin profile
INSERT INTO profiles (
  user_id,
  full_name,
  email,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'Admin User',
  'admin@orasnap.com',
  NOW(),
  NOW()
);

-- Insert admin role
INSERT INTO user_roles (
  user_id,
  role,
  created_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'admin',
  NOW()
);

-- Verify the admin user was created
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  ur.role
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'admin';