-- Verificar se o usuário gomessjr@outlook.com agora tem uma clínica associada
SELECT 
    u.id as user_id,
    u.email,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    c.status,
    c.is_active
FROM auth.users u
LEFT JOIN clinics c ON (c.master_user_id = u.id OR c.owner_id = u.id)
WHERE u.email = 'gomessjr@outlook.com';

-- Verificar também na tabela clinic_professionals
SELECT 
    cp.id,
    cp.clinic_id,
    cp.role,
    cp.is_active,
    c.name as clinic_name,
    u.email
FROM clinic_professionals cp
JOIN clinics c ON c.id = cp.clinic_id
JOIN auth.users u ON u.id = cp.user_id
WHERE u.email = 'gomessjr@outlook.com';