-- Verificar se existem solicitações com clinic_id mock

-- 1. Verificar solicitações com IDs que começam com 'mock-'
SELECT 
    'REQUESTS WITH MOCK CLINIC IDS' as analysis,
    COUNT(*) as count
FROM credit_requests 
WHERE clinic_id::text LIKE 'mock-%';

-- 2. Mostrar detalhes das solicitações com clinic_id mock
SELECT 
    id,
    patient_name,
    clinic_id,
    status,
    requested_amount,
    created_at
FROM credit_requests 
WHERE clinic_id::text LIKE 'mock-%'
ORDER BY created_at DESC;

-- 3. Verificar se existem clínicas reais no banco
SELECT 
    'REAL CLINICS IN DATABASE' as analysis,
    id,
    name,
    city,
    is_active
FROM clinics 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar todos os clinic_ids únicos nas solicitações
SELECT 
    'UNIQUE CLINIC IDS IN REQUESTS' as analysis,
    clinic_id,
    COUNT(*) as request_count,
    CASE 
        WHEN clinic_id::text LIKE 'mock-%' THEN 'MOCK ID'
        ELSE 'REAL ID'
    END as id_type
FROM credit_requests 
GROUP BY clinic_id
ORDER BY request_count DESC;