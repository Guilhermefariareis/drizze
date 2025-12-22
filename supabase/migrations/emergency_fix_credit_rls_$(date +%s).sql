-- Migração de emergência para corrigir políticas RLS da tabela credit_requests
-- Remove completamente as referências à tabela profiles/users
-- Data: 2025-01-29

-- 1. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "authenticated_users_can_insert_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "users_can_view_own_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinics_and_admins_can_update_credit_requests" ON credit_requests;

-- Remover outras políticas que possam existir
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can create credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can update their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_view_clinic_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "clinic_users_can_update_clinic_credit_requests" ON credit_requests;
DROP POLICY IF EXISTS "simple_insert_policy" ON credit_requests;
DROP POLICY IF EXISTS "simple_select_policy" ON credit_requests;
DROP POLICY IF EXISTS "simple_update_policy" ON credit_requests;
DROP POLICY IF EXISTS "simple_delete_policy" ON credit_requests;

-- 2. Criar políticas RLS simplificadas SEM referências a profiles/users

-- Política para inserção - permite que qualquer usuário autenticado insira
CREATE POLICY "simple_insert_policy" ON credit_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para visualização - permite que usuários autenticados vejam todas as solicitações
-- (será refinada posteriormente com base no clinic_id se necessário)
CREATE POLICY "simple_select_policy" ON credit_requests
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para atualização - permite que usuários autenticados atualizem
CREATE POLICY "simple_update_policy" ON credit_requests
    FOR UPDATE
    TO authenticated
    USING (true);

-- Política para exclusão - permite que usuários autenticados excluam
CREATE POLICY "simple_delete_policy" ON credit_requests
    FOR DELETE
    TO authenticated
    USING (true);

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

COMMENT ON TABLE credit_requests IS 'Tabela de solicitações de crédito - RLS simplificado sem referências a profiles/users';