-- Temporariamente desabilitar RLS para credit_requests para permitir testes
ALTER TABLE credit_requests DISABLE ROW LEVEL SECURITY;

-- Conceder todas as permissões necessárias
GRANT ALL PRIVILEGES ON credit_requests TO anon;
GRANT ALL PRIVILEGES ON credit_requests TO authenticated;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'credit_requests';

-- Verificar permissões
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' AND table_name = 'credit_requests' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;