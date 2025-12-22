-- Associar clínica a um usuário para teste

-- 1. Verificar usuários existentes (limitado aos primeiros 5)
SELECT 
    'EXISTING USERS' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar clínicas disponíveis
SELECT 
    'AVAILABLE CLINICS' as info,
    id,
    name,
    master_user_id,
    owner_id
FROM clinics 
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. Para associar uma clínica ao primeiro usuário encontrado, execute:
-- (Descomente e execute quando souber o user_id)
/*
UPDATE clinics 
SET master_user_id = (
    SELECT id 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE name = 'Clínica Odontológica Trindade'
AND master_user_id IS NULL;
*/

-- 4. Verificar se a associação funcionou
SELECT 
    'CLINIC USER ASSOCIATION' as info,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    u.email as user_email
FROM clinics c
LEFT JOIN auth.users u ON c.master_user_id = u.id OR c.owner_id = u.id
WHERE c.is_active = true;