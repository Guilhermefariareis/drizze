-- Verificar se as solicitações de crédito estão sendo salvas e podem ser visualizadas

-- 1. Verificar todas as solicitações de crédito
SELECT 
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.installments,
    cr.status,
    cr.created_at,
    p.full_name as patient_name,
    c.name as clinic_name
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.id
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 2. Verificar especificamente para a clínica do usuário logado
SELECT 
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.installments,
    cr.status,
    cr.created_at,
    p.full_name as patient_name
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.id
WHERE cr.clinic_id IN (
    SELECT id FROM clinics 
    WHERE master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
    OR owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
)
ORDER BY cr.created_at DESC;

-- 3. Verificar se a clínica existe e qual é o ID
SELECT 
    id,
    name,
    master_user_id,
    owner_id
FROM clinics 
WHERE master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
OR owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 4. Verificar permissões atuais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('credit_requests', 'clinics', 'profiles')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('credit_requests', 'clinics', 'profiles')
ORDER BY tablename, policyname;