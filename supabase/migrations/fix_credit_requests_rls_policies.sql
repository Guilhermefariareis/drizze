-- Correção das políticas RLS para tabela credit_requests
-- Esta migração resolve o erro 42501 (violação de política RLS)

-- Primeiro, remover todas as políticas existentes para credit_requests
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can create credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can update their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins can update all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view their credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can update their credit requests" ON credit_requests;

-- Política para permitir que usuários autenticados vejam suas próprias solicitações
CREATE POLICY "authenticated_users_can_view_own_requests" ON credit_requests
    FOR SELECT
    USING (
        auth.uid() = patient_id OR
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = patient_id
        )
    );

-- Política para permitir que usuários autenticados criem solicitações
CREATE POLICY "authenticated_users_can_create_requests" ON credit_requests
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            auth.uid() = patient_id OR
            auth.uid() IN (
                SELECT user_id FROM profiles WHERE id = patient_id
            )
        )
    );

-- Política para permitir que usuários autenticados atualizem suas próprias solicitações
CREATE POLICY "authenticated_users_can_update_own_requests" ON credit_requests
    FOR UPDATE
    USING (
        auth.uid() = patient_id OR
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = patient_id
        )
    );

-- Política para administradores verem todas as solicitações
CREATE POLICY "admins_can_view_all_requests" ON credit_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para administradores atualizarem todas as solicitações
CREATE POLICY "admins_can_update_all_requests" ON credit_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para clínicas verem suas solicitações
CREATE POLICY "clinics_can_view_their_requests" ON credit_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN clinics c ON p.clinic_id = c.id
            WHERE p.user_id = auth.uid() 
            AND c.id = credit_requests.clinic_id
        )
    );

-- Política para clínicas atualizarem suas solicitações
CREATE POLICY "clinics_can_update_their_requests" ON credit_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN clinics c ON p.clinic_id = c.id
            WHERE p.user_id = auth.uid() 
            AND c.id = credit_requests.clinic_id
        )
    );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

-- Comentário para documentar a correção
COMMENT ON TABLE credit_requests IS 'Tabela de solicitações de crédito odontológico - RLS corrigido em ' || NOW();