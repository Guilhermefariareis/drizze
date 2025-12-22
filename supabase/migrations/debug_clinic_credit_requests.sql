-- Script para debugar problema das solicitações não chegarem ao painel da clínica

-- 1. Verificar todas as solicitações de crédito
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_id,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
ORDER BY cr.created_at DESC
LIMIT 10;

-- 2. Verificar se existem clínicas
SELECT 
    c.id,
    c.name,
    c.owner_id,
    c.master_user_id,
    c.created_at
FROM clinics c
ORDER BY c.created_at DESC;

-- 3. Verificar relacionamento entre solicitações e clínicas
SELECT 
    cr.id as request_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status,
    c.name as clinic_name,
    c.owner_id,
    c.master_user_id
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- 4. Verificar se há solicitações sem clinic_id
SELECT 
    COUNT(*) as total_requests,
    COUNT(clinic_id) as requests_with_clinic_id,
    COUNT(*) - COUNT(clinic_id) as requests_without_clinic_id
FROM credit_requests;

-- 5. Verificar usuários autenticados e suas clínicas
SELECT 
    p.id as profile_id,
    p.user_id,
    p.full_name,
    p.email,
    c.id as clinic_id,
    c.name as clinic_name
FROM profiles p
LEFT JOIN clinics c ON (c.owner_id = p.user_id OR c.master_user_id = p.user_id)
WHERE p.user_id IS NOT NULL
ORDER BY p.created_at DESC;