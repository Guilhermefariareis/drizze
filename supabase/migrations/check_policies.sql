-- Verificar políticas RLS da tabela credit_requests
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'credit_requests';

-- Verificar permissões da tabela
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'credit_requests' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;