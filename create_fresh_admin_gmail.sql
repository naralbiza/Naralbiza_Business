-- create_fresh_admin_gmail.sql
-- Run this in Supabase SQL Editor to create/update naralbizaservice@gmail.com as Admin

-- 1. Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_email text := 'naralbizaservice@gmail.com';
  new_password text := 'metrics.01';
  user_id uuid;
BEGIN
  -- 2. Check if user already exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = new_email;

  IF user_id IS NULL THEN
    -- Create new user if not exists
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      user_id,
      new_email,
      crypt(new_password, gen_salt('bf')),
      now(),
      '{"role": "Admin"}'::jsonb,
      '{"name": "Naralbiza Service", "role": "Admin"}'::jsonb,
      'authenticated',
      'authenticated'
    );
    RAISE NOTICE 'Created new auth user: %', new_email;
  ELSE
    -- Update existing user
    UPDATE auth.users
    SET 
        encrypted_password = crypt(new_password, gen_salt('bf')),
        raw_app_meta_data = raw_app_meta_data || '{"role": "Admin"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || '{"name": "Naralbiza Service", "role": "Admin"}'::jsonb,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = user_id;
    RAISE NOTICE 'Updated existing auth user: %', new_email;
  END IF;

  -- 3. Sync to public.users (Profile)
  INSERT INTO public.users (id, email, name, role, active, avatar_url)
  VALUES (
    user_id,
    new_email,
    'Naralbiza Service',
    'Admin',
    true,
    'https://ui-avatars.com/api/?name=Naralbiza+Service&background=random'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'Admin',
    active = true,
    name = EXCLUDED.name;
    
  RAISE NOTICE 'Synced public profile for user.';
END $$;

-- 4. Verify the result
SELECT id, email, role FROM public.users WHERE email = 'naralbizaservice@gmail.com';
