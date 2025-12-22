-- Verificar sessões ativas e usuários
SELECT 'Usuários na tabela auth.users:' as info;
SELECT id, email, created_at, last_sign_in_at FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 5;

SELECT 'Perfis de usuários:' as info;
SELECT p.id, p.email, p.role, p.user_id, u.email as auth_email 
FROM profiles p 
JOIN auth.users u ON p.user_id = u.id 
ORDER BY p.created_at DESC LIMIT 5;

SELECT 'Clínicas cadastradas:' as info;
SELECT id, name, email, owner_id, master_user_id, created_at 
FROM clinics 
ORDER BY created_at DESC LIMIT 5;

SELECT 'Verificar se há usuário logado como clínica:' as info;
SELECT p.email, p.role, c.name as clinic_name, c.id as clinic_id
FROM profiles p
JOIN clinics c ON (p.user_id = c.owner_id OR p.user_id = c.master_user_id)
WHERE p.role = 'clinic'
ORDER BY p.created_at DESC;