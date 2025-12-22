-- Verificação simples e direta do usuário gomessjr@outlook.com

-- Buscar o ID do usuário
SELECT 'Usuário encontrado:' as info, id, email FROM auth.users WHERE email = 'gomessjr@outlook.com';

-- Buscar perfil
SELECT 'Perfil encontrado:' as info, id, email, full_name, role, account_type 
FROM public.profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com');

-- Buscar clínicas como owner
SELECT 'Clínica como owner:' as info, id, name, status, owner_id, master_user_id
FROM public.clinics 
WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com');

-- Buscar clínicas como master
SELECT 'Clínica como master:' as info, id, name, status, owner_id, master_user_id
FROM public.clinics 
WHERE master_user_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com');

-- Buscar em clinic_professionals
SELECT 'Clinic Professional:' as info, cp.id, c.name as clinic_name, cp.role, cp.is_active
FROM public.clinic_professionals cp
JOIN public.clinics c ON c.id = cp.clinic_id
WHERE cp.user_id = (SELECT id FROM auth.users WHERE email = 'gomessjr@outlook.com');

-- Listar todas as clínicas para referência
SELECT 'Todas as clínicas:' as info, id, name, status, 
       CASE WHEN owner_id IS NOT NULL THEN 'tem owner' ELSE 'sem owner' END as has_owner,
       CASE WHEN master_user_id IS NOT NULL THEN 'tem master' ELSE 'sem master' END as has_master
FROM public.clinics 
ORDER BY created_at DESC;