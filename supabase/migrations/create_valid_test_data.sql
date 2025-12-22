-- Criar dados de teste válidos para solicitação de crédito

-- 1. Verificar se já existe um perfil para o usuário atual
SELECT 
    'PERFIL EXISTENTE:' as info,
    id,
    user_id,
    email,
    role
FROM profiles 
WHERE user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid;

-- 2. Se não existir, criar um perfil para o usuário
INSERT INTO profiles (
    id,
    user_id,
    email,
    full_name,
    role,
    account_type
) 
SELECT 
    gen_random_uuid(),
    'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid,
    'edeventosproducoes@gmail.com',
    'Usuário Teste',
    'patient',
    'paciente'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid
);

-- 3. Verificar clínicas disponíveis
SELECT 
    'CLÍNICAS DISPONÍVEIS:' as info,
    id,
    name,
    master_user_id
FROM clinics 
LIMIT 3;

-- 4. Criar uma solicitação de crédito usando o profile_id correto
INSERT INTO credit_requests (
    patient_id,
    clinic_id,
    status,
    patient_name,
    patient_email,
    patient_phone,
    patient_cpf,
    treatment_type,
    urgency_level,
    requested_amount,
    treatment_description,
    installments
) 
SELECT 
    p.id as patient_id,
    (SELECT id FROM clinics LIMIT 1) as clinic_id,
    'pending' as status,
    'Paciente Teste' as patient_name,
    'edeventosproducoes@gmail.com' as patient_email,
    '(11) 99999-9999' as patient_phone,
    '123.456.789-00' as patient_cpf,
    'Implante Dentário' as treatment_type,
    'normal' as urgency_level,
    5000.00 as requested_amount,
    'Implante dentário na região posterior direita' as treatment_description,
    12 as installments
FROM profiles p
WHERE p.user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid
AND EXISTS (SELECT 1 FROM clinics)
AND NOT EXISTS (
    SELECT 1 FROM credit_requests cr 
    WHERE cr.patient_id = p.id 
    AND cr.status = 'pending'
);

-- 5. Verificar se a solicitação foi criada
SELECT 
    'SOLICITAÇÃO CRIADA:' as info,
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.patient_name,
    cr.requested_amount,
    cr.created_at,
    p.user_id as patient_user_id,
    c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON p.id = cr.patient_id
JOIN clinics c ON c.id = cr.clinic_id
WHERE p.user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid
ORDER BY cr.created_at DESC
LIMIT 1;