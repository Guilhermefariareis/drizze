-- Remover campos de configuração da API externa do Doutorizze da tabela clinics
-- Esta migração remove a integração com API externa, mantendo apenas o sistema interno

-- Remover índice relacionado ao Doutorizze
DROP INDEX IF EXISTS idx_clinics_doutorizze_enabled;

-- Remover campos da API externa do Doutorizze
ALTER TABLE clinics 
DROP COLUMN IF EXISTS doutorizze_api_url,
DROP COLUMN IF EXISTS doutorizze_api_token,
DROP COLUMN IF EXISTS doutorizze_enabled;

-- Atualizar campo booking_source para usar apenas 'internal'
UPDATE agendamentos 
SET booking_source = 'internal' 
WHERE booking_source = 'external';

-- Remover constraint que permitia 'external' como valor
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_booking_source_check;

-- Adicionar nova constraint apenas para 'internal'
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_booking_source_check 
CHECK (booking_source = 'internal');

-- Limpar external_id já que não usaremos mais
UPDATE agendamentos 
SET external_id = NULL 
WHERE external_id IS NOT NULL;

-- Remover índice do external_id
DROP INDEX IF EXISTS idx_agendamentos_external_id;

-- Atualizar comentários
COMMENT ON COLUMN agendamentos.external_id IS 'Campo mantido para compatibilidade (sempre NULL no sistema interno)';
COMMENT ON COLUMN agendamentos.booking_source IS 'Origem do agendamento: sempre internal (sistema Supabase)';