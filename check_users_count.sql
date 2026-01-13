SELECT count(*) as total_users FROM public.users;
SELECT count(*) as active_users FROM public.users WHERE active = true;
SELECT count(*) as inactive_users FROM public.users WHERE active = false;
