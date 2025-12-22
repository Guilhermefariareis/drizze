-- Correção FINAL das políticas RLS para tabela credit_requests
-- Esta migração resolve o erro "permission denied for table users"

-- 1. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "patients_can_insert_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "patients_can_view_own_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_view_clinic_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_update_clinic_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "admins_can_manage_all_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "authenticated_users_can_create_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins and clinics can update credit requests" ON credit_requests;
DROP POLICY IF EXISTS "authenticated_users_can_insert_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "users_can_view_own_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinics_and_admins_can_update_credit_requests" ON credit_requests;

-- 2. Criar políticas RLS simplificadas que não dependem da tabela auth.users

-- Política para inserção - permite que qualquer usuário autenticado insira
CREATE POLICY "authenticated_users_can_insert_credit_requests" ON credit_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para visualização - permite que usuários vejam suas próprias solicitações
CREATE POLICY "users_can_view_own_credit_requests" ON credit_requests
    FOR SELECT
    TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR 
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE user_id = auth.uid() AND clinic_id IS NOT NULL
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND account_type = 'admin'
        )
    );

-- Política para atualização - permite que clínicas e admins atualizem
CREATE POLICY "clinics_and_admins_can_update_credit_requests" ON credit_requests
    FOR UPDATE
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE user_id = auth.uid() AND clinic_id IS NOT NULL
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND account_type = 'admin'
        )
    )
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE user_id = auth.uid() AND clinic_id IS NOT NULL
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND account_type = 'admin'
        )
    );

-- 3. Garantir que RLS está habilitado
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- 4. Verificar as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;

COMMENT ON TABLE credit_requests IS 'Tabela de solicitações de crédito - RLS corrigido sem dependência da tabela auth.users';