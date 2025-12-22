-- Corrigir políticas RLS para permitir que clínicas atualizem solicitações de crédito
-- PROBLEMA IDENTIFICADO: As políticas atuais usam relacionamentos incorretos

-- 1. Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "clinic_users_can_view_their_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_update_their_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view assigned credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can update assigned credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests directed to them" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can update requests directed to them" ON credit_requests;
DROP POLICY IF EXISTS "clinics_can_view_their_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinics_can_update_their_requests" ON credit_requests;

-- 2. Verificar estrutura atual das tabelas
-- A tabela clinics tem: master_user_id (UUID que referencia auth.users)
-- A tabela profiles tem: user_id (UUID que referencia auth.users) e role
-- A tabela credit_requests tem: clinic_id (UUID que referencia clinics.id)

-- 3. Criar políticas RLS corretas baseadas na estrutura real

-- Política para clínicas visualizarem suas solicitações
-- Uma clínica pode ver solicitações onde o clinic_id corresponde à sua clínica
-- E o usuário logado é o master_user_id da clínica OU tem role 'clinic' e está associado à clínica
CREATE POLICY "clinics_can_view_their_credit_requests" ON credit_requests
    FOR SELECT
    USING (
        -- Usuário é master da clínica
        clinic_id IN (
            SELECT id FROM clinics 
            WHERE master_user_id = auth.uid()
        )
        OR
        -- Usuário tem role clinic e está associado à clínica via clinic_professionals
        (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE user_id = auth.uid() AND role = 'clinic'
            )
            AND
            clinic_id IN (
                SELECT clinic_id FROM clinic_professionals 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

-- Política para clínicas atualizarem suas solicitações
-- Uma clínica pode atualizar solicitações onde o clinic_id corresponde à sua clínica
CREATE POLICY "clinics_can_update_their_credit_requests" ON credit_requests
    FOR UPDATE
    USING (
        -- Usuário é master da clínica
        clinic_id IN (
            SELECT id FROM clinics 
            WHERE master_user_id = auth.uid()
        )
        OR
        -- Usuário tem role clinic e está associado à clínica via clinic_professionals
        (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE user_id = auth.uid() AND role = 'clinic'
            )
            AND
            clinic_id IN (
                SELECT clinic_id FROM clinic_professionals 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

-- 4. Política para pacientes visualizarem suas próprias solicitações
CREATE POLICY "patients_can_view_own_credit_requests" ON credit_requests
    FOR SELECT
    USING (
        patient_id = auth.uid()
        OR
        patient_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 5. Política para administradores verem todas as solicitações
CREATE POLICY "admins_can_view_all_credit_requests" ON credit_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Garantir permissões básicas
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;

-- 7. Verificar se as políticas foram criadas corretamente
SELECT 
    'NOVA VERIFICAÇÃO DE POLÍTICAS:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;