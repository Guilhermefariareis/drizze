-- Verificar perfil existente para o usuário específico
SELECT 
    'Perfil existente por ID:' as status,
    id,
    user_id,
    email,
    full_name,
    role,
    account_type,
    created_at
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Verificar perfil existente por user_id
SELECT 
    'Perfil existente por USER_ID:' as status,
    id,
    user_id,
    email,
    full_name,
    role,
    account_type,
    created_at
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Verificar se existe em auth.users
SELECT 
    'Usuário em auth.users:' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Verificar inconsistências (perfis com user_id diferente do id)
SELECT 
    'Inconsistências encontradas:' as status,
    id,
    user_id,
    email,
    'ID != USER_ID' as problema
FROM profiles 
WHERE id != user_id
LIMIT 5;