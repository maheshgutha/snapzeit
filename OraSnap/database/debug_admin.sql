-- Debug and fix admin user setup
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check if user exists in auth.users
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'admin@orasnap.com';

-- 2. Check if profile exists
SELECT * FROM profiles WHERE email = 'admin@orasnap.com';

-- 3. Check if user_roles exists
SELECT * FROM user_roles WHERE role = 'admin';

-- 4. If profile doesn't exist, create it (replace USER_ID with actual ID from step 1)
INSERT INTO profiles (user_id, full_name, email, created_at, updated_at)
VALUES ('USER_ID_FROM_STEP_1', 'Admin User', 'admin@orasnap.com', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 5. If role doesn't exist, create it (replace USER_ID with actual ID from step 1)
INSERT INTO user_roles (user_id, role, created_at)
VALUES ('USER_ID_FROM_STEP_1', 'admin', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Final verification - should return admin user with role
SELECT 
  au.id as auth_user_id,
  au.email,
  p.full_name,
  ur.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'admin@orasnap.com';