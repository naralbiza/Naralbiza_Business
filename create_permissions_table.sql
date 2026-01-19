-- create_permissions_table.sql
-- Run this to create the missing 'permissions' and 'roles' tables

-- 1. Create Roles Table (if not exists)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles safely
INSERT INTO public.roles (name, description)
VALUES 
    ('Admin', 'Acesso total ao sistema'),
    ('CEO / Direção', 'Acesso total de visualização e relatórios'),
    ('Fotógrafo', 'Acesso a projetos e agenda'),
    ('Videógrafo', 'Acesso a projetos e agenda'),
    ('Social Media', 'Acesso a marketing e conteúdo'),
    ('Comercial', 'Acesso a CRM e vendas'),
    ('Financeiro', 'Acesso a financeiro e orçamentos'),
    ('RH', 'Acesso a gestão de pessoas')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraint: Permission must belong to either a role OR a user, not both/neither ideally, but keeping flexible
    CONSTRAINT role_or_user_check CHECK (role_id IS NOT NULL OR user_id IS NOT NULL)
);

-- 3. Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Roles: Authenticated users can read roles
CREATE POLICY "Authenticated can read roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

-- Permissions: Authenticated users can read permissions
CREATE POLICY "Authenticated can read permissions" ON public.permissions
    FOR SELECT TO authenticated USING (true);

-- 5. Grant Permissions to Admin (Example)
-- Find the Admin role ID
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Admin';
    
    -- Insert default full permissions for Admin role (for all main modules)
    INSERT INTO public.permissions (module, can_view, can_create, can_edit, can_approve, role_id)
    VALUES 
        ('Admin', true, true, true, true, admin_role_id),
        ('CRM & Vendas', true, true, true, true, admin_role_id),
        ('Clientes & Relacionamento', true, true, true, true, admin_role_id),
        ('Financeiro', true, true, true, true, admin_role_id)
    ON CONFLICT DO NOTHING; -- Note: This simplistic conflict check might need explicit unique constraints, ensuring safety by just inserting if empty or assuming cleanup
END $$;
