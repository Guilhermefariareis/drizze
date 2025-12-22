-- Investigação final do problema das solicitações de crédito

-- 1. Verificar todas as clínicas existentes
SELECT 'CLINICAS EXISTENTES:' as info;
SELECT id, name, master_user_id, owner_id, created_at 
FROM clinics 
ORDER BY created_at DESC;

-- 2. Verificar todas as solicitações de crédito
SELECT 'TODAS AS SOLICITACOES:' as info;
SELECT id, patient_id, clinic_id, requested_amount, status, created_at
FROM credit_requests 
ORDER BY created_at DESC;

-- 3. Verificar se existe o usuário específico nas clínicas
SELECT 'USUARIO ESPECIFICO:' as info;
SELECT id, name, master_user_id, owner_id
FROM clinics 
WHERE master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df' 
   OR owner_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 4. Verificar solicitações para clínicas específicas
SELECT 'SOLICITACOES POR CLINICA:' as info;
SELECT 
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status,
    cr.created_at,
    c.name as clinic_name
FROM credit_requests cr
JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 5. Verificar se há problema de tipo de dados
SELECT 'TIPOS DE DADOS:' as info;
SELECT 
    pg_typeof(clinic_id) as clinic_id_type,
    pg_typeof(patient_id) as patient_id_type
FROM credit_requests 
LIMIT 1;

-- 6. Contar registros por clínica
SELECT 'CONTAGEM POR CLINICA:' as info;
SELECT 
    clinic_id,
    COUNT(*) as total_requests
FROM credit_requests 
GROUP BY clinic_id
ORDER BY total_requests DESC;