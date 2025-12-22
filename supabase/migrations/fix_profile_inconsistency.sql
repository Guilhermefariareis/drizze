-- Corrigir inconsistência do perfil
-- O problema é que existe um perfil com user_id correto mas id diferente

-- 1. Primeiro, vamos ver o estado atual
SELECT 
    'ANTES DA CORREÇÃO:' as status,
    id,
    user_id,
    email
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Atualizar o id do perfil para ser igual ao user_id
UPDATE profiles 
SET id = user_id,
    updated_at = NOW()
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
  AND id != user_id;

-- 3. Verificar se a correção funcionou
SELECT 
    'APÓS CORREÇÃO:' as status,
    id,
    user_id,
    email,
    CASE 
        WHEN id = user_id THEN 'CORRIGIDO'
        ELSE 'AINDA INCONSISTENTE'
    END as consistency_status
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 4. Verificar se agora o perfil pode ser usado para credit_requests
SELECT 
    'VERIFICAÇÃO FINAL:' as status,
    id as profile_id,
    email,
    'PRONTO PARA CREDIT_REQUEST' as ready_status
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 5. Mostrar quantos registros foram afetados
SELECT 
    'RESUMO:' as status,
    COUNT(*) as total_profiles_with_this_user_id
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';