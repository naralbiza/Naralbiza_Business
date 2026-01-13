-- DEFINITIVE DATA PERSISTENCE FIX
-- This script adds missing tables and columns to ensure full data stability across all modules.

-- 1. QUALITY MODULE TABLES
CREATE TABLE IF NOT EXISTS public.quality_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.production_projects(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Draft',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quality_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.quality_checklists(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.production_projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    link_to_deliverable TEXT,
    status TEXT DEFAULT 'Pending',
    sent_date TIMESTAMPTZ DEFAULT now(),
    requested_by UUID REFERENCES auth.users(id),
    client_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quality_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.production_projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_log TEXT,
    client_feedback TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    author_id UUID REFERENCES auth.users(id),
    rework_time_hours DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FINANCIAL MODULE ENHANCEMENTS (Adding missing columns)
-- Check if columns exist before adding them to avoid errors
DO $$ 
BEGIN 
    -- Transactions enhancements
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'due_date') THEN
        ALTER TABLE public.transactions ADD COLUMN due_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'issue_date') THEN
        ALTER TABLE public.transactions ADD COLUMN issue_date DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'payment_date') THEN
        ALTER TABLE public.transactions ADD COLUMN payment_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'project_id') THEN
        ALTER TABLE public.transactions ADD COLUMN project_id UUID REFERENCES public.production_projects(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'payment_method') THEN
        ALTER TABLE public.transactions ADD COLUMN payment_method TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'responsible_id') THEN
        ALTER TABLE public.transactions ADD COLUMN responsible_id UUID REFERENCES auth.users(id);
    END IF;

    -- Taxes enhancements
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'taxes' AND COLUMN_NAME = 'due_date') THEN
        ALTER TABLE public.taxes ADD COLUMN due_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'taxes' AND COLUMN_NAME = 'responsible_id') THEN
        ALTER TABLE public.taxes ADD COLUMN responsible_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'taxes' AND COLUMN_NAME = 'notes') THEN
        ALTER TABLE public.taxes ADD COLUMN notes TEXT;
    END IF;
END $$;

-- 3. REPORTS MODULE ENHANCEMENTS (Adding metrics columns)
DO $$ 
BEGIN 
    -- Sales metrics
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'leads_contacted') THEN
        ALTER TABLE public.reports ADD COLUMN leads_contacted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'sales_qualified_leads') THEN
        ALTER TABLE public.reports ADD COLUMN sales_qualified_leads INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'sales_proposals_sent') THEN
        ALTER TABLE public.reports ADD COLUMN sales_proposals_sent INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'contracts_signed') THEN
        ALTER TABLE public.reports ADD COLUMN contracts_signed INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'sales_revenue') THEN
        ALTER TABLE public.reports ADD COLUMN sales_revenue DOUBLE PRECISION DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'sales_conversion_rate') THEN
        ALTER TABLE public.reports ADD COLUMN sales_conversion_rate DOUBLE PRECISION DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'next_actions') THEN
        ALTER TABLE public.reports ADD COLUMN next_actions TEXT;
    END IF;

    -- Creative metrics
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'projects_shot') THEN
        ALTER TABLE public.reports ADD COLUMN projects_shot TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hours_on_location') THEN
        ALTER TABLE public.reports ADD COLUMN hours_on_location DOUBLE PRECISION DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'equipment_used') THEN
        ALTER TABLE public.reports ADD COLUMN equipment_used TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'next_steps') THEN
        ALTER TABLE public.reports ADD COLUMN next_steps TEXT;
    END IF;

    -- HR specific in general reports (different from weekly_reports table)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_employees') THEN
        ALTER TABLE public.reports ADD COLUMN hr_employees TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_freelancers') THEN
        ALTER TABLE public.reports ADD COLUMN hr_freelancers TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_roles') THEN
        ALTER TABLE public.reports ADD COLUMN hr_roles TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_performance') THEN
        ALTER TABLE public.reports ADD COLUMN hr_performance TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_performance_score') THEN
        ALTER TABLE public.reports ADD COLUMN hr_performance_score INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_productivity') THEN
        ALTER TABLE public.reports ADD COLUMN hr_productivity TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_productivity_score') THEN
        ALTER TABLE public.reports ADD COLUMN hr_productivity_score INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_absences') THEN
        ALTER TABLE public.reports ADD COLUMN hr_absences TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_training') THEN
        ALTER TABLE public.reports ADD COLUMN hr_training TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'hr_culture') THEN
        ALTER TABLE public.reports ADD COLUMN hr_culture TEXT;
    END IF;

    -- IT metrics
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'tickets_resolved') THEN
        ALTER TABLE public.reports ADD COLUMN tickets_resolved INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'systems_maintenance') THEN
        ALTER TABLE public.reports ADD COLUMN systems_maintenance TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'blockers') THEN
        ALTER TABLE public.reports ADD COLUMN blockers TEXT;
    END IF;
END $$;
