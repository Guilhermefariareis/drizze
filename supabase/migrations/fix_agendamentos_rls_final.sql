-- Migração final para corrigir políticas RLS da tabela agendamentos
-- Resolve o problema: "new row violates row-level security policy for table agendamentos"

-- Remover TODAS as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "unified_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "authenticated_can_manage_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "allow_all_insert_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "unified_read_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "unified_update_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "unified_delete_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_read_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "clinics_can_view_their_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "pacientes_can_view_own_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "clinics_can_manage_their_agendamentos" ON agendamentos;

-- Política para permitir leitura de agendamentos (necessário para o frontend)
CREATE POLICY "agendamentos_select_policy" ON agendamentos
    FOR SELECT USING (
        -- Usuários anônimos podem ler (necessário para frontend)
        auth.role() = 'anon'
        OR
        -- Usuários autenticados podem ler seus próprios agendamentos
        (auth.role() = 'authenticated' AND auth.uid() = paciente_id)
        OR
        -- Proprietários de clínicas podem ler agendamentos de sua clínica
        (auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM clinics c 
            WHERE c.id = agendamentos.clinica_id 
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        ))
    );

-- Política para permitir inserção de agendamentos
CREATE POLICY "agendamentos_insert_policy" ON agendamentos
    FOR INSERT WITH CHECK (
        -- Usuários anônimos podem inserir (necessário para agendamentos de pacientes não cadastrados)
        auth.role() = 'anon'
        OR
        -- Usuários autenticados podem inserir agendamentos
        auth.role() = 'authenticated'
        OR
        -- Verificar se a clínica existe
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = agendamentos.clinica_id
        )
    );

-- Política para permitir atualização de agendamentos
CREATE POLICY "agendamentos_update_policy" ON agendamentos
    FOR UPDATE USING (
        -- Usuários autenticados podem atualizar seus próprios agendamentos
        (auth.role() = 'authenticated' AND auth.uid() = paciente_id)
        OR
        -- Proprietários de clínicas podem atualizar agendamentos de sua clínica
        (auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM clinics c 
            WHERE c.id = agendamentos.clinica_id 
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        ))
    );

-- Política para permitir exclusão de agendamentos
CREATE POLICY "agendamentos_delete_policy" ON agendamentos
    FOR DELETE USING (
        -- Usuários autenticados podem excluir seus próprios agendamentos
        (auth.role() = 'authenticated' AND auth.uid() = paciente_id)
        OR
        -- Proprietários de clínicas podem excluir agendamentos de sua clínica
        (auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM clinics c 
            WHERE c.id = agendamentos.clinica_id 
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        ))
    );

-- Garantir permissões básicas para os roles
GRANT SELECT, INSERT, UPDATE, DELETE ON agendamentos TO anon;
GRANT ALL PRIVILEGES ON agendamentos TO authenticated;

-- Garantir que RLS está habilitado
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Comentário sobre a migração
COMMENT ON TABLE agendamentos IS 'Políticas RLS corrigidas: anon (SELECT, INSERT), authenticated (ALL com restrições)';