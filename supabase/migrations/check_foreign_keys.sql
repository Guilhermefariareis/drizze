-- Verificar foreign keys e estrutura das tabelas

-- 1. Verificar constraints da tabela credit_requests
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='credit_requests';

-- 2. Verificar se patient_id deve referenciar profiles.id ou auth.users.id
SELECT 'Verificando referência patient_id:' as info;

-- 3. Verificar dados atuais
SELECT 'Dados em credit_requests:' as info;
SELECT 
  id,
  patient_id,
  clinic_id,
  requested_amount,
  treatment_description,
  status,
  created_at
FROM credit_requests
ORDER BY created_at DESC
LIMIT 5;

-- 4. Tentar fazer JOIN com profiles usando patient_id
SELECT 'JOIN com profiles usando patient_id:' as info;
SELECT 
  cr.id,
  cr.patient_id,
  p.id as profile_id,
  p.user_id,
  p.email,
  p.full_name
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.id
LIMIT 3;

-- 5. Tentar fazer JOIN com auth.users usando patient_id
SELECT 'JOIN com auth.users usando patient_id:' as info;
SELECT 
  cr.id,
  cr.patient_id,
  u.id as user_id,
  u.email
FROM credit_requests cr
LEFT JOIN auth.users u ON cr.patient_id = u.id
LIMIT 3;

-- 6. Verificar se patient_id deveria ser user_id
SELECT 'JOIN com profiles usando patient_id = user_id:' as info;
SELECT 
  cr.id,
  cr.patient_id,
  p.id as profile_id,
  p.user_id,
  p.email,
  p.full_name
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.user_id
LIMIT 3;