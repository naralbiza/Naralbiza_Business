-- Seed Job Roles
INSERT INTO public.job_roles (name, description, kpis)
SELECT 'Videomaker', 'Responsável pela captação de imagens e vídeos', '[{"name": "Qualidade da Imagem", "weight": 40}, {"name": "Pontualidade", "weight": 30}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE name = 'Videomaker');

INSERT INTO public.job_roles (name, description, kpis)
SELECT 'Editor de Vídeo', 'Edição e pós-produção de vídeos', '[{"name": "Velocidade de Entrega", "weight": 40}, {"name": "Criatividade", "weight": 40}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE name = 'Editor de Vídeo');

INSERT INTO public.job_roles (name, description, kpis)
SELECT 'Fotógrafo', 'Captação e edição de fotografias', '[{"name": "Qualidade Técnica", "weight": 50}, {"name": "Fidelidade ao Briefing", "weight": 30}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE name = 'Fotógrafo');

INSERT INTO public.job_roles (name, description, kpis)
SELECT 'Social Media Manager', 'Gestão de redes sociais e conteúdo', '[{"name": "Engajamento", "weight": 40}, {"name": "Crescimento de Seguidores", "weight": 30}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE name = 'Social Media Manager');

INSERT INTO public.job_roles (name, description, kpis)
SELECT 'Designer Gráfico', 'Criação de artes e identidade visual', '[{"name": "Estética", "weight": 50}, {"name": "Prazo", "weight": 30}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE name = 'Designer Gráfico');

INSERT INTO public.job_roles (name, description, kpis)
SELECT 'Gestor de Tráfego', 'Gestão de campanhas de anúncios pagos', '[{"name": "ROAS", "weight": 60}, {"name": "Custo por Lead", "weight": 40}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE name = 'Gestor de Tráfego');
