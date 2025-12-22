-- Migração para corrigir conflitos entre políticas RLS de agendamentos
-- Remove políticas conflitantes e cria políticas unificadas

-- Remover TODAS as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "clinic_owners_can_view_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "clinic_owners_can_manage_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem ver agendamentos relacionados" ON agendamentos;
DROP POLICY IF EXISTS "authenticated_can_manage_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_read_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem ver seus próprios agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem atualizar seus próprios agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem atualizar agendamentos relacionados" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "clinics_can_view_their_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "pacientes_can_view_own_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "clinics_can_manage_their_agendamentos" ON agendamentos;

-- Política unificada para leitura de agendamentos
CREATE POLICY "unified_read_agendamentos" ON agendamentos
    FOR SELECT USING (
        -- Usuários anônimos podem ler todos os agendamentos (necessário para frontend)
        auth.role() = 'anon'
        OR
        -- Usuários autenticados podem ler agendamentos de suas clínicas
        EXISTS (
            SELECT 1 FROM clinics c 
            WHERE c.id = agendamentos.clinica_id 
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
        OR
        -- Pacientes podem ver seus próprios agendamentos
        auth.uid() = paciente_id
        OR
        -- Agendamentos internos podem ser vistos por usuários autenticados
        (tipo_agendamento = 'interno' AND auth.role() = 'authenticated')
    );

-- Política unificada para inserção de agendamentos
CREATE POLICY "unified_insert_agendamentos" ON agendamentos
    FOR INSERT WITH CHECK (
        -- Usuários anônimos podem criar agendamentos (necessário para frontend)
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

-- Política unificada para atualização de agendamentos
CREATE POLICY "unified_update_agendamentos" ON agendamentos
    FOR UPDATE USING (
        -- Usuários autenticados podem atualizar agendamentos de suas clínicas
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = agendamentos.clinica_id
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
        OR
        -- Pacientes podem atualizar seus próprios agendamentos
        auth.uid() = paciente_id
        OR
        -- Agendamentos internos podem ser atualizados por usuários autenticados
        (tipo_agendamento = 'interno' AND auth.role() = 'authenticated')
    );

-- Política unificada para exclusão de agendamentos
CREATE POLICY "unified_delete_agendamentos" ON agendamentos
    FOR DELETE USING (
        -- Usuários autenticados podem excluir agendamentos de suas clínicas
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = agendamentos.clinica_id
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
        OR
        -- Pacientes podem excluir seus próprios agendamentos
        auth.uid() = paciente_id
    );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT, INSERT ON agendamentos TO anon;
GRANT ALL PRIVILEGES ON agendamentos TO authenticated;

-- Comentários sobre as políticas
COMMENT ON TABLE agendamentos IS 'Políticas RLS unificadas: anon (SELECT, INSERT), authenticated (ALL)';