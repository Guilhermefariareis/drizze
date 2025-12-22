-- Debug final das solicitações de crédito

-- 1. Verificar todas as solicitações criadas recentemente
SELECT 
    'SOLICITAÇÕES RECENTES (últimas 24h):' as info,
    cr.id,
    cr.clinic_id,
    cr.patient_id,
    cr.requested_amount,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    c.name as clinic_name,
    c.email as clinic_email,
    u.email as patient_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN auth.users u ON cr.patient_id = u.id
WHERE cr.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY cr.created_at DESC;

-- 2. Verificar se a clínica específica tem solicitações
SELECT 
    'SOLICITAÇÕES PARA CLÍNICA edeventosproducoes@gmail.com:' as info,
    cr.id,
    cr.clinic_id,
    cr.patient_id,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;

-- 3. Verificar se o usuário da clínica está correto
SELECT 
    'USUÁRIO DA CLÍNICA:' as info,
    c.id as clinic_id,
    c.name,
    c.email,
    c.owner_id,
    c.master_user_id,
    u_owner.email as owner_email,
    u_master.email as master_email
FROM clinics c
LEFT JOIN auth.users u_owner ON c.owner_id = u_owner.id
LEFT JOIN auth.users u_master ON c.master_user_id = u_master.id
WHERE c.email = 'edeventosproducoes@gmail.com';

-- 4. Simular a consulta que o painel da clínica faz
SELECT 
    'SIMULAÇÃO CONSULTA PAINEL CLÍNICA:' as info,
    cr.id,
    cr.clinic_id,
    cr.patient_id,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
WHERE cr.clinic_id IN (
    SELECT c.id 
    FROM clinics c 
    WHERE c.email = 'edeventosproducoes@gmail.com'
)
ORDER BY cr.created_at DESC;

-- 5. Verificar total de solicitações por clínica
SELECT 
    'TOTAL POR CLÍNICA:' as info,
    c.name as clinic_name,
    c.email as clinic_email,
    COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(cr.id) > 0
ORDER BY total_requests DESC;