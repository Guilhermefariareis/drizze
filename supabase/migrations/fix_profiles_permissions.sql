-- Corrigir permissões da tabela profiles

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Conceder permissões básicas para anon e authenticated
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Desabilitar RLS temporariamente para permitir inserção de dados de teste
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Verificar permissões
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;