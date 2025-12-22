-- Teste da consulta do CreditManager para verificar se os dados estão sendo retornados corretamente

-- 1. Verificar todas as solicitações de crédito
SELECT 
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.approved_amount,
    cr.installments,
    cr.interest_rate,
    cr.status,
    cr.treatment_description,
    cr.clinic_comments,
    cr.admin_comments,
    cr.payment_conditions,
    cr.created_at,
    cr.updated_at
FROM credit_requests cr
ORDER BY cr.created_at DESC;

-- 2. Verificar dados dos pacientes (profiles)
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.phone,
    p.cpf,
    p.role,
    p.created_at
FROM profiles p
WHERE p.role = 'patient'
ORDER BY p.created_at DESC;

-- 3. Consulta completa como o CreditManager deveria fazer
SELECT 
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.approved_amount,
    cr.installments,
    cr.interest_rate,
    cr.status,
    cr.treatment_description,
    cr.clinic_comments,
    cr.admin_comments,
    cr.payment_conditions,
    cr.created_at,
    cr.updated_at,
    -- Dados do paciente
    p.full_name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone,
    p.cpf as patient_cpf,
    -- Dados da clínica
    c.name as clinic_name
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
LEFT JOIN clinics c ON c.id = cr.clinic_id
WHERE cr.clinic_id = '57a61d41-a8b6-4a47-be8a-b9f9ef574c17'
ORDER BY cr.created_at DESC;

-- 4. Verificar se há dados na tabela credit_requests
SELECT COUNT(*) as total_requests FROM credit_requests;

-- 5. Verificar se há dados na tabela profiles com role patient
SELECT COUNT(*) as total_patients FROM profiles WHERE role = 'patient';

-- 6. Verificar se há algum problema de permissão
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('credit_requests', 'profiles', 'clinics')
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;