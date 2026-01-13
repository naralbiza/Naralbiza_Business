-- Tabela: agenda_eventos
-- Objetivo: Armazenar eventos da agenda com suporte a UUID e datas completas (inicio/fim)

CREATE TYPE agenda_status AS ENUM ('agendado', 'concluido', 'cancelado');
CREATE TYPE agenda_tipo AS ENUM ('task', 'meeting', 'deadline');

CREATE TABLE IF NOT EXISTS agenda_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  status agenda_status DEFAULT 'agendado',
  tipo agenda_tipo DEFAULT 'task', -- Campo adicional para manter compatibilidade com cores da UI
  responsible_id INT, -- Manter compatibilidade com sistema de funcionários existente (IDs numéricos)
  attendee_ids INT[], -- Array de IDs de funcionários
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance em buscas por data
CREATE INDEX idx_agenda_data_inicio ON agenda_eventos(data_inicio);
CREATE INDEX idx_agenda_data_fim ON agenda_eventos(data_fim);

-- Políticas de segurança (RLS) - Exemplo básico
ALTER TABLE agenda_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total a usuários autenticados" ON agenda_eventos
  FOR ALL
  USING (auth.role() = 'authenticated');
