-- Verificar permissões e dados específicos

-- 1. Verificar se o usuário atual tem acesso às tabelas
SELECT 'PERMISSOES ATUAIS:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name IN ('clinics', 'credit_requests')
ORDER BY table_name, grantee;

-- 2. Verificar RLS policies
SELECT 'POLICIES RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('clinics', 'credit_requests');

-- 3. Testar busca específica da clínica
SELECT 'BUSCA CLINICA ESPECIFICA:' as info;
SELECT id, name, master_user_id, owner_id
FROM clinics 
WHERE master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 4. Testar busca de solicitações para uma clínica específica
SELECT 'BUSCA SOLICITACOES ESPECIFICA:' as info;
SELECT id, patient_id, clinic_id, requested_amount, status, created_at
FROM credit_requests 
WHERE clinic_id = (
    SELECT id FROM clinics 
    WHERE master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
    LIMIT 1
);

-- 5. Verificar se há solicitações com clinic_id NULL ou inválido
SELECT 'SOLICITACOES PROBLEMATICAS:' as info;
SELECT id, patient_id, clinic_id, requested_amount, status
FROM credit_requests 
WHERE clinic_id IS NULL 
   OR clinic_id NOT IN (SELECT id FROM clinics);

-- 6. Verificar estrutura das tabelas
SELECT 'ESTRUTURA CREDIT_REQUESTS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'credit_requests'
ORDER BY ordinal_position;