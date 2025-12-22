-- Testar associação entre usuário e clínica

-- 1. Verificar usuários autenticados
SELECT 
    'Usuários autenticados:' as info,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar clínicas e seus proprietários
SELECT 
    'Clínicas e proprietários:' as info,
    c.id as clinic_id,
    c.name as clinic_name,
    c.email as clinic_email,
    c.owner_id,
    c.master_user_id,
    u_owner.email as owner_email,
    u_master.email as master_email
FROM clinics c
LEFT JOIN auth.users u_owner ON c.owner_id = u_owner.id
LEFT JOIN auth.users u_master ON c.master_user_id = u_master.id
ORDER BY c.created_at DESC;

-- 3. Verificar solicitações de crédito e suas clínicas
SELECT 
    'Solicitações e clínicas:' as info,
    cr.id as request_id,
    cr.clinic_id,
    cr.patient_id,
    cr.requested_amount,
    cr.status,
    cr.created_at,
    c.name as clinic_name,
    c.email as clinic_email,
    u_patient.email as patient_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN auth.users u_patient ON cr.patient_id = u_patient.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- 4. Verificar se há solicitações órfãs (sem clínica válida)
SELECT 
    'Solicitações órfãs:' as info,
    COUNT(*) as total_orphan_requests
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE c.id IS NULL;

-- 5. Verificar se há clínicas sem proprietário válido
SELECT 
    'Clínicas órfãs:' as info,
    COUNT(*) as total_orphan_clinics
FROM clinics c
LEFT JOIN auth.users u_owner ON c.owner_id = u_owner.id
LEFT JOIN auth.users u_master ON c.master_user_id = u_master.id
WHERE u_owner.id IS NULL AND u_master.id IS NULL;