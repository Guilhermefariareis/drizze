-- Script para verificar o status do usuário edeventosproducoes@gmail.com
-- Verificando dados na tabela auth.users

SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    banned_until,
    deleted_at,
    is_anonymous,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'edeventosproducoes@gmail.com';

-- Verificando se há problemas de confirmação de email
SELECT 
    email,
    email_confirmed_at IS NULL as email_not_confirmed,
    confirmed_at IS NULL as not_confirmed,
    banned_until IS NOT NULL as is_banned,
    deleted_at IS NOT NULL as is_deleted
FROM auth.users 
WHERE email = 'edeventosproducoes@gmail.com';

-- Verificando perfil na tabela profiles
SELECT 
    p.*,
    u.email,
    u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'edeventosproducoes@gmail.com';