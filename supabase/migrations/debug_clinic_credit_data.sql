-- Script SQL para diagnosticar o problema do clinic_id

-- 1. Verificar estrutura e dados da tabela clinics
SELECT 
    'CLINICS TABLE' as table_name,
    id,
    name,
    master_user_id,
    owner_id,
    created_at
FROM clinics 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar todas as solicitações de crédito
SELECT 
    'CREDIT_REQUESTS TABLE' as table_name,
    id,
    patient_name,
    clinic_id,
    status,
    requested_amount,
    created_at
FROM credit_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Verificar relacionamento entre clínicas e solicitações
SELECT 
    'CLINIC-REQUESTS RELATIONSHIP' as analysis,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name, c.master_user_id, c.owner_id
ORDER BY total_requests DESC;

-- 4. Verificar se há solicitações órfãs (sem clínica válida)
SELECT 
    'ORPHAN REQUESTS' as analysis,
    cr.id,
    cr.patient_name,
    cr.clinic_id,
    cr.status,
    CASE 
        WHEN c.id IS NULL THEN 'CLINIC NOT FOUND'
        ELSE 'CLINIC EXISTS'
    END as clinic_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE c.id IS NULL;

-- 5. Verificar usuários que podem ser donos de clínicas
SELECT 
    'POTENTIAL CLINIC OWNERS' as analysis,
    master_user_id as user_id,
    'master_user' as role
FROM clinics 
WHERE master_user_id IS NOT NULL
UNION
SELECT 
    'POTENTIAL CLINIC OWNERS' as analysis,
    owner_id as user_id,
    'owner' as role
FROM clinics 
WHERE owner_id IS NOT NULL;