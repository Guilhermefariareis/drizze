-- Verificar se o perfil do usuário específico existe
SELECT 
    'Verificando perfil do usuário:' as info,
    'e72d40b2-a695-489b-968b-e2479b5889f2' as user_id;

-- Buscar o perfil na tabela profiles
SELECT 
    'Perfil encontrado:' as status,
    id,
    email,
    full_name,
    created_at
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Verificar se existe na tabela auth.users (apenas metadados públicos)
SELECT 
    'Usuário em auth.users:' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Contar total de perfis vs usuários para verificar sincronização
SELECT 
    'Total de usuários em auth.users:' as info,
    COUNT(*) as total
FROM auth.users;

SELECT 
    'Total de perfis em profiles:' as info,
    COUNT(*) as total
FROM profiles;

-- Encontrar usuários sem perfil
SELECT 
    'Usuários sem perfil:' as status,
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
LIMIT 10;