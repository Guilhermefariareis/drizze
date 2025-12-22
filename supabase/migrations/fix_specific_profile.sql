-- Script para corrigir o perfil específico que está causando o erro
-- Verificar se o usuário existe em auth.users
SELECT 
    'Verificando usuário em auth.users:' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Verificar se o perfil existe
SELECT 
    'Verificando perfil existente:' as status,
    id,
    user_id,
    email,
    role
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2' OR user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Criar o perfil se não existir
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

-- Verificar se o perfil foi criado
SELECT 
    'Perfil após correção:' as status,
    id,
    user_id,
    email,
    role,
    account_type
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Verificar se agora podemos criar uma solicitação de crédito de teste
SELECT 
    'Verificação final - usuário pronto para solicitação:' as status,
    p.id as profile_id,
    p.email,
    p.role,
    'OK' as can_create_credit_request
FROM profiles p
WHERE p.id = 'e72d40b2-a695-489b-968b-e2479b5889f2';