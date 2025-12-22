-- Correção definitiva das políticas RLS para credit_requests
-- Problema: patient_id referencia profiles.id, mas políticas usam auth.uid()
-- Solução: Usar a relação correta profiles.user_id = auth.uid()

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "patients_can_insert_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "patients_can_view_own_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_view_clinic_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_update_clinic_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "admins_can_manage_all_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "authenticated_users_can_create_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_update_their_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinic users can view credit requests for their clinics" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Patients can create credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinic users can update credit requests" ON credit_requests;
DROP POLICY IF EXISTS "clinics_can_view_their_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinics_can_update_their_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_policy" ON credit_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON credit_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON credit_requests;
DROP POLICY IF EXISTS "Enable update for users based on email" ON credit_requests;

-- 2. Garantir que RLS está habilitado
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- 3. Política para pacientes inserirem suas próprias solicitações
CREATE POLICY "patients_can_insert_credit_requests" ON credit_requests
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND patient_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 4. Política para pacientes visualizarem suas próprias solicitações
CREATE POLICY "patients_can_view_own_credit_requests" ON credit_requests
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND patient_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 5. Política para clínicas visualizarem solicitações direcionadas a elas
CREATE POLICY "clinics_can_view_their_credit_requests" ON credit_requests
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND clinic_id IN (
            SELECT id FROM clinics 
            WHERE master_user_id = auth.uid() 
               OR owner_id = auth.uid()
               OR id IN (
                   SELECT clinic_id FROM clinic_professionals 
                   WHERE user_id IN (
                       SELECT id FROM profiles WHERE user_id = auth.uid()
                   ) AND is_active = true
               )
        )
    );

-- 6. Política para clínicas atualizarem solicitações direcionadas a elas
CREATE POLICY "clinics_can_update_their_credit_requests" ON credit_requests
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' 
        AND clinic_id IN (
            SELECT id FROM clinics 
            WHERE master_user_id = auth.uid() 
               OR owner_id = auth.uid()
               OR id IN (
                   SELECT clinic_id FROM clinic_professionals 
                   WHERE user_id IN (
                       SELECT id FROM profiles WHERE user_id = auth.uid()
                   ) AND is_active = true
               )
        )
    );

-- 7. Política para administradores terem acesso total
CREATE POLICY "admins_can_manage_all_credit_requests" ON credit_requests
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Garantir permissões corretas
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;
REVOKE ALL ON credit_requests FROM anon;

-- 9. Verificar se as políticas foram criadas
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