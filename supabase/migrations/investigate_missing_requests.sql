-- Investigação específica das solicitações que não aparecem na clínica
-- Baseado nos valores reportados pelo usuário
-- ATUALIZADO: Análise detalhada das inconsistências entre painéis

-- 1. Buscar solicitações de R$ 10.500,00 e R$ 12.450,00 que aparecem no painel do paciente
SELECT 
    'Solicitações de R$ 10.500 e R$ 12.450 (painel paciente)' as investigacao,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    c.name as clinic_name,
    p.email as patient_email,
    p.full_name as patient_name
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE cr.requested_amount IN (10500.00, 12450.00)
ORDER BY cr.created_at DESC;

-- 2. Buscar solicitação de R$ 2.500,00 que aparece no painel da clínica mas não no paciente
SELECT 
    'Solicitação de R$ 2.500 (painel clínica)' as investigacao,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    c.name as clinic_name,
    p.email as patient_email,
    p.full_name as patient_name
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE cr.requested_amount = 2500.00
ORDER BY cr.created_at DESC;

-- 3. Verificar todas as solicitações do paciente mauricio_dias06@hotmail.com
SELECT 
    'Todas as solicitações do mauricio_dias06@hotmail.com' as investigacao,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    c.name as clinic_name,
    p.email as patient_email,
    p.full_name as patient_name
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;

-- 4. Verificar qual clínica o usuário edeventosproducoes@gmail.com tem acesso
SELECT 
    'Clínicas do usuário edeventosproducoes@gmail.com' as investigacao,
    c.id as clinic_id,
    c.name as clinic_name,
    c.owner_id,
    c.master_user_id,
    p.email as owner_email,
    'owner' as tipo_acesso
FROM clinics c
LEFT JOIN profiles p ON c.owner_id = p.user_id OR c.owner_id = p.id
WHERE p.email = 'edeventosproducoes@gmail.com'

UNION ALL

SELECT 
    'Clínicas do usuário edeventosproducoes@gmail.com' as investigacao,
    c.id as clinic_id,
    c.name as clinic_name,
    c.owner_id,
    c.master_user_id,
    p.email as master_email,
    'master' as tipo_acesso
FROM clinics c
LEFT JOIN profiles p ON c.master_user_id = p.user_id OR c.master_user_id = p.id
WHERE p.email = 'edeventosproducoes@gmail.com'

UNION ALL

SELECT 
    'Clínicas do usuário edeventosproducoes@gmail.com' as investigacao,
    c.id as clinic_id,
    c.name as clinic_name,
    c.owner_id,
    c.master_user_id,
    p.email as professional_email,
    'professional' as tipo_acesso
FROM clinic_professionals cp
JOIN clinics c ON cp.clinic_id = c.id
LEFT JOIN profiles p ON cp.user_id = p.user_id OR cp.user_id = p.id
WHERE p.email = 'edeventosproducoes@gmail.com';

-- 5. Verificar se há solicitações com clinic_id NULL ou inválido
SELECT 
    'Solicitações com clinic_id problemático' as investigacao,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    CASE 
        WHEN cr.clinic_id IS NULL THEN 'NULL'
        WHEN c.id IS NULL THEN 'CLINIC_NOT_FOUND'
        ELSE 'OK'
    END as clinic_status,
    c.name as clinic_name,
    p.email as patient_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE cr.clinic_id IS NULL OR c.id IS NULL
ORDER BY cr.created_at DESC;

-- 6. Comparar filtros: painel paciente vs painel clínica
-- Simular consulta do painel do paciente (filtra por patient_id)
SELECT 
    'Simulação painel PACIENTE - mauricio_dias06@hotmail.com' as tipo_consulta,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    c.name as clinic_name
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;

-- Simular consulta do painel da clínica (filtra por clinic_id)
-- Assumindo que a clínica do edeventosproducoes@gmail.com é a 57a61d41-a8b6-4a47-be8a-b9f9ef574c17
SELECT 
    'Simulação painel CLÍNICA - 57a61d41-a8b6-4a47-be8a-b9f9ef574c17' as tipo_consulta,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    p.email as patient_email,
    p.full_name as patient_name
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE cr.clinic_id = '57a61d41-a8b6-4a47-be8a-b9f9ef574c17'
ORDER BY cr.created_at DESC;