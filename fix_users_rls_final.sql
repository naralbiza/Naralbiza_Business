-- fix_users_rls_final.sql
-- Run this in Supabase SQL Editor to fix login redirect loop

-- 1. Enable RLS (if not already)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop specific existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

-- 3. Create permissive policies for authentication
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admins can read (and edit) everything
CREATE POLICY "Admins can do everything" 
ON public.users 
FOR ALL 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'CEO / Direção')
);

-- 4. Verify the Admin user exists strictly
-- Making sure naralbizaservice@gmail.com has the role 'Admin' so the second policy works for them
UPDATE public.users 
SET role = 'Admin', active = true
WHERE email = 'naralbizaservice@gmail.com';

-- 5. Force public read for debugging (Optional - use only if above fails)
-- Uncomment the next line if you still have issues, but it makes user list public
-- CREATE POLICY "Public read for login debug" ON public.users FOR SELECT USING (true);
