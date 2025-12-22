-- Verificar permissões atuais
SELECT 'Current permissions:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'credit_requests' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões necessárias
GRANT SELECT ON credit_requests TO anon;
GRANT ALL PRIVILEGES ON credit_requests TO authenticated;

-- Verificar dados existentes
SELECT 'Existing credit requests:' as info;
SELECT id, patient_id, clinic_id, requested_amount, status, created_at
FROM credit_requests
ORDER BY created_at DESC;

-- Verificar permissões após correção
SELECT 'Updated permissions:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'credit_requests' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;