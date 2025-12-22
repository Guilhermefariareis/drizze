-- Consulta para verificar dados dos usuários e suas clínicas associadas

-- 1. Verificar se ambos os usuários existem na tabela auth.users
SELECT 
    'auth.users' as tabela,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY email;

-- 2. Verificar se existem profiles para estes usuários
SELECT 
    'profiles' as tabela,
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.role,
    p.account_type,
    p.is_active,
    p.created_at
FROM profiles p
WHERE p.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY p.email;

-- 3. Verificar clínicas associadas através do campo master_user_id
SELECT 
    'clinics (master_user_id)' as tabela,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    u.email as master_email,
    c.status,
    c.is_active,
    c.created_at
FROM clinics c
JOIN auth.users u ON c.master_user_id = u.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;

-- 4. Verificar clínicas associadas através do campo owner_id
SELECT 
    'clinics (owner_id)' as tabela,
    c.id as clinic_id,
    c.name as clinic_name,
    c.owner_id,
    p.email as owner_email,
    c.status,
    c.is_active,
    c.created_at
FROM clinics c
JOIN profiles p ON c.owner_id = p.id
WHERE p.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY p.email;

-- 5. Verificar se há registros na tabela clinic_professionals
SELECT 
    'clinic_professionals' as tabela,
    cp.id,
    cp.clinic_id,
    cp.user_id,
    u.email,
    cp.role,
    cp.is_active,
    cp.accepted_at,
    cp.created_at
FROM clinic_professionals cp
JOIN auth.users u ON cp.user_id = u.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;

-- 6. Verificar todas as clínicas existentes (para debug)
SELECT 
    'todas_clinicas' as tabela,
    c.id,
    c.name,
    c.master_user_id,
    c.owner_id,
    c.status,
    c.is_active,
    c.created_at
FROM clinics c
ORDER BY c.created_at DESC
LIMIT 10;

-- 7. Verificar se há alguma relação através de outras tabelas
SELECT 
    'user_profiles' as tabela,
    up.id,
    up.name,
    up.user_type,
    u.email,
    up.created_at
FROM user_profiles up
JOIN auth.users u ON up.id = u.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;