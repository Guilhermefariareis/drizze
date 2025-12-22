-- Debug específico para o usuário logado: mauricio_dias06@hotmail.com
-- ID do usuário: e72d40b2-a695-489b-968b-e2479b5889f2

-- 1. Verificar dados do usuário
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Verificar se o usuário tem clínica associada
SELECT 
  id,
  name,
  email,
  master_user_id,
  owner_id,
  created_at
FROM clinics 
WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
   OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
   OR email = 'mauricio_dias06@hotmail.com';

-- 3. Verificar solicitações de crédito para as clínicas deste usuário
WITH user_clinics AS (
  SELECT id as clinic_id
  FROM clinics 
  WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
     OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
     OR email = 'mauricio_dias06@hotmail.com'
)
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.status,
  cr.created_at,
  c.name as clinic_name
FROM credit_requests cr
INNER JOIN user_clinics uc ON cr.clinic_id = uc.clinic_id
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 4. Verificar todas as solicitações recentes (últimas 24h)
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.status,
  cr.created_at,
  c.name as clinic_name,
  c.email as clinic_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY cr.created_at DESC;

-- 5. Verificar se há problemas de permissão RLS
-- Simular consulta como se fosse o usuário logado
SET LOCAL "request.jwt.claims" = '{"sub": "e72d40b2-a695-489b-968b-e2479b5889f2", "email": "mauricio_dias06@hotmail.com"}';

SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.status,
  cr.created_at
FROM credit_requests cr
WHERE cr.clinic_id IN (
  SELECT id 
  FROM clinics 
  WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
     OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
)
ORDER BY cr.created_at DESC;

-- Debug específico para o usuário logado: mauricio_dias06@hotmail.com
-- ID do usuário: e72d40b2-a695-489b-968b-e2479b5889f2

-- 1. Verificar dados do usuário
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Verificar se o usuário tem clínica associada
SELECT 
  id,
  name,
  email,
  master_user_id,
  owner_id,
  created_at
FROM clinics 
WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
   OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
   OR email = 'mauricio_dias06@hotmail.com';

-- 3. Verificar solicitações de crédito para as clínicas deste usuário
WITH user_clinics AS (
  SELECT id as clinic_id
  FROM clinics 
  WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
     OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
     OR email = 'mauricio_dias06@hotmail.com'
)
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.status,
  cr.created_at,
  c.name as clinic_name
FROM credit_requests cr
INNER JOIN user_clinics uc ON cr.clinic_id = uc.clinic_id
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- 4. Verificar todas as solicitações recentes (últimas 24h)
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.status,
  cr.created_at,
  c.name as clinic_name,
  c.email as clinic_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY cr.created_at DESC;

-- 5. Verificar se há problemas de permissão RLS
-- Simular consulta como se fosse o usuário logado
SET LOCAL "request.jwt.claims" = '{"sub": "e72d40b2-a695-489b-968b-e2479b5889f2", "email": "mauricio_dias06@hotmail.com"}';

SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.status,
  cr.created_at
FROM credit_requests cr
WHERE cr.clinic_id IN (
  SELECT id 
  FROM clinics 
  WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
     OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
)
ORDER BY cr.created_at DESC;