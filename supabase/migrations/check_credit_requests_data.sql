-- Verificar todas as solicitações de crédito existentes
SELECT 
  cr.id,
  cr.patient_id,
  cr.clinic_id,
  cr.requested_amount,
  cr.installments,
  cr.treatment_description,
  cr.status,
  cr.created_at,
  p.email as patient_email,
  c.name as clinic_name,
  c.email as clinic_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- Verificar especificamente para a clínica edeventosproducoes@gmail.com
SELECT 
  cr.*,
  p.email as patient_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;

-- Verificar se a clínica existe e seu ID
SELECT id, name, email FROM clinics WHERE email = 'edeventosproducoes@gmail.com';

-- Verificar se o paciente existe e seu ID
SELECT id, email FROM profiles WHERE email = 'mauricio_dias06@hotmail.com';