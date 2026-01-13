-- rh_performance_migration.sql
-- 1. Job Roles & KPIs
CREATE TABLE IF NOT EXISTS public.job_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    kpis JSONB, -- Array of { name: string, weight: number }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Freelancers
CREATE TABLE IF NOT EXISTS public.freelancers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    main_function TEXT, -- e.g. Videomaker, Editor
    associated_projects INTEGER[], -- Array of client project IDs
    average_rating NUMERIC DEFAULT 0,
    availability TEXT,
    usage_frequency TEXT, -- 'baixo', 'médio', 'alto'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Weekly Reports (Standardized Forms)
CREATE TABLE IF NOT EXISTS public.weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    role_id UUID REFERENCES public.job_roles(id),
    -- Productivity
    projects_worked TEXT, -- Description of projects/tasks
    hours_worked NUMERIC,
    deliveries_made INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    -- Quality
    self_evaluation INTEGER CHECK (self_evaluation BETWEEN 1 AND 5),
    main_challenges TEXT,
    improvement_notes TEXT,
    -- Attendance
    absences_count INTEGER DEFAULT 0,
    absence_type TEXT, -- 'Justificada', 'Não justificada', 'Atraso recorrente'
    attendance_notes TEXT,
    -- Culture & Climate
    week_evaluation INTEGER CHECK (week_evaluation BETWEEN 1 AND 5),
    motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 5),
    feedback_text TEXT,
    confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Trainings (Capacitação)
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT, -- 'Treinamento', 'Workshop', 'Curso'
    date DATE NOT NULL,
    impact_level INTEGER CHECK (impact_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Culture & Feedback (Climate surveys)
CREATE TABLE IF NOT EXISTS public.culture_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Nullable for anonymous if needed, but for now we follow structure
    anonymous BOOLEAN DEFAULT FALSE,
    motivation_score INTEGER CHECK (motivation_score BETWEEN 1 AND 5),
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
    feedback_text TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Update users table with HR fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS contract_type TEXT,
ADD COLUMN IF NOT EXISTS admission_date DATE,
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.users(id);

-- Disable RLS for now to ensure smooth development
ALTER TABLE IF EXISTS public.job_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.freelancers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.weekly_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trainings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.culture_feedback DISABLE ROW LEVEL SECURITY;
