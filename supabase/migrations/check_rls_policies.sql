-- Verificar políticas RLS atuais na tabela credit_requests

-- 1. Verificar se RLS está habilitado
SELECT 
    'RLS STATUS:' as info,
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'credit_requests';

-- 2. Verificar políticas existentes
SELECT 
    'POLICIES:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;

-- 3. Verificar permissões dos roles
SELECT 
    'PERMISSIONS:' as info,
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'credit_requests' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Verificar estrutura da tabela clinics para entender relacionamento
SELECT 
    'CLINICS STRUCTURE:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clinics'
ORDER BY ordinal_position;

-- 5. Verificar se existe tabela clinic_professionals
SELECT 
    'CLINIC_PROFESSIONALS EXISTS:' as info,
    EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clinic_professionals'
    ) as table_exists;