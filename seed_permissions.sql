DO $$
DECLARE
  r_admin UUID;
  r_ceo UUID;
  r_comercial UUID;
  r_financeiro UUID;
  r_rh UUID;
  r_photo UUID;
  r_video UUID;
  r_social UUID;
BEGIN
    SELECT id INTO r_admin FROM public.roles WHERE name = 'Admin';
    SELECT id INTO r_ceo FROM public.roles WHERE name = 'CEO / Direção';
    SELECT id INTO r_comercial FROM public.roles WHERE name = 'Comercial';
    SELECT id INTO r_financeiro FROM public.roles WHERE name = 'Financeiro';
    SELECT id INTO r_rh FROM public.roles WHERE name = 'RH';
    SELECT id INTO r_photo FROM public.roles WHERE name = 'Fotógrafo';
    SELECT id INTO r_video FROM public.roles WHERE name = 'Videógrafo';
    SELECT id INTO r_social FROM public.roles WHERE name = 'Social Media';

    -- CEO (Full Access like Admin)
    IF r_ceo IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_ceo;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_ceo, 'Dashboard Geral', true, true, true, true),
        (r_ceo, 'CRM & Vendas', true, true, true, true),
        (r_ceo, 'Clientes & Relacionamento', true, true, true, true),
        (r_ceo, 'Produção', true, true, true, true),
        (r_ceo, 'Gestão de Projectos', true, true, true, true),
        (r_ceo, 'Activos Criativos (DAM)', true, true, true, true),
        (r_ceo, 'Inventário & Equipamentos', true, true, true, true),
        (r_ceo, 'Financeiro', true, true, true, true),
        (r_ceo, 'RH & Performance', true, true, true, true),
        (r_ceo, 'Marketing & Conteúdo', true, true, true, true),
        (r_ceo, 'Qualidade & Aprovação', true, true, true, true),
        (r_ceo, 'Pós-venda & Retenção', true, true, true, true),
        (r_ceo, 'Relatórios & BI', true, true, true, true),
        (r_ceo, 'Processos & SOPs', true, true, true, true),
        (r_ceo, 'Configurações & Administração', true, true, true, true),
        (r_ceo, '📸 Fotografia', true, true, true, true),
        (r_ceo, '🎥 Vídeo', true, true, true, true),
        (r_ceo, '📲 Social Media', true, true, true, true),
        (r_ceo, 'Agenda', true, true, true, true),
        (r_ceo, 'Notificações', true, true, true, true),
        (r_ceo, 'Administração', true, true, true, true);
    END IF;

    -- Comercial
    IF r_comercial IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_comercial;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_comercial, 'Dashboard Geral', true, false, false, false),
        (r_comercial, 'CRM & Vendas', true, true, true, false),
        (r_comercial, 'Clientes & Relacionamento', true, true, true, false),
        (r_comercial, 'Agenda', true, true, true, false),
        (r_comercial, 'Pós-venda & Retenção', true, true, true, false),
        (r_comercial, 'Marketing & Conteúdo', true, false, false, false);
    END IF;

    -- Financeiro
    IF r_financeiro IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_financeiro;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_financeiro, 'Dashboard Geral', true, false, false, false),
        (r_financeiro, 'Financeiro', true, true, true, true),
        (r_financeiro, 'Clientes & Relacionamento', true, false, false, false),
        (r_financeiro, 'Agenda', true, true, true, false);
    END IF;

    -- RH
    IF r_rh IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_rh;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_rh, 'Dashboard Geral', true, false, false, false),
        (r_rh, 'RH & Performance', true, true, true, true),
        (r_rh, 'Metas', true, true, true, true),
        (r_rh, 'Processos & SOPs', true, true, true, false),
        (r_rh, 'Agenda', true, true, true, false);
    END IF;

    -- Creatives (Photographer)
    IF r_photo IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_photo;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_photo, 'Dashboard Geral', true, false, false, false),
        (r_photo, '📸 Fotografia', true, true, true, false),
        (r_photo, 'Produção', true, false, true, false),
        (r_photo, 'Gestão de Projectos', true, false, true, false),
        (r_photo, 'Activos Criativos (DAM)', true, true, true, false),
        (r_photo, 'Inventário & Equipamentos', true, false, false, false),
        (r_photo, 'Agenda', true, true, true, false),
        (r_photo, 'Processos & SOPs', true, false, false, false);
    END IF;

    -- Creatives (Videographer)
    IF r_video IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_video;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_video, 'Dashboard Geral', true, false, false, false),
        (r_video, '🎥 Vídeo', true, true, true, false),
        (r_video, 'Produção', true, false, true, false),
        (r_video, 'Gestão de Projectos', true, false, true, false),
        (r_video, 'Activos Criativos (DAM)', true, true, true, false),
        (r_video, 'Inventário & Equipamentos', true, false, false, false),
        (r_video, 'Agenda', true, true, true, false),
        (r_video, 'Processos & SOPs', true, false, false, false);
    END IF;

    -- Social Media
    IF r_social IS NOT NULL THEN
        DELETE FROM public.permissions WHERE role_id = r_social;
        INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_approve)
        VALUES 
        (r_social, 'Dashboard Geral', true, false, false, false),
        (r_social, '📲 Social Media', true, true, true, false),
        (r_social, 'Marketing & Conteúdo', true, true, true, false),
        (r_social, 'Activos Criativos (DAM)', true, true, true, false),
        (r_social, 'Agenda', true, true, true, false),
        (r_social, 'Processos & SOPs', true, false, false, false);
    END IF;

END $$;
