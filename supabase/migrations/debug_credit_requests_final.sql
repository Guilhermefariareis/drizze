-- Script final para debugar solicitações de crédito
-- Verificar se existem dados e se as queries estão funcionando

-- 1. Verificar se existem solicitações de crédito
SELECT 
  'TOTAL_SOLICITACOES' as info,
  COUNT(*) as quantidade
FROM credit_requests;

-- 2. Verificar solicitações por status
SELECT 
  'SOLICITACOES_POR_STATUS' as info,
  status,
  COUNT(*) as quantidade
FROM credit_requests
GROUP BY status;

-- 3. Verificar clínica específica
SELECT 
  'CLINICA_CREDITO_ODONTOLOGICO' as info,
  c.id,
  c.name,
  c.email,
  p.email as owner_email
FROM clinics c
JOIN profiles p ON c.owner_id = p.id
WHERE c.name ILIKE '%crédito%odontológico%' OR c.email = 'edeventosproducoes@gmail.com';

-- 4. Verificar solicitações para a clínica específica
SELECT 
  'SOLICITACOES_PARA_CLINICA' as info,
  cr.id,
  cr.requested_amount,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  p.email as patient_email,
  c.name as clinic_name
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;

-- 5. Verificar se o usuário tem acesso à clínica
SELECT 
  'ACESSO_USUARIO_CLINICA' as info,
  u.email as user_email,
  c.name as clinic_name,
  c.email as clinic_email,
  p.role as user_role
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN clinics c ON c.owner_id = p.id
WHERE u.email = 'mauricio_dias06@hotmail.com';

-- 6. Simular a query que o frontend faz
SELECT 
  'SIMULACAO_QUERY_FRONTEND' as info,
  cr.*,
  p.email as patient_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
WHERE cr.clinic_id = (
  SELECT c.id 
  FROM clinics c 
  JOIN profiles prof ON c.owner_id = prof.id 
  WHERE prof.email = 'mauricio_dias06@hotmail.com'
)
ORDER BY cr.created_at DESC;

-- 7. Verificar RLS policies
SELECT 
  'RLS_STATUS' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('credit_requests', 'clinics', 'profiles');