-- Verificar clínica e solicitações de crédito

-- 1. Verificar se a clínica existe e seu ID
SELECT 
  id,
  name,
  email,
  owner_id,
  master_user_id,
  created_at
FROM clinics 
WHERE email = 'edeventosproducoes@gmail.com' 
   OR name ILIKE '%Crédito Odontológico%';

-- 2. Verificar usuário
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'edeventosproducoes@gmail.com';

-- 3. Verificar todas as solicitações de crédito
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_id,
  cr.requested_amount,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  c.name as clinic_name,
  c.email as clinic_email,
  p.email as patient_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.id
ORDER BY cr.created_at DESC;

-- 4. Verificar se há solicitações para a clínica específica
SELECT 
  cr.*,
  c.name as clinic_name
FROM credit_requests cr
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;

-- 5. Contar solicitações por clínica
SELECT 
  c.name,
  c.email,
  COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name, c.email
ORDER BY total_requests DESC;