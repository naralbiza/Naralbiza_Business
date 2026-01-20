-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cleanup existing tables to ensure type consistency (Resetting for new project)
DROP TABLE IF EXISTS public.weekly_reports CASCADE;
DROP TABLE IF EXISTS public.job_roles CASCADE;
DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.quality_checklist_items CASCADE;
DROP TABLE IF EXISTS public.quality_checklists CASCADE;
DROP TABLE IF EXISTS public.quality_revisions CASCADE;
DROP TABLE IF EXISTS public.client_approvals CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.marketing_metrics CASCADE;
DROP TABLE IF EXISTS public.editorial_content CASCADE;
DROP TABLE IF EXISTS public.feedbacks CASCADE;
DROP TABLE IF EXISTS public.follow_ups CASCADE;
DROP TABLE IF EXISTS public.sops CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.production_projects CASCADE;
DROP TABLE IF EXISTS public.goal_updates CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.taxes CASCADE;
DROP TABLE IF EXISTS public.budget_items CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.client_client_tags CASCADE;
DROP TABLE IF EXISTS public.client_tags CASCADE;
DROP TABLE IF EXISTS public.interactions CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.lead_files CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.lead_notes CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.notificacoes_email CASCADE;
DROP TABLE IF EXISTS public.agenda_eventos CASCADE;

-- 1. Leads and related tables
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    "position" TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    priority TEXT,
    status TEXT,
    owner_id UUID REFERENCES public.users(id),
    project_type TEXT,
    value NUMERIC DEFAULT 0,
    probability INTEGER,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    converted_to_client_id UUID, -- Will reference clients(id)
    internal_notes TEXT,
    last_status_change_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.lead_notes (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    text TEXT,
    author_id UUID REFERENCES public.users(id)
);

CREATE TABLE public.tasks (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    text TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false
);

CREATE TABLE public.lead_files (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    name TEXT,
    size TEXT,
    type TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clients and related tables
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    since TIMESTAMP WITH TIME ZONE,
    total_revenue NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update leads reference to clients
ALTER TABLE public.leads ADD CONSTRAINT leads_converted_to_client_id_fkey FOREIGN KEY (converted_to_client_id) REFERENCES public.clients(id);

CREATE TABLE public.interactions (
    id SERIAL PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT,
    notes TEXT
);

CREATE TABLE public.client_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT,
    color TEXT
);

CREATE TABLE public.client_client_tags (
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.client_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (client_id, tag_id)
);

-- 3. Proposals
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    title TEXT,
    total_value NUMERIC,
    discount NUMERIC,
    items JSONB, -- Storing ProposalItem[] as JSON
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Financials
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    amount NUMERIC,
    type TEXT, -- 'revenue' | 'expense'
    category TEXT,
    active BOOLEAN DEFAULT true,
    due_date DATE,
    issue_date DATE DEFAULT CURRENT_DATE,
    payment_date DATE,
    project_id UUID, -- Will reference production_projects later if needed
    payment_method TEXT,
    responsible_id UUID REFERENCES public.users(id),
    notes TEXT
);

CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID, -- Will reference production_projects later
    title TEXT,
    date DATE DEFAULT CURRENT_DATE,
    validity DATE,
    status TEXT,
    total_amount NUMERIC DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    final_value NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE,
    service TEXT,
    quantity NUMERIC DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0
);

CREATE TABLE public.taxes (
    id SERIAL PRIMARY KEY,
    name TEXT,
    amount NUMERIC,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    notes TEXT,
    responsible_id UUID REFERENCES public.users(id)
);

