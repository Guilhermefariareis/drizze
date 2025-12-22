-- Verificar dados existentes e criar solicitação de teste

-- 1. Verificar dados existentes
SELECT 'Usuários auth:' as info;
SELECT id, email FROM auth.users LIMIT 3;

SELECT 'Perfis:' as info;
SELECT id, user_id, email, full_name FROM profiles LIMIT 3;

SELECT 'Clínicas:' as info;
SELECT id, name, email FROM clinics LIMIT 3;

-- 2. Verificar se existe alguma solicitação
SELECT 'Solicitações existentes:' as info;
SELECT COUNT(*) as total FROM credit_requests;

-- 3. Criar uma solicitação usando IDs corretos
INSERT INTO credit_requests (
  patient_id,
  clinic_id,
  requested_amount,
  installments,
  treatment_description,
  status,
  created_at
)
SELECT 
  p.id as patient_id,
  c.id as clinic_id,
  7500.00 as requested_amount,
  18 as installments,
  'Implante dentário - teste' as treatment_description,
  'pending' as status,
  NOW() as created_at
FROM profiles p
CROSS JOIN clinics c
WHERE p.id IS NOT NULL 
  AND c.id IS NOT NULL
LIMIT 1;

-- 4. Verificar se foi criada
SELECT 'Nova solicitação criada:' as info;
SELECT 
  cr.id,
  cr.patient_id,
  cr.clinic_id,
  cr.requested_amount,
  cr.treatment_description,
  cr.status,
  p.email as patient_email,
  p.full_name as patient_name,
  c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC
LIMIT 1;

-- 5. Verificar total por clínica
SELECT 'Resumo por clínica:' as info;
SELECT 
  c.name as clinic_name,
  c.id as clinic_id,
  COUNT(cr.id) as total_requests
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name
ORDER BY total_requests DESC;