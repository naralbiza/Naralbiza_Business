-- fix_schema_and_migrate.sql
-- Purpose: Fix schema mismatch (BigInt vs UUID) and migrate legacy data to Naralbiza Service

DO $$
DECLARE
    new_admin_id UUID;
    count_leads INTEGER;
    count_reports INTEGER;
BEGIN
    -- 1. Identify the Target User (Naralbiza Service)
    SELECT id INTO new_admin_id 
    FROM auth.users 
    WHERE email = 'naralbizaservice@gmail.com';

    IF new_admin_id IS NULL THEN
        RAISE EXCEPTION 'Could not find target user "naralbizaservice@gmail.com". Please run create_fresh_admin_gmail.sql first.';
    END IF;

    RAISE NOTICE 'Target Admin ID: %', new_admin_id;

    -- ==========================================
    -- TABLE: LEADS (owner_id)
    -- ==========================================
    -- Check if owner_id is not UUID (i.e. if it's BigInt/Integer)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'owner_id' AND data_type NOT IN ('uuid')
    ) THEN
        RAISE NOTICE 'Fixing LEADS table schema...';
        
        -- Rename old column
        ALTER TABLE public.leads RENAME COLUMN owner_id TO owner_id_legacy;
        
        -- Add new correct column
        ALTER TABLE public.leads ADD COLUMN owner_id UUID REFERENCES public.users(id);
        
        -- Migrate data: Assign ALL orphaned legacy leads to the new admin
        -- (Since they can't point to UUID users, they belong to the system/admin now)
        UPDATE public.leads 
        SET owner_id = new_admin_id 
        WHERE owner_id_legacy IS NOT NULL;
        
        GET DIAGNOSTICS count_leads = ROW_COUNT;
        RAISE NOTICE 'Migrated % leads to new Admin.', count_leads;
    ELSE
        RAISE NOTICE 'Leads table checks out (owner_id is likely already UUID).';
        -- If it is already UUID, run the standard update just in case
        -- UPDATE public.leads SET owner_id = new_admin_id WHERE owner_id IS NOT NULL; -- Optional safe guard
    END IF;


    -- ==========================================
    -- TABLE: REPORTS (employee_id)
    -- ==========================================
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'employee_id' AND data_type NOT IN ('uuid')
    ) THEN
        RAISE NOTICE 'Fixing REPORTS table schema...';
        
        ALTER TABLE public.reports RENAME COLUMN employee_id TO employee_id_legacy;
        ALTER TABLE public.reports ADD COLUMN employee_id UUID REFERENCES public.users(id);
        
        UPDATE public.reports 
        SET employee_id = new_admin_id 
        WHERE employee_id_legacy IS NOT NULL;
        
        GET DIAGNOSTICS count_reports = ROW_COUNT;
        RAISE NOTICE 'Migrated % reports to new Admin.', count_reports;
    ELSE
        RAISE NOTICE 'Reports table checks out.';
    END IF;

    -- ==========================================
    -- TABLE: PRODUCTION_PROJECTS (responsible_id)
    -- ==========================================
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'production_projects' AND column_name = 'responsible_id' AND data_type NOT IN ('uuid')
    ) THEN
        RAISE NOTICE 'Fixing PRODUCTION_PROJECTS schema...';
        ALTER TABLE public.production_projects RENAME COLUMN responsible_id TO responsible_id_legacy;
        ALTER TABLE public.production_projects ADD COLUMN responsible_id UUID REFERENCES public.users(id);
        UPDATE public.production_projects SET responsible_id = new_admin_id WHERE responsible_id_legacy IS NOT NULL;
    END IF;

    -- ==========================================
    -- TABLE: TRANSACTIONS (responsible_id)
    -- ==========================================
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'responsible_id' AND data_type NOT IN ('uuid')
    ) THEN
        RAISE NOTICE 'Fixing TRANSACTIONS schema...';
        ALTER TABLE public.transactions RENAME COLUMN responsible_id TO responsible_id_legacy;
        ALTER TABLE public.transactions ADD COLUMN responsible_id UUID REFERENCES public.users(id);
        UPDATE public.transactions SET responsible_id = new_admin_id WHERE responsible_id_legacy IS NOT NULL;
    END IF;

    -- ==========================================
    -- TABLE: EQUIPMENT (assigned_to)
    -- ==========================================
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'assigned_to' AND data_type NOT IN ('uuid')
    ) THEN
        RAISE NOTICE 'Fixing EQUIPMENT schema...';
        ALTER TABLE public.equipment RENAME COLUMN assigned_to TO assigned_to_legacy;
        ALTER TABLE public.equipment ADD COLUMN assigned_to UUID REFERENCES public.users(id);
        UPDATE public.equipment SET assigned_to = new_admin_id WHERE assigned_to_legacy IS NOT NULL;
    END IF;
    
    
    RAISE NOTICE 'Schema fix and migration completed successfully.';

END $$;
