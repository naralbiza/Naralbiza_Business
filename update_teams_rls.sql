-- Enable RLS for Teams modules
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- TEAMS Policies
DROP POLICY IF EXISTS "Public read teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated read teams" ON public.teams;
CREATE POLICY "Authenticated read teams" ON public.teams FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL USING (
  public.get_user_role(auth.uid()) IN ('Admin', 'CEO / Direção')
);

-- TEAM MEMBERS Policies
DROP POLICY IF EXISTS "Public read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated read team_members" ON public.team_members;
CREATE POLICY "Authenticated read team_members" ON public.team_members FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage team_members" ON public.team_members;
CREATE POLICY "Admins can manage team_members" ON public.team_members FOR ALL USING (
  public.get_user_role(auth.uid()) IN ('Admin', 'CEO / Direção')
);
