-- Testar a consulta que está falhando no frontend

-- 1. Verificar se o perfil existe
SELECT 
    'PERFIL VERIFICADO:' as status,
    id,
    user_id,
    email,
    role
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Verificar permissões na tabela credit_requests
SELECT 
    'PERMISSÕES CREDIT_REQUESTS:' as status,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'credit_requests'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 3. Verificar permissões na tabela clinics
SELECT 
    'PERMISSÕES CLINICS:' as status,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'clinics'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Testar a consulta que está falhando
SELECT 
    'TESTE DA CONSULTA:' as status,
    cr.id,
    cr.requested_amount,
    cr.status,
    cr.created_at,
    cr.treatment_description,
    cr.installments,
    cr.clinic_id,
    c.id as clinic_inner_id,
    c.name,
    c.phone,
    c.address
FROM credit_requests cr
INNER JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.patient_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
ORDER BY cr.created_at DESC;

-- 5. Verificar se existem solicitações para este usuário
SELECT 
    'SOLICITAÇÕES EXISTENTES:' as status,
    COUNT(*) as total_requests
FROM credit_requests 
WHERE patient_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 6. Verificar RLS (Row Level Security)
SELECT 
    'RLS STATUS:' as status,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('credit_requests', 'clinics');