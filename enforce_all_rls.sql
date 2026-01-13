DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Loop through all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        
        -- Enable RLS (idempotent)
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        
        -- Drop ALL existing policies to remove incorrectly configured or restrictive ones
        -- We loop through policies for this table to drop them one by one
        DECLARE
            p RECORD;
        BEGIN
            FOR p IN (SELECT policyname FROM pg_policies WHERE tablename = r.tablename AND schemaname = 'public') LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', p.policyname, r.tablename);
            END LOOP;
        END;

        -- Create the ONE standard permissive policy
        -- "Allow all for authenticated users"
        EXECUTE format('CREATE POLICY "Allow all for authenticated users" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', r.tablename);
        
    END LOOP;

    -- 2. Grant usage on ALL sequences to ensure no ID generation errors
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
    
    -- 3. Grant all privileges on all tables to service_role (just in case)
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

END $$;
