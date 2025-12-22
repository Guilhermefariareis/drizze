-- Adicionar campos de configuração da API externa do Doutorizze na tabela clinics
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS doutorizze_api_url TEXT,
ADD COLUMN IF NOT EXISTS doutorizze_api_token TEXT,
ADD COLUMN IF NOT EXISTS doutorizze_enabled BOOLEAN DEFAULT false;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN clinics.doutorizze_api_url IS 'URL base da API externa do Doutorizze para esta clínica';
COMMENT ON COLUMN clinics.doutorizze_api_token IS 'Token de autenticação para a API externa do Doutorizze';
COMMENT ON COLUMN clinics.doutorizze_enabled IS 'Indica se a integração com API externa está habilitada para esta clínica';

-- Criar índice para otimizar consultas por clínicas com API habilitada
CREATE INDEX IF NOT EXISTS idx_clinics_doutorizze_enabled 
ON clinics(doutorizze_enabled) 
WHERE doutorizze_enabled = true;

-- Adicionar campo para armazenar o ID externo nos agendamentos
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'internal' CHECK (booking_source IN ('internal', 'external'));

-- Adicionar comentários para os novos campos em agendamentos
COMMENT ON COLUMN agendamentos.external_id IS 'ID do agendamento no sistema externo (Doutorizze API)';
COMMENT ON COLUMN agendamentos.booking_source IS 'Origem do agendamento: internal (Supabase) ou external (API Doutorizze)';

-- Criar índice para otimizar consultas por origem do agendamento
CREATE INDEX IF NOT EXISTS idx_agendamentos_booking_source 
ON agendamentos(booking_source);

-- Criar índice para otimizar consultas por external_id
CREATE INDEX IF NOT EXISTS idx_agendamentos_external_id 
ON agendamentos(external_id) 
WHERE external_id IS NOT NULL;