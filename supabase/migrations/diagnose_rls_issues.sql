-- Diagnóstico de problemas RLS para tabelas problemáticas
-- Executar no Supabase SQL Editor

-- 1. Verificar políticas RLS das tabelas problemáticas
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
WHERE tablename IN ('notificacoes', 'clinic_services', 'clinic_profiles')
ORDER BY tablename, policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('notificacoes', 'clinic_services', 'clinic_profiles')
AND schemaname = 'public';

-- 3. Verificar permissões das tabelas
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('notificacoes', 'clinic_services', 'clinic_profiles')
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- 4. Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('notificacoes', 'clinic_services', 'clinic_profiles')
ORDER BY table_name;