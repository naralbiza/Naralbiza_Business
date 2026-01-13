-- Migration: Clients Enhancement (Relacionamento & Histórico)
-- Adds support for Birthday, Complaints, Important Dates and Upsell Opportunities

-- 1. Add birthday to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday DATE;

-- 2. Create client_complaints table
CREATE TABLE IF NOT EXISTS public.client_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente', -- 'Pendente' | 'Resolvido' | 'Arquivado'
    severity TEXT DEFAULT 'Média' -- 'Baixa' | 'Média' | 'Alta'
);

-- 3. Create client_important_dates table
CREATE TABLE IF NOT EXISTS public.client_important_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'Other' -- 'Birthday' | 'Anniversary' | 'Event' | 'Other'
);

-- 4. Create client_upsell_opportunities table
CREATE TABLE IF NOT EXISTS public.client_upsell_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Identificada' -- 'Identificada' | 'Em Negociação' | 'Ganha' | 'Perdida'
);

-- 5. Link Feedback to Clients (Ensure table exists and has client_id)
-- The feedback table already exists in create_full_schema.sql but let's ensure it's correct
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedbacks') THEN
        CREATE TABLE public.feedbacks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
            project_id INTEGER REFERENCES public.production_projects(id) ON DELETE SET NULL,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            testimonial BOOLEAN DEFAULT false,
            status TEXT DEFAULT 'Pending',
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;
