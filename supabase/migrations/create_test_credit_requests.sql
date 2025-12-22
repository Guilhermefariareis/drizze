-- Criar solicitações de crédito de teste
INSERT INTO credit_requests (
  patient_id,
  clinic_id, 
  requested_amount,
  installments,
  treatment_description,
  status,
  created_at
) VALUES 
(
  (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
  (SELECT id FROM clinics WHERE email = 'edeventosproducoes@gmail.com'),
  5000.00,
  12,
  'Tratamento ortodôntico completo',
  'pending',
  NOW()
),
(
  (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
  (SELECT id FROM clinics WHERE email = 'edeventosproducoes@gmail.com'),
  3000.00,
  6,
  'Implante dentário',
  'approved',
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
  (SELECT id FROM clinics WHERE email = 'edeventosproducoes@gmail.com'),
  2000.00,
  8,
  'Clareamento dental',
  'pending',
  NOW() - INTERVAL '2 hours'
);

-- Verificar se as solicitações foram criadas
SELECT 
  cr.*,
  p.email as patient_email,
  c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;