-- force_reset_admin.sql
-- Run this in Supabase SQL Editor to FORCE RESET the admin password and verify

-- 1. Enable pgcrypto if not already enabled (Crucial for crypt() function)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Force Update Password
UPDATE auth.users
SET 
  encrypted_password = crypt('metrics.01', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'admin@naralbiza.com';

-- 3. Verify the result
SELECT 
    id, 
    email, 
    role, 
    (encrypted_password IS NOT NULL) as has_password, 
    email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@naralbiza.com';
