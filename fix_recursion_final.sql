-- EMERGENCY FIX FOR INVALID RECURSION ERROR
-- This script drops ALL policies on the users table and re-applies simple, non-recursive ones.

-- 1. Drop potentially conflicting function
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- 2. Clean up ALL existing policies on 'users'
DROP POLICY IF EXISTS "Authenticated can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.users;

-- 3. Define the non-recursive Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  -- Checks the JWT email claim directly. 
  -- ZERO database queries = ZERO recursion risk.
  RETURN (auth.jwt() ->> 'email') = 'admin@naralbiza.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-apply Safe Policies on 'users'

-- A: ALLOW READ (Generic authenticated read)
-- Everyone who is logged in can read names/roles (needed for UI to load)
CREATE POLICY "Safe: Authenticated read users" 
ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

-- B: ALLOW UPDATE (Own profile)
-- Users can update their own row
CREATE POLICY "Safe: Users update own" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- C: ALLOW ADMIN WRITE (Insert/Update/Delete)
-- Only 'admin@naralbiza.com' can do this via the helper function
CREATE POLICY "Safe: Admin insert users" 
ON public.users FOR INSERT 
WITH CHECK ( public.is_admin_safe() );

CREATE POLICY "Safe: Admin update users" 
ON public.users FOR UPDATE 
USING ( public.is_admin_safe() );

CREATE POLICY "Safe: Admin delete users" 
ON public.users FOR DELETE 
USING ( public.is_admin_safe() );

-- D: PERMISSIONS TABLE FIX (Just to be safe)
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Safe: Admin manage permissions" 
ON public.permissions FOR ALL 
USING ( public.is_admin_safe() );

-- E: ROLES TABLE FIX
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Safe: Admin manage roles" 
ON public.roles FOR ALL 
USING ( public.is_admin_safe() );

-- F: ENSURE RLS IS ENABLED
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
