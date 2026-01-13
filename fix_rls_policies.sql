-- Reset User Policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Authenticated read users" ON public.users;
DROP POLICY IF EXISTS "Debug: Admin delete users" ON public.users;
DROP POLICY IF EXISTS "Debug: Admin update users" ON public.users;
DROP POLICY IF EXISTS "Debug: Allow all authenticated insert" ON public.users;
DROP POLICY IF EXISTS "Safe: Admin full users" ON public.users;
DROP POLICY IF EXISTS "Safe: Authenticated read users" ON public.users;
DROP POLICY IF EXISTS "Safe: Users update own" ON public.users;

-- Reset Permission Policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.permissions;
DROP POLICY IF EXISTS "Allow authenticated manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow authenticated read permissions" ON public.permissions;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create Permissive Policies (Fixes visibility and edit issues)
CREATE POLICY "Allow all for authenticated users" ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.permissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
