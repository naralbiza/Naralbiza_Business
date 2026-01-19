-- enable_admin_access_all_modules.sql
-- Purpose: Grant full access (CRUD) to the Admin role for all tables in the system.

DO $$
DECLARE
    t text;
BEGIN
    -- Dynamically fetch all base tables in the public schema
    FOR t IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    ) LOOP
        -- 1. Enable RLS if not enabled
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- 2. Drop existing Admin policies to avoid duplicates/conflicts
        EXECUTE format('DROP POLICY IF EXISTS "admin_full_access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can do everything" ON public.%I', t);
        
        -- 3. Create the master Admin policy
        -- This policy checks if the authenticated user has 'Admin' or 'CEO / Direção' role in public.users
        EXECUTE format('
            CREATE POLICY "admin_full_access" ON public.%I
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.role IN (''Admin'', ''CEO / Direção'')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.role IN (''Admin'', ''CEO / Direção'')
                )
            )', t);
            
        RAISE NOTICE 'Applied Admin RLS policy to table: %', t;
    END LOOP;

    -- Special case for users table: Allow read for self even if not Admin (for login)
    DROP POLICY IF EXISTS "authenticated_users_read_own" ON public.users;
    CREATE POLICY "authenticated_users_read_own" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);

    RAISE NOTICE 'Master RLS setup completed.';
END $$;
