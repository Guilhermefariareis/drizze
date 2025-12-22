-- Adicionar campo especialidades à tabela clinic_leads
ALTER TABLE clinic_leads 
ADD COLUMN IF NOT EXISTS especialidades TEXT;

-- Comentário sobre o campo
COMMENT ON COLUMN clinic_leads.especialidades IS 'Lista de especialidades da clínica separadas por vírgula';