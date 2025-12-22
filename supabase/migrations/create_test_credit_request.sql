-- Criar uma solicitação de crédito de teste válida
-- Primeiro, vamos verificar os dados existentes

-- 1. Verificar usuário atual e sua clínica
SELECT 
    'USUÁRIO ATUAL:' as info,
    p.id as profile_id,
    p.user_id,
    p.email,
    p.role,
    c.id as clinic_id,
    c.name as clinic_name
FROM profiles p
LEFT JOIN clinics c ON c.master_user_id = p.user_id
WHERE p.user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid;

-- 2. Verificar se existe alguma clínica para este usuário
SELECT 
    'CLÍNICAS DISPONÍVEIS:' as info,
    id,
    name,
    master_user_id
FROM clinics 
WHERE master_user_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid;

-- 3. Se não houver clínica, vamos pegar qualquer clínica existente para teste
SELECT 
    'TODAS AS CLÍNICAS:' as info,
    id,
    name,
    master_user_id
FROM clinics 
LIMIT 5;

-- 4. Inserir uma solicitação de crédito de teste
-- Usando o próprio usuário como paciente e a primeira clínica disponível
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
    'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid as patient_id,
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
WHERE EXISTS (SELECT 1 FROM clinics);

-- 5. Verificar se a solicitação foi criada
SELECT 
    'SOLICITAÇÃO CRIADA:' as info,
    id,
    patient_id,
    clinic_id,
    status,
    patient_name,
    requested_amount,
    created_at
FROM credit_requests 
WHERE patient_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'::uuid
ORDER BY created_at DESC
LIMIT 1;