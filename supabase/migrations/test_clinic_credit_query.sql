-- Teste manual da consulta que o CreditManager está fazendo
-- Usuário logado: edeventosproducoes@gmail.com (ID: e0f4a11c-4b2e-4476-bd6f-51098a83f1df)

-- 1. ENCONTRAR A CLÍNICA DO USUÁRIO LOGADO
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'É MASTER'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'É OWNER'
        ELSE 'SEM ACESSO'
    END as user_role
FROM clinics c
WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
   OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 2. SIMULAR A CONSULTA EXATA DO CREDITMANAGER
-- Primeiro vamos pegar o clinic_id da clínica do usuário
WITH user_clinic AS (
    SELECT c.id as clinic_id
    FROM clinics c
    WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
       OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
    LIMIT 1
)
SELECT 
    cr.*,
    uc.clinic_id as user_clinic_id
FROM credit_requests cr
CROSS JOIN user_clinic uc
WHERE cr.clinic_id = uc.clinic_id
ORDER BY cr.created_at DESC;

-- 3. VERIFICAR TODAS AS SOLICITAÇÕES E SUAS CLÍNICAS
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    cr.status,
    cr.created_at,
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

-- 4. VERIFICAR SE O PROBLEMA É COM O CLINIC_ID
-- Listar todas as clínicas e suas solicitações
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_requests,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É MASTER'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É OWNER'
        ELSE 'USUÁRIO NÃO TEM ACESSO'
    END as user_access
FROM clinics c
LEFT JOIN credit_requests cr ON cr.clinic_id = c.id
GROUP BY c.id, c.name, c.master_user_id, c.owner_id
ORDER BY total_requests DESC;
-- Usuário logado: edeventosproducoes@gmail.com (ID: e0f4a11c-4b2e-4476-bd6f-51098a83f1df)

-- 1. ENCONTRAR A CLÍNICA DO USUÁRIO LOGADO
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'É MASTER'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'É OWNER'
        ELSE 'SEM ACESSO'
    END as user_role
FROM clinics c
WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
   OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 2. SIMULAR A CONSULTA EXATA DO CREDITMANAGER
-- Primeiro vamos pegar o clinic_id da clínica do usuário
WITH user_clinic AS (
    SELECT c.id as clinic_id
    FROM clinics c
    WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
       OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
    LIMIT 1
)
SELECT 
    cr.*,
    uc.clinic_id as user_clinic_id
FROM credit_requests cr
CROSS JOIN user_clinic uc
WHERE cr.clinic_id = uc.clinic_id
ORDER BY cr.created_at DESC;

-- 3. VERIFICAR TODAS AS SOLICITAÇÕES E SUAS CLÍNICAS
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    cr.status,
    cr.created_at,
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

-- 4. VERIFICAR SE O PROBLEMA É COM O CLINIC_ID
-- Listar todas as clínicas e suas solicitações
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_requests,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É MASTER'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É OWNER'
        ELSE 'USUÁRIO NÃO TEM ACESSO'
    END as user_access
FROM clinics c
LEFT JOIN credit_requests cr ON cr.clinic_id = c.id
GROUP BY c.id, c.name, c.master_user_id, c.owner_id
ORDER BY total_requests DESC;