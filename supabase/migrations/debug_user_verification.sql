-- Verificação completa do usuário gomessjr@outlook.com

-- 1. Verificar se o usuário existe em auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'gomessjr@outlook.com';

-- 2. Verificar clínicas onde ele é owner_id
SELECT 
    id,
    name,
    owner_id,
    master_user_id,
    created_at
FROM public.clinics 
WHERE owner_id = (
    SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com'
);

-- 3. Verificar clínicas onde ele é master_user_id
SELECT 
    id,
    name,
    owner_id,
    master_user_id,
    created_at
FROM public.clinics 
WHERE master_user_id = (
    SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com'
);

-- 4. Verificar se existe entrada em clinic_professionals
SELECT 
    cp.*,
    c.name as clinic_name
FROM public.clinic_professionals cp
JOIN public.clinics c ON c.id = cp.clinic_id
WHERE cp.user_id = (
    SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com'
);

-- 5. Verificar se existe entrada em profiles
SELECT 
    p.*
FROM public.profiles p
WHERE p.id = (
    SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com'
);

-- 6. Verificar todas as clínicas existentes (para debug)
SELECT 
    id,
    name,
    owner_id,
    master_user_id,
    created_at
FROM public.clinics
ORDER BY created_at DESC;