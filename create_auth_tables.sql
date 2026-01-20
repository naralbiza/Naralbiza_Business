-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed basic roles
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

-- Create users table
-- Adding ON DELETE CASCADE to ensure cleanup during reset
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

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure unique constraint for role permissions
ALTER TABLE public.permissions DROP CONSTRAINT IF EXISTS permissions_role_id_module_key;
ALTER TABLE public.permissions ADD CONSTRAINT permissions_role_id_module_key UNIQUE (role_id, module);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read permissions" ON public.permissions;
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own permissions" ON public.permissions;
CREATE POLICY "Users can insert own permissions" ON public.permissions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can read all users" ON public.users;
CREATE POLICY "Authenticated can read all users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users USING (true) WITH CHECK (true);
