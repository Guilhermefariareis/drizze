-- Verificação específica do usuário gomessjr@outlook.com

-- 1. Buscar o usuário em auth.users
SELECT 'USER INFO' as section, 
       id::text as id, 
       email, 
       created_at::text as created_at, 
       COALESCE(email_confirmed_at::text, 'NULL') as email_confirmed_at
FROM auth.users 
WHERE email = 'gomessjr@outlook.com'

UNION ALL

-- 2. Buscar o perfil em profiles
SELECT 'PROFILE INFO' as section, 
       p.id::text, 
       p.email, 
       p.created_at::text, 
       COALESCE(p.full_name, 'NULL') as full_name
FROM public.profiles p
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com')

UNION ALL

-- 3. Buscar clínicas onde é owner_id
SELECT 'CLINIC AS OWNER' as section,
       c.id::text,
       c.name,
       c.created_at::text,
       c.status
FROM public.clinics c
WHERE c.owner_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com')

UNION ALL

-- 4. Buscar clínicas onde é master_user_id
SELECT 'CLINIC AS MASTER' as section,
       c.id::text,
       c.name,
       c.created_at::text,
       c.status
FROM public.clinics c
WHERE c.master_user_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com')

UNION ALL

-- 5. Buscar em clinic_professionals
SELECT 'CLINIC PROFESSIONAL' as section,
       cp.id::text,
       c.name,
       cp.created_at::text,
       cp.role
FROM public.clinic_professionals cp
JOIN public.clinics c ON c.id = cp.clinic_id
WHERE cp.user_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com');

-- Verificar todas as clínicas existentes
SELECT 'ALL CLINICS' as section,
       id::text,
       name,
       created_at::text,
       COALESCE(owner_id::text, 'NULL') as owner_id
FROM public.clinics
ORDER BY created_at DESC;