-- Verificar e corrigir políticas RLS para credit_requests

-- 1. Verificar políticas existentes
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
WHERE tablename = 'credit_requests';

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'credit_requests';

-- 3. Verificar permissões da tabela
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'credit_requests'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for them" ON credit_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON credit_requests;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON credit_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON credit_requests;

-- 5. Criar políticas RLS mais permissivas para authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON credit_requests
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Garantir que a tabela tenha as permissões corretas
GRANT ALL PRIVILEGES ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

-- 7. Verificar novamente as políticas após as alterações
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
WHERE tablename = 'credit_requests';