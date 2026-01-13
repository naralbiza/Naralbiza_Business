-- Dynamic removal of ALL policies on 'users' to ensure a clean slate
-- This iterates over the system catalog to find any policy attached to 'public.users' and drops it.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- Drop potentially conflicting old functions
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_admin(); 
DROP FUNCTION IF EXISTS public.is_admin_safe(); 

-- Define the non-recursive Admin Check Function (Email based)
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  -- Strict checking of the email claim in the JWT.
  -- This does not touch the database tables, preventing any recursion loop.
  RETURN (auth.jwt() ->> 'email') = 'admin@naralbiza.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply Safe Policies
-- 1. Read Access (Essential for checking if user exists during login)
CREATE POLICY "Safe: Authenticated read users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Self Update
CREATE POLICY "Safe: Users update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Admin Full Access (guarded by is_admin_safe)
CREATE POLICY "Safe: Admin insert users" ON public.users FOR INSERT WITH CHECK ( public.is_admin_safe() );
CREATE POLICY "Safe: Admin update users" ON public.users FOR UPDATE USING ( public.is_admin_safe() );
CREATE POLICY "Safe: Admin delete users" ON public.users FOR DELETE USING ( public.is_admin_safe() );

-- Ensure RLS is active
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
