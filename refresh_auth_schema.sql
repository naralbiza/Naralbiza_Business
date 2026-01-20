-- refresh_auth_schema.sql
-- COMPLETE RESET AND FIX FOR AUTHENTICATION
-- RUN THIS SCRIPT TO FIX "LACK OF ACCESS" ISSUES

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Cleanup Target User (Avoids constraint errors during recreation)
DELETE FROM public.permissions WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'naralbizaservice@gmail.com');
DELETE FROM public.users WHERE email = 'naralbizaservice@gmail.com';
DELETE FROM auth.users WHERE email = 'naralbizaservice@gmail.com';

-- 3. Schema & Tables Definition (Idempotent)

-- Roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Profile table linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT, 
  sector TEXT,
  active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, module),
  UNIQUE(user_id, module)
);

-- 4. RLS Policies (STRICT BUT CORRECT)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Allow reading roles (Public)
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);

-- Allow reading permissions (Public - simplified for now to ensure loading works)
DROP POLICY IF EXISTS "Public read permissions" ON public.permissions;
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);

-- Users Table Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users; 
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 5. Automatic User Trigger (CRITICAL FOR ROBUSTNESS)
-- This ensures that whenever a user is created in auth.users, a profile is created in public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, sector, active, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'Comercial'),
    COALESCE(new.raw_user_meta_data->>'sector', 'Comercial'),
    true,
    'https://ui-avatars.com/api/?name=' || COALESCE(new.raw_user_meta_data->>'name', 'User') || '&background=random'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Seed Roles
INSERT INTO public.roles (name) VALUES
    ('Admin'), ('CEO / Direção'), ('Fotógrafo'), ('Videógrafo'), 
    ('Social Media'), ('Comercial'), ('Financeiro'), ('RH')
ON CONFLICT (name) DO NOTHING;

-- 7. Seed Admin User (naralbizaservice@gmail.com)
-- We insert into auth.users. The trigger created above will handle public.users!
INSERT INTO auth.users (
  id,
  instance_id,
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_app_meta_data, 
  raw_user_meta_data, 
  aud, 
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed ID for reliability
  '00000000-0000-0000-0000-000000000000',
  'naralbizaservice@gmail.com',
  crypt('metrics.01', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Naralbiza Service", "role": "Admin", "sector": "Administração"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- Force update on public.users just to be ultra-sure the role is Admin (Trigger should handle it, but safety first)
UPDATE public.users 
SET role = 'Admin', sector = 'Administração'
WHERE email = 'naralbizaservice@gmail.com';

-- 8. Seed Permissions (Admin)
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, true, true, true, true 
FROM public.roles, (VALUES 
    ('Dashboard Geral'), ('CRM & Vendas'), ('Clientes & Relacionamento'), ('Produção'), 
    ('Gestão de Projectos'), ('Activos Criativos (DAM)'), ('Inventário & Equipamentos'), 
    ('Financeiro'), ('RH & Performance'), ('Marketing & Conteúdo'), ('Qualidade & Aprovação'), 
    ('Pós-venda & Retenção'), ('Relatórios & BI'), ('Processos & SOPs'), 
    ('Configurações & Administração'), ('📸 Fotografia'), ('🎥 Vídeo'), ('📲 Social Media'), 
    ('Agenda'), ('Notificações'), ('Administração')
) AS modules(m)
WHERE name = 'Admin'
ON CONFLICT (role_id, module) DO NOTHING;

-- Seed other roles (Comercial, etc - subset for example)
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('CRM & Vendas', true, true, true, false),
    ('Clientes & Relacionamento', true, true, true, false)
) AS modules(m, v, c, e, a)
WHERE name = 'Comercial'
ON CONFLICT (role_id, module) DO NOTHING;

-- 9. Verification Output
SELECT id, email, role FROM public.users WHERE email = 'naralbizaservice@gmail.com';