-- 5. Reports
CREATE TABLE public.reports (
    id SERIAL PRIMARY KEY,
    employee_id UUID REFERENCES public.users(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    status TEXT DEFAULT 'Pendente',
    role TEXT,
    leads_contacted INTEGER DEFAULT 0,
    sales_qualified_leads INTEGER DEFAULT 0,
    sales_proposals_sent INTEGER DEFAULT 0,
    contracts_signed INTEGER DEFAULT 0,
    sales_revenue NUMERIC DEFAULT 0,
    sales_conversion_rate NUMERIC DEFAULT 0,
    next_actions TEXT,
    projects_shot TEXT,
    hours_on_location NUMERIC DEFAULT 0,
    equipment_used TEXT,
    next_steps TEXT,
    tickets_resolved INTEGER DEFAULT 0,
    systems_maintenance TEXT,
    blockers TEXT,
    hr_employees TEXT,
    hr_freelancers TEXT,
    hr_roles TEXT,
    hr_performance TEXT,
    hr_performance_score INTEGER,
    hr_productivity TEXT,
    hr_productivity_score INTEGER,
    hr_absences TEXT,
    hr_training TEXT,
    hr_culture TEXT
);

-- 6. Notifications & Activities
CREATE TABLE public.notifications (
    id SERIAL PRIMARY KEY,
    title TEXT,
    message TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT false,
    type TEXT,
    user_id UUID REFERENCES public.users(id)
);

CREATE TABLE public.activities (
    id SERIAL PRIMARY KEY,
    actor_id UUID REFERENCES public.users(id),
    action TEXT,
    target TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT
);

-- 7. Goals
CREATE TABLE public.goals (
    id SERIAL PRIMARY KEY,
    title TEXT,
    target NUMERIC,
    current NUMERIC DEFAULT 0,
    type TEXT,
    employee_id UUID REFERENCES public.users(id),
    unit TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.goal_updates (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES public.goals(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 8. Production & DAM
CREATE TABLE public.production_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id),
    title TEXT,
    type TEXT,
    status TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    responsible_id UUID REFERENCES public.users(id),
    team_ids UUID[], -- Array of user IDs
    progress INTEGER DEFAULT 0,
    budget NUMERIC,
    actual_cost NUMERIC,
    notes TEXT,
    folder_url TEXT
);

-- Update references
ALTER TABLE public.transactions ADD CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.production_projects(id);
ALTER TABLE public.budgets ADD CONSTRAINT budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.production_projects(id);

CREATE TABLE public.assets (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    url TEXT,
    thumbnail_url TEXT,
    type TEXT, -- 'photo', 'video', 'design'
    project_id UUID REFERENCES public.production_projects(id),
    client_id UUID REFERENCES public.clients(id),
    tags TEXT[],
    dimensions TEXT,
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    versions JSONB -- Array of version objects
);

-- 9. Inventory
CREATE TABLE public.equipment (
    id SERIAL PRIMARY KEY,
    name TEXT,
    category TEXT,
    serial_number TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.users(id),
    value NUMERIC,
    notes TEXT
);

-- 10. SOPs
CREATE TABLE public.sops (
    id SERIAL PRIMARY KEY,
    title TEXT,
    category TEXT,
    content TEXT,
    author_id UUID REFERENCES public.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version TEXT,
    tags TEXT[]
);

-- 11. Follow-ups
CREATE TABLE public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT,
    notes TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Feedback & Referrals
CREATE TABLE public.feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id),
    project_id UUID REFERENCES public.production_projects(id),
    rating INTEGER,
    comment TEXT,
    testimonial BOOLEAN DEFAULT false,
    status TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_client_id UUID REFERENCES public.clients(id),
    referred_client_name TEXT,
    status TEXT,
    reward_status TEXT,
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Marketing
CREATE TABLE public.marketing_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT,
    reach INTEGER,
    engagement INTEGER,
    leads INTEGER,
    investment NUMERIC,
    date TEXT -- YYYY-MM
);

CREATE TABLE public.editorial_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    platform TEXT,
    format TEXT,
    status TEXT,
    publish_date TIMESTAMP WITH TIME ZONE,
    responsible_id UUID REFERENCES public.users(id),
    link TEXT
);

-- 14. Teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT
);

CREATE TABLE public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, employee_id)
);

-- 15. Notifications via email table
CREATE TABLE public.notificacoes_email (
    id SERIAL PRIMARY KEY,
    destinatario_email TEXT,
    assunto TEXT,
    conteudo_html TEXT,
    tipo_evento TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agenda
CREATE TABLE public.agenda_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  status TEXT DEFAULT 'agendado',
  tipo TEXT DEFAULT 'task', 
  responsible_id UUID REFERENCES public.users(id),
  attendee_ids UUID[], 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS for initial setup as requested
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_client_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_email DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_eventos DISABLE ROW LEVEL SECURITY;
