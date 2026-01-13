-- Ensure users table exists (simplified schema based on usage)
create table if not exists public.users (
  id uuid primary key, -- Often references auth.users(id) manually
  name text,
  email text,
  role text,
  sector text,
  active boolean default true,
  avatar_url text,
  department text,
  contract_type text,
  admission_date date,
  supervisor_id uuid references public.users(id),
  permissions jsonb, -- Storing permissions here or separate table? existing api uses separate table but mapUserFromDB uses join.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure job_roles table exists
create table if not exists public.job_roles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  kpis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create weekly_reports table
create table if not exists public.weekly_reports (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid not null references public.users(id),
  week_start_date date not null,
  week_end_date date not null,
  role_id uuid references public.job_roles(id),
  projects_worked text,
  hours_worked numeric default 0,
  deliveries_made integer default 0,
  difficulty_level integer default 3,
  self_evaluation integer default 3,
  main_challenges text,
  improvement_notes text,
  motivation_level integer default 3,
  absences_count integer default 0,
  absence_type text,
  attendance_notes text,
  week_evaluation integer default 3,
  feedback_text text,
  confirmed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Safe to run multiple times? Policies might error if exist)
alter table public.weekly_reports enable row level security;
alter table public.users enable row level security;
alter table public.job_roles enable row level security;

-- Policies
drop policy if exists "Users can view their own reports" on public.weekly_reports;
create policy "Users can view their own reports"
  on public.weekly_reports for select
  using (auth.uid() = employee_id);

drop policy if exists "Admins and HR can view all reports" on public.weekly_reports;
create policy "Admins and HR can view all reports"
  on public.weekly_reports for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and (users.role = 'Admin' or users.role = 'RH' or users.role = 'CEO / Direção')
    )
  );

drop policy if exists "Users can create their own reports" on public.weekly_reports;
create policy "Users can create their own reports"
  on public.weekly_reports for insert
  with check (auth.uid() = employee_id OR exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'Admin' -- Allow admins to create for others if needed
  ));

drop policy if exists "Users can update their own unconfirmed reports" on public.weekly_reports;
create policy "Users can update their own unconfirmed reports"
  on public.weekly_reports for update
  using (auth.uid() = employee_id AND confirmed = false);

drop policy if exists "Admins can update any report" on public.weekly_reports;
create policy "Admins can update any report"
  on public.weekly_reports for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and (users.role = 'Admin' or users.role = 'RH')
    )
  );
