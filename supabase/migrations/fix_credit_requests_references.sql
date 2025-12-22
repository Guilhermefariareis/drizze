-- Corrigir referências de credit_requests antes de atualizar o perfil

-- 1. Verificar o estado atual das referências
SELECT 
    'CREDIT_REQUESTS ATUAIS:' as status,
    cr.id as request_id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status,
    p.email as patient_email
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
WHERE p.user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Verificar o perfil atual
SELECT 
    'PERFIL ATUAL:' as status,
    id as current_id,
    user_id,
    email
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 3. Atualizar as referências em credit_requests para usar o user_id correto
UPDATE credit_requests 
SET patient_id = 'e72d40b2-a695-489b-968b-e2479b5889f2',
    updated_at = NOW()
WHERE patient_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
      AND id != user_id
);

-- 4. Verificar se as referências foram atualizadas
SELECT 
    'CREDIT_REQUESTS APÓS UPDATE:' as status,
    cr.id as request_id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status
FROM credit_requests cr
WHERE cr.patient_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 5. Agora atualizar o perfil para ter id = user_id
UPDATE profiles 
SET id = user_id,
    updated_at = NOW()
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
  AND id != user_id;

-- 6. Verificação final
SELECT 
    'VERIFICAÇÃO FINAL:' as status,
    p.id,
    p.user_id,
    p.email,
    COUNT(cr.id) as credit_requests_count
FROM profiles p
LEFT JOIN credit_requests cr ON cr.patient_id = p.id
WHERE p.id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
GROUP BY p.id, p.user_id, p.email;