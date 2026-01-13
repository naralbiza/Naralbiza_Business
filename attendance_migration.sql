-- Create attendance_records table
create table if not exists public.attendance_records (
    id uuid default gen_random_uuid() primary key,
    employee_id uuid references public.users(id) on delete cascade not null,
    date date not null,
    type text not null check (type in ('Falta', 'Atraso', 'Saída Antecipada', 'Presença')),
    reason text,
    duration_minutes integer default 0,
    status text default 'Pendente' check (status in ('Pendente', 'Justificada', 'Injustificada')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.attendance_records enable row level security;

create policy "Users can view their own attendance records"
    on public.attendance_records for select
    using (auth.uid() = employee_id);

create policy "Admins can view all attendance records"
    on public.attendance_records for select
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and users.role in ('Admin', 'CEO / Direção', 'RH')
        )
    );

create policy "Admins/RH can insert/update/delete attendance records"
    on public.attendance_records for all
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and users.role in ('Admin', 'CEO / Direção', 'RH')
        )
    );
