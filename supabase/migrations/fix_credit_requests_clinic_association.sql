-- CORREÇÃO: Associar solicitações de crédito à clínica correta
-- Problema: As solicitações foram criadas para uma clínica diferente da que o usuário tem acesso

-- 1. VERIFICAR SITUAÇÃO ATUAL
SELECT 
    'SITUAÇÃO ATUAL' as status,
    cr.id,
    cr.clinic_id as current_clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    c.name as current_clinic_name,
    c.master_user_id,
    c.owner_id
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 2. ENCONTRAR A CLÍNICA CORRETA DO USUÁRIO edeventosproducoes@gmail.com
SELECT 
    'CLÍNICA DO USUÁRIO LOGADO' as status,
    c.id as correct_clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id
FROM clinics c
WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
   OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 3. ATUALIZAR AS SOLICITAÇÕES PARA A CLÍNICA CORRETA
-- Primeiro, vamos identificar qual é a clínica correta
WITH correct_clinic AS (
    SELECT c.id as clinic_id
    FROM clinics c
    WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
       OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
    LIMIT 1
)
UPDATE credit_requests 
SET clinic_id = (SELECT clinic_id FROM correct_clinic)
WHERE clinic_id != (SELECT clinic_id FROM correct_clinic)
  AND id IN (
    SELECT cr.id 
    FROM credit_requests cr
    WHERE cr.created_at >= '2025-01-01'  -- Apenas solicitações recentes
  );

-- 4. VERIFICAR RESULTADO DA CORREÇÃO
SELECT 
    'APÓS CORREÇÃO' as status,
    cr.id,
    cr.clinic_id as updated_clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO TEM ACESSO (MASTER)'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO TEM ACESSO (OWNER)'
        ELSE 'USUÁRIO NÃO TEM ACESSO'
    END as access_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;
-- Problema: As solicitações foram criadas para uma clínica diferente da que o usuário tem acesso

-- 1. VERIFICAR SITUAÇÃO ATUAL
SELECT 
    'SITUAÇÃO ATUAL' as status,
    cr.id,
    cr.clinic_id as current_clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    c.name as current_clinic_name,
    c.master_user_id,
    c.owner_id
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 2. ENCONTRAR A CLÍNICA CORRETA DO USUÁRIO edeventosproducoes@gmail.com
SELECT 
    'CLÍNICA DO USUÁRIO LOGADO' as status,
    c.id as correct_clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id
FROM clinics c
WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
   OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 3. ATUALIZAR AS SOLICITAÇÕES PARA A CLÍNICA CORRETA
-- Primeiro, vamos identificar qual é a clínica correta
WITH correct_clinic AS (
    SELECT c.id as clinic_id
    FROM clinics c
    WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
       OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
    LIMIT 1
)
UPDATE credit_requests 
SET clinic_id = (SELECT clinic_id FROM correct_clinic)
WHERE clinic_id != (SELECT clinic_id FROM correct_clinic)
  AND id IN (
    SELECT cr.id 
    FROM credit_requests cr
    WHERE cr.created_at >= '2025-01-01'  -- Apenas solicitações recentes
  );

-- 4. VERIFICAR RESULTADO DA CORREÇÃO
SELECT 
    'APÓS CORREÇÃO' as status,
    cr.id,
    cr.clinic_id as updated_clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO TEM ACESSO (MASTER)'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO TEM ACESSO (OWNER)'
        ELSE 'USUÁRIO NÃO TEM ACESSO'
    END as access_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;