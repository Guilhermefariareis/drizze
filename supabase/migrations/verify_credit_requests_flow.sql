-- Verificar fluxo completo das solicitações de crédito
-- Este script verifica se as solicitações estão sendo criadas e se podem ser acessadas pela clínica

-- 1. Verificar todas as solicitações de crédito criadas recentemente
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_id,
  cr.requested_amount,
  cr.patient_name,
  cr.status,
  cr.created_at,
  c.name as clinic_name,
  c.email as clinic_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- 2. Verificar se existe alguma clínica específica para teste
SELECT 
  id,
  name,
  email,
  master_user_id,
  owner_id,
  created_at
FROM clinics 
WHERE email LIKE '%edeventosproducoes%'
ORDER BY created_at DESC;

-- 3. Simular a consulta que o painel da clínica faz
-- Assumindo que a clínica usa master_user_id ou owner_id para filtrar
WITH clinic_user AS (
  SELECT id as clinic_id, master_user_id, owner_id
  FROM clinics 
  WHERE email LIKE '%edeventosproducoes%'
  LIMIT 1
)
SELECT 
  cr.id,
  cr.requested_amount,
  cr.patient_name,
  cr.status,
  cr.created_at,
  cr.treatment_description
FROM credit_requests cr
INNER JOIN clinic_user cu ON cr.clinic_id = cu.clinic_id
ORDER BY cr.created_at DESC;

-- 4. Verificar se há solicitações órfãs (sem clínica válida)
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.created_at,
  CASE 
    WHEN c.id IS NULL THEN 'CLÍNICA NÃO ENCONTRADA'
    ELSE 'CLÍNICA OK'
  END as clinic_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY cr.created_at DESC;

-- 5. Verificar contagem de solicitações por clínica
SELECT 
  c.name as clinic_name,
  c.email as clinic_email,
  COUNT(cr.id) as total_requests,
  COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_requests,
  MAX(cr.created_at) as last_request_date
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(cr.id) > 0
ORDER BY total_requests DESC;
-- Este script verifica se as solicitações estão sendo criadas e se podem ser acessadas pela clínica

-- 1. Verificar todas as solicitações de crédito criadas recentemente
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_id,
  cr.requested_amount,
  cr.patient_name,
  cr.status,
  cr.created_at,
  c.name as clinic_name,
  c.email as clinic_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- 2. Verificar se existe alguma clínica específica para teste
SELECT 
  id,
  name,
  email,
  master_user_id,
  owner_id,
  created_at
FROM clinics 
WHERE email LIKE '%edeventosproducoes%'
ORDER BY created_at DESC;

-- 3. Simular a consulta que o painel da clínica faz
-- Assumindo que a clínica usa master_user_id ou owner_id para filtrar
WITH clinic_user AS (
  SELECT id as clinic_id, master_user_id, owner_id
  FROM clinics 
  WHERE email LIKE '%edeventosproducoes%'
  LIMIT 1
)
SELECT 
  cr.id,
  cr.requested_amount,
  cr.patient_name,
  cr.status,
  cr.created_at,
  cr.treatment_description
FROM credit_requests cr
INNER JOIN clinic_user cu ON cr.clinic_id = cu.clinic_id
ORDER BY cr.created_at DESC;

-- 4. Verificar se há solicitações órfãs (sem clínica válida)
SELECT 
  cr.id,
  cr.clinic_id,
  cr.patient_name,
  cr.requested_amount,
  cr.created_at,
  CASE 
    WHEN c.id IS NULL THEN 'CLÍNICA NÃO ENCONTRADA'
    ELSE 'CLÍNICA OK'
  END as clinic_status
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY cr.created_at DESC;

-- 5. Verificar contagem de solicitações por clínica
SELECT 
  c.name as clinic_name,
  c.email as clinic_email,
  COUNT(cr.id) as total_requests,
  COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_requests,
  MAX(cr.created_at) as last_request_date
FROM clinics c
LEFT JOIN credit_requests cr ON c.id = cr.clinic_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(cr.id) > 0
ORDER BY total_requests DESC;