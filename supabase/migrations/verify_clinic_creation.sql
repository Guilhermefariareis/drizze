-- Verificação final dos dados dos usuários e suas clínicas

-- 1. Comparar dados dos dois usuários
SELECT 
    'Comparação de usuários' as tipo,
    u.email,
    u.id as user_id,
    u.email_confirmed_at,
    p.id as profile_id,
    p.role,
    p.account_type,
    p.is_active as profile_active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;

-- 2. Comparar clínicas associadas
SELECT 
    'Clínicas por master_user_id' as tipo,
    u.email as user_email,
    c.id as clinic_id,
    c.name as clinic_name,
    c.status,
    c.is_active,

    c.created_at
FROM clinics c
JOIN auth.users u ON c.master_user_id = u.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;

-- 3. Verificar clinic_professionals
SELECT 
    'Clinic Professionals' as tipo,
    u.email as user_email,
    cp.clinic_id,
    c.name as clinic_name,
    cp.role,
    cp.is_active,
    cp.accepted_at
FROM clinic_professionals cp
JOIN auth.users u ON cp.user_id = u.id
JOIN clinics c ON cp.clinic_id = c.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;

-- 4. Verificar user_profiles
SELECT 
    'User Profiles' as tipo,
    u.email,
    up.name,
    up.user_type,
    up.created_at
FROM user_profiles up
JOIN auth.users u ON up.id = u.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;

-- 5. Resumo final
SELECT 
    'RESUMO FINAL' as status,
    u.email,
    CASE WHEN p.id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_profile,
    CASE WHEN c.id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_clinica,
    CASE WHEN cp.id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as eh_professional,
    CASE WHEN up.id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_user_profile
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN clinics c ON c.master_user_id = u.id
LEFT JOIN clinic_professionals cp ON cp.user_id = u.id
LEFT JOIN user_profiles up ON up.id = u.id
WHERE u.email IN ('gomessjr@outlook.com', 'creditoodontoweb@gmail.com')
ORDER BY u.email;