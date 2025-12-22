-- Criar uma clínica de teste para o usuário mauricio_dias06@hotmail.com

-- Verificar se já existe uma clínica para o usuário
SELECT 
  c.id,
  c.name,
  c.email,
  c.master_user_id
FROM clinics c
WHERE c.email = 'mauricio_dias06@hotmail.com' OR c.master_user_id = (
  SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'
);

-- Buscar o user_id do perfil
SELECT id, email FROM profiles WHERE email = 'mauricio_dias06@hotmail.com';

-- Inserir uma clínica de teste se não existir
INSERT INTO clinics (
  name,
  email,
  phone,
  address,
  description,
  city,
  master_user_id,
  is_active,
  is_verified,
  subscription_plan,
  status
) 
SELECT 
  'Clínica Odontológica Teste',
  'mauricio_dias06@hotmail.com',
  '(11) 99999-9999',
  '{"street": "Rua Teste, 123", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipcode": "01000-000"}'::jsonb,
  'Clínica de teste para solicitações de crédito',
  'São Paulo',
  p.id,
  true,
  true,
  'basic',
  'active'
FROM profiles p
WHERE p.email = 'mauricio_dias06@hotmail.com'
AND NOT EXISTS (
  SELECT 1 FROM clinics c 
  WHERE c.email = 'mauricio_dias06@hotmail.com' 
  OR c.master_user_id = p.id
);

-- Verificar se a clínica foi criada
SELECT 
  c.id,
  c.name,
  c.email,
  c.master_user_id,
  c.owner_id,
  p.email as profile_email
FROM clinics c
JOIN profiles p ON c.master_user_id = p.user_id
WHERE p.email = 'mauricio_dias06@hotmail.com';

-- Criar algumas solicitações de crédito de teste
INSERT INTO credit_requests (
  patient_id,
  clinic_id,
  requested_amount,
  approved_amount,
  installments,
  interest_rate,
  status,
  treatment_description,
  clinic_comments,
  created_at,
  updated_at
)
SELECT 
  p.user_id,  -- patient_id
  c.id,       -- clinic_id
  5000.00,    -- requested_amount
  NULL,       -- approved_amount
  12,         -- installments
  2.5,        -- interest_rate
  'pending',  -- status
  'Tratamento ortodôntico completo',
  NULL,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
FROM profiles p
CROSS JOIN clinics c
WHERE p.email = 'mauricio_dias06@hotmail.com'
AND c.email = 'mauricio_dias06@hotmail.com'
AND NOT EXISTS (
  SELECT 1 FROM credit_requests cr 
  WHERE cr.clinic_id = c.id AND cr.patient_id = p.user_id
)
UNION ALL
SELECT 
  p.user_id,  -- patient_id
  c.id,       -- clinic_id
  3500.00,    -- requested_amount
  3500.00,    -- approved_amount
  8,          -- installments
  2.5,        -- interest_rate
  'approved',  -- status
  'Implante dentário',
  'Aprovado pela clínica',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
FROM profiles p
CROSS JOIN clinics c
WHERE p.email = 'mauricio_dias06@hotmail.com'
AND c.email = 'mauricio_dias06@hotmail.com'
AND NOT EXISTS (
  SELECT 1 FROM credit_requests cr 
  WHERE cr.clinic_id = c.id AND cr.patient_id = p.user_id AND cr.requested_amount = 3500.00
);

-- Verificar as solicitações criadas
SELECT 
  cr.id,
  cr.status,
  cr.requested_amount,
  cr.approved_amount,
  cr.installments,
  cr.treatment_description,
  cr.created_at,
  p.email as patient_email,
  c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.user_id
JOIN clinics c ON cr.clinic_id = c.id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;