-- fix_rls_recursion.sql
-- This script fixes the redirect loop by resolving RLS recursion.
-- It uses a SECURITY DEFINER function for the Admin check, which bypasses RLS for that specific query.

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('Admin', 'CEO / Direção')
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update all policies to use the function instead of the recursive subquery
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    ) LOOP
        -- Drop the old recursive policy
        EXECUTE format('DROP POLICY IF EXISTS "admin_full_access" ON public.%I', t);
        
        -- Create the new non-recursive policy
        EXECUTE format('
            CREATE POLICY "admin_full_access" ON public.%I
            FOR ALL
            TO authenticated
            USING (public.check_is_admin())
            WITH CHECK (public.check_is_admin())', t);
            
        RAISE NOTICE 'Updated Admin RLS policy for table: %', t;
    END LOOP;

    -- 3. Special handling for users and roles to ensure login always works
    -- Users must be able to see their own profile to log in!
    DROP POLICY IF EXISTS "authenticated_users_read_own" ON public.users;
    CREATE POLICY "authenticated_users_read_own" ON public.users 
    FOR SELECT TO authenticated 
    USING (auth.uid() = id);

    -- Allow everyone to see roles (needed for login/permission check)
    DROP POLICY IF EXISTS "allow_read_roles" ON public.roles;
    CREATE POLICY "allow_read_roles" ON public.roles 
    FOR SELECT TO authenticated 
    USING (true);

    -- Allow everyone to see permissions (needed for app handshake)
    DROP POLICY IF EXISTS "allow_read_permissions" ON public.permissions;
    CREATE POLICY "allow_read_permissions" ON public.permissions 
    FOR SELECT TO authenticated 
    USING (true);

    RAISE NOTICE 'RLS Recursion fix completed.';
END $$;
