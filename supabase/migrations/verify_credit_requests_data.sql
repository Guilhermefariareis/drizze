-- Verificar dados das solicitações de crédito criadas
SELECT 
  'credit_requests' as table_name,
  COUNT(*) as total_records
FROM credit_requests;

-- Verificar detalhes das solicitações de crédito
SELECT 
  cr.id,
  cr.patient_id,
  cr.clinic_id,
  cr.requested_amount,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  p.full_name as patient_name,
  p.email as patient_email,
  p.phone as patient_phone,
  p.cpf as patient_cpf,
  c.name as clinic_name
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.user_id
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- Verificar se há clínicas no sistema
SELECT 
  id,
  name,
  owner_id,
  created_at
FROM clinics
ORDER BY created_at DESC;

-- Verificar perfis de pacientes
SELECT 
  id,
  user_id,
  full_name,
  email,
  role,
  account_type,
  cpf,
  phone
FROM profiles
WHERE role = 'patient'
ORDER BY created_at DESC;