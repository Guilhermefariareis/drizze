-- Verificar se o usuário logado é uma clínica
SELECT 
  id,
  name,
  email,
  created_at
FROM clinics
WHERE id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- Verificar o tipo de usuário no auth.users
SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  raw_user_meta_data
FROM auth.users
WHERE id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- Verificar todas as solicitações de crédito
SELECT 
  id,
  patient_id,
  clinic_id,
  requested_amount,
  status,
  treatment_description,
  created_at
FROM credit_requests
ORDER BY created_at DESC;

-- Verificar se há solicitações para esta clínica específica
SELECT 
  id,
  patient_id,
  clinic_id,
  requested_amount,
  status,
  treatment_description,
  created_at
FROM credit_requests
WHERE clinic_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
ORDER BY created_at DESC;