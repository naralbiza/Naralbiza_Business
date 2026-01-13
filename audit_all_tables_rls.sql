-- List all tables and their RLS enabled status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all existing policies
SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
