-- INVESTIGAÇÃO URGENTE - SOLICITAÇÕES DE CRÉDITO
-- Verificar por que nenhuma solicitação está aparecendo no painel da clínica

-- 1. Verificar todas as solicitações de crédito
SELECT 
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.installments,
    cr.treatment_description,
    cr.status,
    cr.created_at,
    cr.updated_at
FROM credit_requests cr
ORDER BY cr.created_at DESC
LIMIT 20;

-- 2. Verificar solicitações com dados de paciente e clínica
SELECT 
    cr.id as request_id,
    cr.requested_amount,
    cr.installments,
    cr.status,
    cr.created_at,
    p.email as patient_email,
    p.full_name as patient_name,
    c.name as clinic_name,
    c.email as clinic_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 3. Verificar se existem pacientes
SELECT 
    id,
    email,
    full_name,
    created_at
FROM profiles
WHERE email LIKE '%mauricio%' OR email LIKE '%@hotmail.com'
ORDER BY created_at DESC;

-- 4. Verificar se existem clínicas
SELECT 
    id,
    name,
    email,
    created_at
FROM clinics
WHERE email LIKE '%edeventos%' OR name LIKE '%Crédito%'
ORDER BY created_at DESC;

-- 5. Contar total de registros em cada tabela
SELECT 'credit_requests' as tabela, COUNT(*) as total FROM credit_requests
UNION ALL
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'clinics' as tabela, COUNT(*) as total FROM clinics;

-- 6. Verificar últimas solicitações por status
SELECT 
    status,
    COUNT(*) as quantidade,
    MAX(created_at) as ultima_solicitacao
FROM credit_requests
GROUP BY status;