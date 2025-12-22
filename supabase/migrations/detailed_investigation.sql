-- 1. Verificar se o usuário é uma clínica registrada
SELECT 'CLÍNICA ENCONTRADA:' as tipo, id, name, email, created_at
FROM clinics
WHERE id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'

UNION ALL

-- 2. Se não encontrou clínica, mostrar mensagem
SELECT 'CLÍNICA NÃO ENCONTRADA' as tipo, null::uuid as id, null as name, null as email, null::timestamptz as created_at
WHERE NOT EXISTS (
  SELECT 1 FROM clinics WHERE id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df'
);

-- 3. Verificar o tipo de usuário no auth
SELECT 
  'TIPO DE USUÁRIO:' as info,
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users
WHERE id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';

-- 4. Contar total de solicitações na tabela
SELECT 
  'TOTAL DE SOLICITAÇÕES:' as info,
  COUNT(*) as total
FROM credit_requests;

-- 5. Mostrar todas as solicitações com detalhes
SELECT 
  'SOLICITAÇÃO:' as tipo,
  id,
  patient_id,
  clinic_id,
  requested_amount,
  status,
  created_at
FROM credit_requests
ORDER BY created_at DESC;

-- 6. Verificar se há solicitações para esta clínica específica
SELECT 
  'SOLICITAÇÕES PARA ESTA CLÍNICA:' as info,
  COUNT(*) as total
FROM credit_requests
WHERE clinic_id = 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';