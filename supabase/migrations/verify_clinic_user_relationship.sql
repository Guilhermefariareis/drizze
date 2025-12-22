-- Verificar relacionamento entre usuários e clínicas

-- 1. Verificar se existem clínicas no sistema
SELECT 
    'TOTAL CLINICS' as info,
    COUNT(*) as count
FROM clinics;

-- 2. Verificar clínicas com master_user_id ou owner_id preenchidos
SELECT 
    'CLINICS WITH USERS' as info,
    COUNT(*) as count
FROM clinics 
WHERE master_user_id IS NOT NULL OR owner_id IS NOT NULL;

-- 3. Verificar todas as solicitações de crédito
SELECT 
    'TOTAL CREDIT REQUESTS' as info,
    COUNT(*) as count
FROM credit_requests;

-- 4. Verificar solicitações com clinic_id válido
SELECT 
    'REQUESTS WITH VALID CLINIC' as info,
    COUNT(*) as count
FROM credit_requests cr
JOIN clinics c ON cr.clinic_id = c.id;

-- 5. Verificar se há solicitações órfãs (clinic_id inválido)
SELECT 
    'ORPHAN REQUESTS' as info,
    COUNT(*) as count
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE c.id IS NULL;

-- 6. Mostrar detalhes das clínicas existentes
SELECT 
    id,
    name,
    master_user_id,
    owner_id,
    is_active,
    created_at
FROM clinics 
ORDER BY created_at DESC
LIMIT 5;

-- 7. Mostrar detalhes das solicitações recentes
SELECT 
    cr.id,
    cr.patient_name,
    cr.clinic_id,
    cr.status,
    cr.created_at,
    c.name as clinic_name
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC
LIMIT 5;