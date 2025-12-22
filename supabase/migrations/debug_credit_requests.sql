-- Verificar todas as solicitações de crédito
SELECT 
  'Total credit requests:' as info,
  COUNT(*) as count
FROM credit_requests;

-- Verificar solicitações por clínica
SELECT 
  c.name as clinic_name,
  c.email as clinic_email,
  COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name, c.email
ORDER BY total_requests DESC;

-- Verificar dados específicos da clínica edeventosproducoes@gmail.com
SELECT 
  'Clinic data:' as info,
  c.id,
  c.name,
  c.email
FROM clinics c 
WHERE c.email = 'edeventosproducoes@gmail.com';

-- Verificar dados do paciente mauricio_dias06@hotmail.com
SELECT 
  'Patient data:' as info,
  p.id,
  p.email,
  p.role
FROM profiles p 
WHERE p.email = 'mauricio_dias06@hotmail.com';

-- Verificar solicitações específicas para esta clínica
SELECT 
  cr.id,
  cr.patient_id,
  cr.clinic_id,
  cr.requested_amount,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  p.email as patient_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;

-- Verificar permissões na tabela credit_requests
SELECT 
  grantee, 
  table_name, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'credit_requests'
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;