-- Debug específico para o usuário edeventosproducoes@gmail.com
-- ID: e0f4a11c-4b2e-4476-bd6f-51098a83f1df

-- 1. VERIFICAR CLÍNICA DO USUÁRIO LOGADO
SELECT 
    u.id as user_id,
    u.email,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    CASE 
        WHEN c.master_user_id = u.id THEN 'MASTER'
        WHEN c.owner_id = u.id THEN 'OWNER'
        ELSE 'NONE'
    END as user_role
FROM auth.users u
LEFT JOIN clinics c ON (c.master_user_id = u.id OR c.owner_id = u.id)
WHERE u.email = 'edeventosproducoes@gmail.com';

-- 2. VERIFICAR TODAS AS SOLICITAÇÕES E SUAS CLÍNICAS
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
    c.owner_id
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 3. VERIFICAR SE HÁ SOLICITAÇÕES PARA A CLÍNICA DO USUÁRIO LOGADO
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
WHERE cr.clinic_id IN (
    SELECT c.id 
    FROM clinics c 
    WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
       OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
);

-- 4. VERIFICAR TODAS AS CLÍNICAS E CONTAR SOLICITAÇÕES
SELECT 
    c.id,
    c.name,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON cr.clinic_id = c.id
GROUP BY c.id, c.name, c.master_user_id, c.owner_id
ORDER BY total_requests DESC;

-- 5. VERIFICAR SE AS SOLICITAÇÕES FORAM CRIADAS PARA OUTRA CLÍNICA
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    cr.status,
    cr.created_at,
    c.name as clinic_name,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É MASTER'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É OWNER'
        ELSE 'USUÁRIO NÃO TEM ACESSO'
    END as access_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;
-- ID: e0f4a11c-4b2e-4476-bd6f-51098a83f1df

-- 1. VERIFICAR CLÍNICA DO USUÁRIO LOGADO
SELECT 
    u.id as user_id,
    u.email,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    CASE 
        WHEN c.master_user_id = u.id THEN 'MASTER'
        WHEN c.owner_id = u.id THEN 'OWNER'
        ELSE 'NONE'
    END as user_role
FROM auth.users u
LEFT JOIN clinics c ON (c.master_user_id = u.id OR c.owner_id = u.id)
WHERE u.email = 'edeventosproducoes@gmail.com';

-- 2. VERIFICAR TODAS AS SOLICITAÇÕES E SUAS CLÍNICAS
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
    c.owner_id
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 3. VERIFICAR SE HÁ SOLICITAÇÕES PARA A CLÍNICA DO USUÁRIO LOGADO
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
WHERE cr.clinic_id IN (
    SELECT c.id 
    FROM clinics c 
    WHERE c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
       OR c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
);

-- 4. VERIFICAR TODAS AS CLÍNICAS E CONTAR SOLICITAÇÕES
SELECT 
    c.id,
    c.name,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON cr.clinic_id = c.id
GROUP BY c.id, c.name, c.master_user_id, c.owner_id
ORDER BY total_requests DESC;

-- 5. VERIFICAR SE AS SOLICITAÇÕES FORAM CRIADAS PARA OUTRA CLÍNICA
SELECT 
    cr.id,
    cr.clinic_id,
    cr.patient_name,
    cr.patient_email,
    cr.requested_amount,
    cr.status,
    cr.created_at,
    c.name as clinic_name,
    CASE 
        WHEN c.master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É MASTER'
        WHEN c.owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' THEN 'USUÁRIO É OWNER'
        ELSE 'USUÁRIO NÃO TEM ACESSO'
    END as access_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;