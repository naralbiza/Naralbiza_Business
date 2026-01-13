-- Function to get user role (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(u_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = u_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables (redundant if already enabled but safe)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. USERS Policies
DROP POLICY IF EXISTS "Authenticated can read all users" ON public.users;
CREATE POLICY "Authenticated can read all users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users TO service_role USING (true) WITH CHECK (true);

-- Admin policies for Users
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) = 'Admin' OR public.get_user_role(auth.uid()) = 'CEO / Direção'
);

CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (
  public.get_user_role(auth.uid()) = 'Admin' OR public.get_user_role(auth.uid()) = 'CEO / Direção'
);

CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (
  public.get_user_role(auth.uid()) = 'Admin' OR public.get_user_role(auth.uid()) = 'CEO / Direção'
);


-- 2. PERMISSIONS Policies
DROP POLICY IF EXISTS "Public read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Authenticated read permissions" ON public.permissions;

CREATE POLICY "Authenticated read permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (
  public.get_user_role(auth.uid()) = 'Admin' OR public.get_user_role(auth.uid()) = 'CEO / Direção'
);


-- 3. ROLES Policies
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated read roles" ON public.roles;

CREATE POLICY "Authenticated read roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (
  public.get_user_role(auth.uid()) = 'Admin' OR public.get_user_role(auth.uid()) = 'CEO / Direção'
);
