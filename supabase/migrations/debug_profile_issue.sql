-- Debug completo do problema do perfil
-- 1. Verificar usuário em auth.users
SELECT 
    'USUÁRIO EM AUTH.USERS:' as section,
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Verificar todos os perfis relacionados
SELECT 
    'PERFIS RELACIONADOS:' as section,
    id,
    user_id,
    email,
    role,
    account_type,
    created_at
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
   OR user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 3. Verificar se há inconsistência entre id e user_id
SELECT 
    'INCONSISTÊNCIAS:' as section,
    id,
    user_id,
    email,
    CASE 
        WHEN id = user_id THEN 'CONSISTENTE'
        ELSE 'INCONSISTENTE - ID != USER_ID'
    END as status
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 4. Verificar se existe perfil com id correto
SELECT 
    'PERFIL COM ID CORRETO:' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2') 
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as profile_with_correct_id;

-- 5. Mostrar o problema específico
SELECT 
    'DIAGNÓSTICO:' as section,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2')
             AND EXISTS (SELECT 1 FROM profiles WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2')
        THEN 'PROBLEMA: Perfil existe com user_id mas não com id correto'
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2')
        THEN 'PERFIL EXISTE CORRETAMENTE'
        ELSE 'PERFIL NÃO EXISTE'
    END as diagnosis;