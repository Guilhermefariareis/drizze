-- Debug: Verificar dados na tabela subscriptions
-- Esta migração é apenas para debug e investigação

-- Verificar se há assinaturas na tabela
SELECT 
  'Total de assinaturas:' as info,
  COUNT(*) as count
FROM subscriptions;

-- Verificar assinaturas ativas
SELECT 
  'Assinaturas ativas:' as info,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'active';

-- Verificar todas as assinaturas com detalhes
SELECT 
  s.id,
  s.user_id,
  s.stripe_subscription_id,
  s.plan_id,
  s.status,
  s.created_at,
  p.name as plan_name,
  p.plan_type,
  p.price
FROM subscriptions s
LEFT JOIN pricing_plans p ON s.plan_id = p.id::text
ORDER BY s.created_at DESC;

-- Verificar se há triggers ou funções que criam assinaturas automaticamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'subscriptions'
   OR action_statement LIKE '%subscriptions%';

-- Verificar funções que mencionam subscriptions
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%subscriptions%'
  AND routine_type = 'FUNCTION';