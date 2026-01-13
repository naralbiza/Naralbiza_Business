-- definitive_rls_setup.sql
-- Goal: Professional server-side enforcement of permissions using RLS.

-- 1. Ensure user_id column exists in permissions table for user-level overrides
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='permissions' AND column_name='user_id') THEN
        ALTER TABLE public.permissions ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON public.permissions(role_id);

-- 3. Security Definer function to check permissions (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.check_rbac(p_module text, p_action text)
RETURNS boolean AS $$
DECLARE
    v_user_role text;
    v_user_id uuid := auth.uid();
    v_has_permission boolean := false;
BEGIN
    -- If no user is logged in, no permission
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Get user role
    SELECT role INTO v_user_role FROM public.users WHERE id = v_user_id;

    -- Superusers bypass everything
    IF v_user_role IN ('Admin', 'CEO / Direção') THEN
        RETURN true;
    END IF;

    -- Check for specific user override first
    EXECUTE format('SELECT %I FROM public.permissions WHERE user_id = %L AND module = %L', 
                   'can_' || p_action, v_user_id, p_module)
    INTO v_has_permission;

    IF v_has_permission IS TRUE THEN
        RETURN true;
    END IF;

    -- If no user override, check role-based permissions
    EXECUTE format('SELECT %I FROM public.permissions p 
                    JOIN public.users u ON p.role_id::text = u.role -- Assuming role_id stores role name or matches role string
                    WHERE u.id = %L AND p.module = %L AND p.user_id IS NULL', 
                   'can_' || p_action, v_user_id, p_module)
    INTO v_has_permission;

    RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS on core tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 5. Define Policies

-- LEADS (CRM & Vendas)
DROP POLICY IF EXISTS "Leads View Policy" ON public.leads;
CREATE POLICY "Leads View Policy" ON public.leads FOR SELECT USING (check_rbac('CRM & Vendas', 'view'));

DROP POLICY IF EXISTS "Leads Create Policy" ON public.leads;
CREATE POLICY "Leads Create Policy" ON public.leads FOR INSERT WITH CHECK (check_rbac('CRM & Vendas', 'create'));

DROP POLICY IF EXISTS "Leads Edit Policy" ON public.leads;
CREATE POLICY "Leads Edit Policy" ON public.leads FOR UPDATE USING (check_rbac('CRM & Vendas', 'edit'));

DROP POLICY IF EXISTS "Leads Delete Policy" ON public.leads;
CREATE POLICY "Leads Delete Policy" ON public.leads FOR DELETE USING (check_rbac('CRM & Vendas', 'edit'));

-- CLIENTS (Clientes & Relacionamento)
DROP POLICY IF EXISTS "Clients View Policy" ON public.clients;
CREATE POLICY "Clients View Policy" ON public.clients FOR SELECT USING (check_rbac('Clientes & Relacionamento', 'view'));

DROP POLICY IF EXISTS "Clients Create Policy" ON public.clients;
CREATE POLICY "Clients Create Policy" ON public.clients FOR INSERT WITH CHECK (check_rbac('Clientes & Relacionamento', 'create'));

DROP POLICY IF EXISTS "Clients Edit Policy" ON public.clients;
CREATE POLICY "Clients Edit Policy" ON public.clients FOR UPDATE USING (check_rbac('Clientes & Relacionamento', 'edit'));

DROP POLICY IF EXISTS "Clients Delete Policy" ON public.clients;
CREATE POLICY "Clients Delete Policy" ON public.clients FOR DELETE USING (check_rbac('Clientes & Relacionamento', 'edit'));

-- TRANSACTIONS (Financeiro)
DROP POLICY IF EXISTS "Transactions View Policy" ON public.transactions;
CREATE POLICY "Transactions View Policy" ON public.transactions FOR SELECT USING (check_rbac('Financeiro', 'view'));

DROP POLICY IF EXISTS "Transactions Create Policy" ON public.transactions;
CREATE POLICY "Transactions Create Policy" ON public.transactions FOR INSERT WITH CHECK (check_rbac('Financeiro', 'create'));

DROP POLICY IF EXISTS "Transactions Edit Policy" ON public.transactions;
CREATE POLICY "Transactions Edit Policy" ON public.transactions FOR UPDATE USING (check_rbac('Financeiro', 'edit'));

DROP POLICY IF EXISTS "Transactions Delete Policy" ON public.transactions;
CREATE POLICY "Transactions Delete Policy" ON public.transactions FOR DELETE USING (check_rbac('Financeiro', 'edit'));

-- USERS (Allow self-view and Admin view)
DROP POLICY IF EXISTS "Users View Policy" ON public.users;
CREATE POLICY "Users View Policy" ON public.users FOR SELECT USING (
    auth.uid() = id OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'CEO / Direção')
);

-- PERMISSIONS (Allow self-view and Admin management)
DROP POLICY IF EXISTS "Permissions View Policy" ON public.permissions;
CREATE POLICY "Permissions View Policy" ON public.permissions FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'CEO / Direção')
);

-- 6. Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.check_rbac(text, text) TO authenticated;
