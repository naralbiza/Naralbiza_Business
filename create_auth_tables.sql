-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, module)
);

-- Create users table (if not exists) matches api.ts usage
-- Note: api.ts uses 'role' string column, not role_id.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  role TEXT, -- Storing role name to match typescript strings
  sector TEXT,
  active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop existing policies if they exist to avoid errors (not fully idempotent but cleaner for retries)
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true); -- Allow read for login flow

DROP POLICY IF EXISTS "Public read permissions" ON public.permissions;
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can read all users" ON public.users;
CREATE POLICY "Authenticated can read all users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users USING (true) WITH CHECK (true); -- For initial setup/admin scripts potentially

-- Seed Roles
INSERT INTO public.roles (name) VALUES
    ('Admin'),
    ('CEO / Direção'),
    ('Fotógrafo'),
    ('Videógrafo'),
    ('Social Media'),
    ('Comercial'),
    ('Financeiro'),
    ('RH')
ON CONFLICT (name) DO NOTHING;

-- Seed Admin Permissions (Full access to all modules)
DO $$
DECLARE
    admin_role_id UUID;
    module_name text;
    modules text[] := ARRAY[
        'Dashboard Geral', 
        'CRM & Vendas', 
        'Clientes & Relacionamento', 
        'Produção', 
        'Gestão de Projectos', 
        'Activos Criativos (DAM)', 
        'Inventário & Equipamentos', 
        'Financeiro', 
        'RH & Performance', 
        'Marketing & Conteúdo', 
        'Qualidade & Aprovação', 
        'Pós-venda & Retenção', 
        'Relatórios & BI', 
        'Processos & SOPs', 
        'Configurações & Administração', 
        'Administração'
    ];
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Admin';
    
    IF admin_role_id IS NOT NULL THEN
        FOREACH module_name IN ARRAY modules
        LOOP
            INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
            VALUES (admin_role_id, module_name, true, true, true, true)
            ON CONFLICT (role_id, module) DO UPDATE 
            SET can_view = true, can_create = true, can_edit = true, can_approve = true;
        END LOOP;
    END IF;
END $$;
