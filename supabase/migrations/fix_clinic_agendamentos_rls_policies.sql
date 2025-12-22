-- Corrigir políticas RLS para permitir que clínicas vejam seus agendamentos
-- Esta migração resolve o problema de exibição de agendamentos no painel da clínica

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

-- Política para permitir que usuários anônimos leiam agendamentos (necessário para o frontend)
CREATE POLICY "anon_can_read_agendamentos" ON agendamentos
    FOR SELECT
    TO anon
    USING (true);

-- Política para clínicas verem agendamentos de sua clínica
CREATE POLICY "clinics_can_view_their_agendamentos" ON agendamentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinics c 
            WHERE c.id = agendamentos.clinica_id 
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
    );

-- Política para pacientes verem seus próprios agendamentos
CREATE POLICY "pacientes_can_view_own_agendamentos" ON agendamentos
    FOR SELECT USING (auth.uid() = paciente_id);

-- Política para permitir que clínicas gerenciem seus agendamentos
CREATE POLICY "clinics_can_manage_their_agendamentos" ON agendamentos
    FOR ALL
    TO authenticated
    USING (
        -- Verificar se o usuário é owner ou master_user da clínica
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = agendamentos.clinica_id
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
        OR
        -- Permitir que pacientes gerenciem seus próprios agendamentos
        auth.uid() = paciente_id
    )
    WITH CHECK (
        -- Mesma verificação para INSERT/UPDATE
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = agendamentos.clinica_id
            AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
        )
        OR
        auth.uid() = paciente_id
    );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT ON agendamentos TO anon;
GRANT ALL PRIVILEGES ON agendamentos TO authenticated;

-- Verificar se as políticas foram aplicadas corretamente
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