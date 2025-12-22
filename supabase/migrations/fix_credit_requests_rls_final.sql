-- Corrigir políticas RLS da tabela credit_requests para permitir inserção de pacientes autenticados

-- 1. Remover todas as políticas existentes para começar do zero
DROP POLICY IF EXISTS "authenticated_users_can_create_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_update_their_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "patients_can_view_own_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "admins_can_view_all_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinic users can view credit requests for their clinics" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Patients can create credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinic users can update credit requests" ON credit_requests;

-- 2. Verificar se RLS está habilitado
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- 3. Criar política para pacientes autenticados poderem inserir solicitações
CREATE POLICY "patients_can_insert_credit_requests" ON credit_requests
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND patient_id = auth.uid()
    );

-- 4. Criar política para pacientes visualizarem suas próprias solicitações
CREATE POLICY "patients_can_view_own_credit_requests" ON credit_requests
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND patient_id = auth.uid()
    );

-- 5. Criar política para usuários de clínicas visualizarem solicitações de suas clínicas
CREATE POLICY "clinic_users_can_view_clinic_credit_requests" ON credit_requests
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND (
            clinic_id IN (
                SELECT clinic_id 
                FROM clinic_professionals 
                WHERE user_id = auth.uid() AND is_active = true
            )
            OR
            clinic_id IN (
                SELECT id 
                FROM clinics 
                WHERE owner_id = auth.uid() OR master_user_id = auth.uid()
            )
        )
    );

-- 6. Criar política para usuários de clínicas atualizarem solicitações de suas clínicas
CREATE POLICY "clinic_users_can_update_clinic_credit_requests" ON credit_requests
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' 
        AND (
            clinic_id IN (
                SELECT clinic_id 
                FROM clinic_professionals 
                WHERE user_id = auth.uid() AND is_active = true
            )
            OR
            clinic_id IN (
                SELECT id 
                FROM clinics 
                WHERE owner_id = auth.uid() OR master_user_id = auth.uid()
            )
        )
    );

-- 7. Criar política para administradores terem acesso total
CREATE POLICY "admins_can_manage_all_credit_requests" ON credit_requests
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Garantir permissões básicas para usuários autenticados
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;

-- 9. Remover permissões desnecessárias para usuários anônimos
REVOKE ALL ON credit_requests FROM anon;

-- 10. Verificar se as políticas foram criadas corretamente
SELECT 
    'POLÍTICAS CRIADAS:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;

-- 11. Verificar se RLS está habilitado
SELECT 
    'STATUS RLS:' as info,
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'credit_requests';

-- 12. Verificar permissões dos roles
SELECT 
    'PERMISSÕES:' as info,
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' AND table_name = 'credit_requests'
ORDER BY grantee, privilege_type;