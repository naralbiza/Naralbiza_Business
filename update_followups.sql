-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure Follow-ups table exists (If missing)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT,
    notes TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new metrics columns if they don't exist
ALTER TABLE public.follow_ups
ADD COLUMN IF NOT EXISTS duration integer, -- Duration in minutes
ADD COLUMN IF NOT EXISTS outcome text,     -- e.g., 'Positive', 'Negative'
ADD COLUMN IF NOT EXISTS rating integer;   -- 1-5 quality rating
