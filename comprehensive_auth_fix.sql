-- comprehensive_auth_fix.sql
-- Run this in Supabase SQL Editor to diagnose and fix all auth-related issues

-- STEP 1: Verify the user exists in both auth.users and public.users
SELECT 'AUTH TABLE CHECK' as step;
SELECT id, email, role, email_confirmed_at 
FROM auth.users 
WHERE email = 'naralbizaservice@gmail.com';

SELECT 'PUBLIC USERS TABLE CHECK' as step;
SELECT id, email, role, active 
FROM public.users 
WHERE email = 'naralbizaservice@gmail.com';

-- STEP 2: If user doesn't exist in public.users, create it
-- (This will only insert if the user doesn't exist)
INSERT INTO public.users (id, email, name, role, active, avatar_url)
SELECT 
    id, 
    email, 
    'Naralbiza Service', 
    'Admin', 
    true, 
    'https://ui-avatars.com/api/?name=Naralbiza+Service&background=random'
FROM auth.users
WHERE email = 'naralbizaservice@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'Admin',
    active = true,
    email = EXCLUDED.email;

-- STEP 3: Drop ALL existing RLS policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
DROP POLICY IF EXISTS "Admins can read all data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Public read for login debug" ON public.users;

-- STEP 4: Create simple, permissive policies
-- Allow authenticated users to read their own profile
CREATE POLICY "authenticated_users_read_own" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "authenticated_users_update_own" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- STEP 5: Fix permissions table RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.permissions;

-- Allow all authenticated users to read permissions (needed for AuthContext)
CREATE POLICY "authenticated_read_permissions" 
ON public.permissions 
FOR SELECT 
TO authenticated
USING (true);

-- STEP 6: Fix roles table RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read roles" ON public.roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.roles;

CREATE POLICY "authenticated_read_roles" 
ON public.roles 
FOR SELECT 
TO authenticated
USING (true);

-- STEP 7: Verify final state
SELECT 'FINAL VERIFICATION' as step;
SELECT 
    u.id, 
    u.email, 
    u.role, 
    u.active,
    COUNT(p.id) as permission_count
FROM public.users u
LEFT JOIN public.permissions p ON p.user_id = u.id OR p.role_id IN (SELECT id FROM public.roles WHERE name = u.role)
WHERE u.email = 'naralbizaservice@gmail.com'
GROUP BY u.id, u.email, u.role, u.active;
