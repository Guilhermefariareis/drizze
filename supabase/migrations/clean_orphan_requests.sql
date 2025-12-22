-- Limpar solicitações órfãs e corrigir perfil

-- 1. Verificar solicitações órfãs
SELECT 
    'SOLICITAÇÕES ÓRFÃS:' as status,
    cr.id,
    cr.patient_id,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
WHERE cr.patient_id NOT IN (SELECT id FROM profiles);

-- 2. Verificar perfil atual
SELECT 
    'PERFIL ATUAL:' as status,
    id,
    user_id,
    email
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 3. Deletar solicitações órfãs relacionadas ao usuário
DELETE FROM credit_requests 
WHERE patient_id IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
      AND p.id != p.user_id
);

-- 4. Deletar o perfil inconsistente
DELETE FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
  AND id != user_id;

-- 5. Criar o perfil correto
INSERT INTO profiles (
    id,
    user_id,
    email,
    full_name,
    role,
    account_type,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    'patient',
    'paciente',
    u.created_at,
    NOW()
FROM auth.users u
WHERE u.id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = u.id
  );

-- 6. Verificação final
SELECT 
    'RESULTADO FINAL:' as status,
    id,
    user_id,
    email,
    role,
    CASE 
        WHEN id = user_id THEN 'CONSISTENTE'
        ELSE 'INCONSISTENTE'
    END as consistency
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 7. Verificar se não há mais solicitações órfãs
SELECT 
    'VERIFICAÇÃO ÓRFÃS:' as status,
    COUNT(*) as orphan_requests
FROM credit_requests cr
WHERE cr.patient_id NOT IN (SELECT id FROM profiles);