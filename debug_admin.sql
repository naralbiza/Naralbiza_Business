-- debug_admin.sql
-- Run this in the Supabase SQL Editor to check the admin user status

SELECT 
    id, 
    email, 
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'admin@naralbiza.com';

SELECT * FROM public.users WHERE email = 'admin@naralbiza.com';
