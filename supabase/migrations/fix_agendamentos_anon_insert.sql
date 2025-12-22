-- Migração para permitir inserção de agendamentos por usuários anônimos
-- Necessário para o funcionamento do sistema de agendamentos de pacientes

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "unified_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "allow_anon_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_insert_agendamentos" ON agendamentos;

-- Criar política que permite inserção para usuários anônimos
CREATE POLICY "allow_anon_insert_agendamentos" ON agendamentos
    FOR INSERT WITH CHECK (
        -- Permitir inserção para usuários anônimos (necessário para frontend)
        auth.role() = 'anon'
        OR
        -- Usuários autenticados podem criar agendamentos para suas clínicas
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = agendamentos.clinica_id
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
        OR
        -- Pacientes podem criar seus próprios agendamentos
        (tipo_agendamento = 'paciente' AND auth.uid() = paciente_id)
        OR
        -- Agendamentos internos podem ser criados por usuários autenticados
        (tipo_agendamento = 'interno' AND auth.role() = 'authenticated')
    );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT, INSERT ON agendamentos TO anon;
GRANT ALL PRIVILEGES ON agendamentos TO authenticated;

-- Comentário sobre a política
COMMENT ON POLICY "allow_anon_insert_agendamentos" ON agendamentos IS 'Permite inserção de agendamentos por usuários anônimos e autenticados';