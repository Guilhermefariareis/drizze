-- Script para corrigir políticas RLS da tabela clinics
-- Permitir que usuários autenticados atualizem suas próprias clínicas

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'clinics';

-- 2. Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can view their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can update their own clinics" ON clinics;
DROP POLICY IF EXISTS "Allow anonymous read access" ON clinics;
DROP POLICY IF EXISTS "clinic_select_policy" ON clinics;
DROP POLICY IF EXISTS "clinic_update_policy" ON clinics;
DROP POLICY IF EXISTS "clinic_insert_policy" ON clinics;
DROP POLICY IF EXISTS "clinic_delete_policy" ON clinics;

-- 3. Garantir que as permissões básicas estão corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON clinics TO authenticated;
GRANT SELECT ON clinics TO anon;

-- 4. Criar políticas RLS mais específicas e funcionais

-- Política para SELECT (leitura) - usuários autenticados podem ver suas clínicas
CREATE POLICY "authenticated_users_select_own_clinics" ON clinics
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = owner_id OR 
        auth.uid() = master_user_id OR
        auth.uid()::text = owner_id::text OR
        auth.uid()::text = master_user_id::text
    );

-- Política para UPDATE (atualização) - usuários autenticados podem atualizar suas clínicas
CREATE POLICY "authenticated_users_update_own_clinics" ON clinics
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner_id OR 
        auth.uid() = master_user_id OR
        auth.uid()::text = owner_id::text OR
        auth.uid()::text = master_user_id::text
    )
    WITH CHECK (
        auth.uid() = owner_id OR 
        auth.uid() = master_user_id OR
        auth.uid()::text = owner_id::text OR
        auth.uid()::text = master_user_id::text
    );

-- Política para INSERT (criação) - usuários autenticados podem criar clínicas
CREATE POLICY "authenticated_users_insert_clinics" ON clinics
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = owner_id OR 
        auth.uid() = master_user_id OR
        auth.uid()::text = owner_id::text OR
        auth.uid()::text = master_user_id::text
    );

-- Política para acesso anônimo (apenas leitura para dados públicos)
CREATE POLICY "anonymous_read_public_clinics" ON clinics
    FOR SELECT
    TO anon
    USING (true); -- Permite leitura de todas as clínicas para usuários anônimos

-- 5. Verificar as políticas criadas
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
WHERE schemaname = 'public' AND tablename = 'clinics'
ORDER BY policyname;

-- 6. Verificar permissões da tabela
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'clinics' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;