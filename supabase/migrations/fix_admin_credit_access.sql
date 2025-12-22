-- Corrigir acesso do painel admin às solicitações de crédito
-- Problema: RLS está bloqueando o acesso do admin às solicitações clinic_approved

-- 1. Verificar políticas atuais
SELECT 
    'POLÍTICAS ATUAIS:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;

-- 2. Remover políticas conflitantes para administradores
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "admins_can_view_all_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins can update all credit requests" ON credit_requests;

-- 3. Criar política específica para administradores
-- Administradores devem poder ver TODAS as solicitações de crédito
CREATE POLICY "admins_full_access_credit_requests" ON credit_requests
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 4. Garantir que a política para visualização geral também funcione
-- Esta política permite que usuários autenticados vejam solicitações clinic_approved
CREATE POLICY "authenticated_can_view_clinic_approved" ON credit_requests
    FOR SELECT
    TO authenticated
    USING (
        status IN ('clinic_approved', 'admin_analyzing', 'admin_approved', 'admin_rejected')
    );

-- 5. Verificar se as políticas foram criadas
SELECT 
    'POLÍTICAS APÓS CORREÇÃO:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;

-- 6. Testar se um usuário admin pode ver as solicitações
-- (Esta query será executada no contexto do usuário logado)
SELECT 
    'TESTE DE ACESSO ADMIN:' as info,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'clinic_approved' THEN 1 END) as clinic_approved_count
FROM credit_requests;