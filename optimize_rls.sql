-- 1. Helper function to check role from JWT (No DB query = No recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Checks "app_metadata" in the JWT. This is set by Supabase Auth (via our script or hooks)
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin' 
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'CEO / Direção';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Policies to use JWT-based check
-- USERS
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING ( public.is_admin() );

-- PERMISSIONS
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING ( public.is_admin() );

-- ROLES
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING ( public.is_admin() );
