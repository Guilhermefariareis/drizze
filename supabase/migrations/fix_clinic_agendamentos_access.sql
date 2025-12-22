-- Migração para corrigir acesso de clínicas aos seus agendamentos
-- Remove políticas antigas e cria novas que permitem clínicas verem seus agendamentos

-- Remove políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Usuários podem ver agendamentos relacionados" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_read_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "authenticated_can_manage_agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Users can view related appointments" ON agendamentos;
DROP POLICY IF EXISTS "Users can manage their clinic appointments" ON agendamentos;

-- Política para permitir que usuários anônimos vejam agendamentos (necessário para algumas operações)
CREATE POLICY "anon_can_read_agendamentos" ON agendamentos
    FOR SELECT
    TO anon
    USING (true);

-- Política para permitir que usuários autenticados vejam agendamentos de suas clínicas
CREATE POLICY "clinic_owners_can_view_agendamentos" ON agendamentos
    FOR SELECT
    TO authenticated
    USING (
        -- Verifica se o usuário é owner ou master_user da clínica
        clinica_id IN (
            SELECT id FROM clinicas 
            WHERE owner_id = auth.uid() 
               OR master_user_id = auth.uid()
        )
        OR
        -- Permite ver agendamentos internos
        tipo_agendamento = 'interno'
        OR
        -- Permite ver agendamentos onde o usuário é o paciente
        paciente_id = auth.uid()
    );

-- Política para permitir que usuários autenticados gerenciem agendamentos de suas clínicas
CREATE POLICY "clinic_owners_can_manage_agendamentos" ON agendamentos
    FOR ALL
    TO authenticated
    USING (
        -- Verifica se o usuário é owner ou master_user da clínica
        clinica_id IN (
            SELECT id FROM clinicas 
            WHERE owner_id = auth.uid() 
               OR master_user_id = auth.uid()
        )
        OR
        -- Permite gerenciar agendamentos internos
        tipo_agendamento = 'interno'
        OR
        -- Permite gerenciar agendamentos onde o usuário é o paciente
        paciente_id = auth.uid()
    )
    WITH CHECK (
        -- Mesma verificação para operações de INSERT/UPDATE
        clinica_id IN (
            SELECT id FROM clinicas 
            WHERE owner_id = auth.uid() 
               OR master_user_id = auth.uid()
        )
        OR
        tipo_agendamento = 'interno'
        OR
        paciente_id = auth.uid()
    );

-- Garante que as permissões básicas estejam configuradas
GRANT SELECT ON agendamentos TO anon;
GRANT ALL PRIVILEGES ON agendamentos TO authenticated;

-- Verifica se as políticas foram aplicadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'agendamentos'
ORDER BY policyname;