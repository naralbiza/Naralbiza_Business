-- create_fresh_admin_gmail.sql
-- Desenhado para garantir que o utilizador administrador existe com as credenciais corretas.

-- 1. Garantir extensões (necessário para encriptação de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Limpar utilizador existente para evitar conflitos de chaves
-- Isto garante que os novos IDs e permissões fiquem sincronizados
DELETE FROM auth.users WHERE email = 'naralbizaservice@gmail.com';

-- 3. Criar utilizador na tabela de autenticação (auth.users)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES (
  gen_random_uuid(),
  'naralbizaservice@gmail.com',
  crypt('metrics.01', gen_salt('bf')),
  now(),
  '{"role": "Admin"}'::jsonb,
  '{"name": "Naralbiza Service", "role": "Admin"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- 4. Criar perfil público (public.users)
-- Selecionamos o ID recém-criado em auth.users
INSERT INTO public.users (id, email, name, role, sector, active, avatar_url)
SELECT id, email, 'Naralbiza Service', 'Admin', 'Administração', true, 'https://ui-avatars.com/api/?name=Naralbiza+Service&background=random'
FROM auth.users 
WHERE email = 'naralbizaservice@gmail.com';

-- 5. Verificar resultado
SELECT id, email, role, sector FROM public.users WHERE email = 'naralbizaservice@gmail.com';
