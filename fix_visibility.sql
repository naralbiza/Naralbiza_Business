-- Revoke conflicting policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.permissions;
DROP POLICY IF EXISTS "Authenticated read users" ON public.users;
DROP POLICY IF EXISTS "Authenticated read permissions" ON public.permissions;

-- Enable RLS (just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 1. Create robust READ policy for users
CREATE POLICY "Enable read access for authenticated users" ON public.users
FOR SELECT
TO authenticated
USING (true);

-- 2. Create robust READ policy for permissions
CREATE POLICY "Enable read access for authenticated users" ON public.permissions
FOR SELECT
TO authenticated
USING (true);

-- Verification Queries
SELECT count(*) as user_count FROM public.users;
SELECT count(*) as permission_count FROM public.permissions;
SELECT * FROM pg_policies WHERE tablename IN ('users', 'permissions');
