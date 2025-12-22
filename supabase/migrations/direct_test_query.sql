-- Script para testar acesso direto aos dados
-- Verificar se conseguimos acessar as tabelas básicas

-- 1. Verificar usuários
SELECT 'USUARIOS' as tabela, count(*) as total FROM auth.users;

-- 2. Verificar profiles
SELECT 'PROFILES' as tabela, count(*) as total FROM profiles;

-- 3. Verificar clínicas
SELECT 'CLINICAS' as tabela, count(*) as total FROM clinics;

-- 4. Verificar solicitações de crédito
SELECT 'CREDIT_REQUESTS' as tabela, count(*) as total FROM credit_requests;

-- 5. Verificar dados específicos da clínica
SELECT 
  'CLINICA_ESPECIFICA' as tipo,
  c.id,
  c.name,
  c.email,
  p.email as owner_email
FROM clinics c
JOIN profiles p ON c.owner_id = p.id
WHERE c.email = 'edeventosproducoes@gmail.com';

-- 6. Verificar solicitações para essa clínica
SELECT 
  'SOLICITACOES_CLINICA' as tipo,
  cr.id,
  cr.requested_amount,
  cr.status,
  cr.created_at,
  p.email as patient_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE c.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;

-- 7. Verificar permissões das tabelas
SELECT 
  'PERMISSOES' as tipo,
  grantee, 
  table_name, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name IN ('profiles', 'clinics', 'credit_requests')
ORDER BY table_name, grantee;