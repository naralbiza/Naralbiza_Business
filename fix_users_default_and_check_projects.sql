-- Fix users table to allow creating employees without auth accounts
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify production_projects structure
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'production_projects';
