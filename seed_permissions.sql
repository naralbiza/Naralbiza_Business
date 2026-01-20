-- Seed Permissions (Flat script to avoid DO block syntax issues)

-- Cleanup existing permissions to avoid duplicates
DELETE FROM public.permissions;

-- Admin (Full Access)
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
WHERE name = 'Admin';

-- CEO (Full Access like Admin)
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
WHERE name = 'CEO / Direção';

-- Comercial
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('CRM & Vendas', true, true, true, false),
    ('Clientes & Relacionamento', true, true, true, false),
    ('Agenda', true, true, true, false),
    ('Pós-venda & Retenção', true, true, true, false),
    ('Marketing & Conteúdo', true, false, false, false)
) AS modules(m, v, c, e, a)
WHERE name = 'Comercial';

-- Financeiro
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('Financeiro', true, true, true, true),
    ('Clientes & Relacionamento', true, false, false, false),
    ('Agenda', true, true, true, false)
) AS modules(m, v, c, e, a)
WHERE name = 'Financeiro';

-- RH
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('RH & Performance', true, true, true, true),
    ('Metas', true, true, true, true),
    ('Processos & SOPs', true, true, true, false),
    ('Agenda', true, true, true, false)
) AS modules(m, v, c, e, a)
WHERE name = 'RH';

-- Creatives (Photographer)
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('📸 Fotografia', true, true, true, false),
    ('Produção', true, false, true, false),
    ('Gestão de Projectos', true, false, true, false),
    ('Activos Criativos (DAM)', true, true, true, false),
    ('Inventário & Equipamentos', true, false, false, false),
    ('Agenda', true, true, true, false),
    ('Processos & SOPs', true, false, false, false)
) AS modules(m, v, c, e, a)
WHERE name = 'Fotógrafo';

-- Creatives (Videographer)
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('🎥 Vídeo', true, true, true, false),
    ('Produção', true, false, true, false),
    ('Gestão de Projectos', true, false, true, false),
    ('Activos Criativos (DAM)', true, true, true, false),
    ('Inventário & Equipamentos', true, false, false, false),
    ('Agenda', true, true, true, false),
    ('Processos & SOPs', true, false, false, false)
) AS modules(m, v, c, e, a)
WHERE name = 'Videógrafo';

-- Social Media
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
SELECT id, m, v, c, e, a 
FROM public.roles, (VALUES 
    ('Dashboard Geral', true, false, false, false),
    ('📲 Social Media', true, true, true, false),
    ('Marketing & Conteúdo', true, true, true, false),
    ('Activos Criativos (DAM)', true, true, true, false),
    ('Agenda', true, true, true, false),
    ('Processos & SOPs', true, false, false, false)
) AS modules(m, v, c, e, a)
WHERE name = 'Social Media';
