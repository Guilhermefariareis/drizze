-- Debug do usuário e autenticação

-- Verificar usuário na tabela auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'edeventosproducoes@gmail.com';

-- Verificar perfil do usuário
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles 
WHERE email = 'edeventosproducoes@gmail.com';

-- Verificar clínicas do usuário
SELECT 
  c.id,
  c.name,
  c.email,
  c.owner_id,
  c.master_user_id,
  c.created_at,
  u.email as owner_email
FROM clinics c
JOIN auth.users u ON c.owner_id = u.id
WHERE u.email = 'edeventosproducoes@gmail.com';

-- Verificar todas as solicitações de crédito
SELECT 
  cr.id,
  cr.requested_amount,
  cr.status,
  cr.created_at,
  p.email as patient_email,
  c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- Verificar solicitações para a clínica específica
SELECT 
  cr.id,
  cr.requested_amount,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  p.email as patient_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.name = 'Crédito Odontológico'
ORDER BY cr.created_at DESC;