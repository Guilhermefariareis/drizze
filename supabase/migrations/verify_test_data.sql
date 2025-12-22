-- Verificar se a clínica foi criada
SELECT 
  id,
  name,
  email,
  master_user_id,
  is_active,
  subscription_plan,
  status
FROM clinics 
WHERE email = 'mauricio_dias06@hotmail.com';

-- Verificar as solicitações de crédito criadas
SELECT 
  cr.id,
  cr.requested_amount,
  cr.approved_amount,
  cr.installments,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  p.email as patient_email,
  c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;

-- Contar solicitações por status
SELECT 
  cr.status,
  COUNT(*) as total,
  SUM(CASE WHEN cr.approved_amount IS NOT NULL THEN cr.approved_amount ELSE 0 END) as total_approved_amount
FROM credit_requests cr
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'mauricio_dias06@hotmail.com'
GROUP BY cr.status;