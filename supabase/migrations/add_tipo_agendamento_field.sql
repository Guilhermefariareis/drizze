-- Migração para adicionar suporte a agendamentos internos
-- Adiciona campo tipo_agendamento e torna paciente_id opcional

-- Adicionar campo tipo_agendamento
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS tipo_agendamento VARCHAR(20) DEFAULT 'paciente' 
CHECK (tipo_agendamento IN ('paciente', 'interno'));

-- Tornar paciente_id opcional (remover NOT NULL constraint)
ALTER TABLE agendamentos 
ALTER COLUMN paciente_id DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN agendamentos.tipo_agendamento IS 'Tipo do agendamento: paciente (com cliente) ou interno (uso da clínica)';
COMMENT ON COLUMN agendamentos.paciente_id IS 'ID do paciente - opcional para agendamentos internos';

-- Atualizar políticas RLS para permitir agendamentos internos
-- Remover política antiga que exige paciente_id
DROP POLICY IF EXISTS "Pacientes podem ver seus próprios agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem atualizar seus próprios agendamentos" ON agendamentos;

-- Criar novas políticas que consideram agendamentos internos
CREATE POLICY "Usuários podem ver agendamentos relacionados" ON agendamentos
    FOR SELECT USING (
        auth.uid() = paciente_id OR 
        tipo_agendamento = 'interno'
    );

CREATE POLICY "Usuários podem criar agendamentos" ON agendamentos
    FOR INSERT WITH CHECK (
        (tipo_agendamento = 'paciente' AND auth.uid() = paciente_id) OR
        (tipo_agendamento = 'interno' AND paciente_id IS NULL)
    );

CREATE POLICY "Usuários podem atualizar agendamentos relacionados" ON agendamentos
    FOR UPDATE USING (
        auth.uid() = paciente_id OR 
        tipo_agendamento = 'interno'
    );

-- Criar índice para o novo campo
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo ON agendamentos(tipo_agendamento);