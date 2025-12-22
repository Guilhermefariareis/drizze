-- Verificar as políticas RLS da tabela chat_sessions
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
WHERE tablename = 'chat_sessions'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'chat_sessions';

-- Verificar permissões da tabela
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'chat_sessions'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;