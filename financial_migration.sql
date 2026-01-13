-- Migration: Ensure transactions table exists and has financial expansion fields
-- This script is idempotent and handles both fresh installations and updates

-- 1. Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    amount NUMERIC,
    type TEXT, -- 'revenue' | 'expense'
    category TEXT,
    active BOOLEAN DEFAULT true 
);

-- 2. Add expansion fields for Accounts Receivable/Payable and Project tracking
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Paid',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES public.production_projects(id),
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Update existing transactions to have 'Paid' status if they don't have one
UPDATE public.transactions SET status = 'Paid' WHERE status IS NULL;

-- 4. Ensure other related financial tables exist (Budgets and Taxes)
CREATE TABLE IF NOT EXISTS public.budgets (
    id SERIAL PRIMARY KEY,
    category TEXT,
    "limit" NUMERIC,
    spent NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.taxes (
    id SERIAL PRIMARY KEY,
    name TEXT,
    amount NUMERIC,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    responsible_id UUID REFERENCES public.users(id)
);
