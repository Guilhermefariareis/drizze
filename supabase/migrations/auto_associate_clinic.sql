-- Associar automaticamente a primeira clínica ao primeiro usuário

-- Associar a Clínica Odontológica Trindade ao primeiro usuário disponível
UPDATE clinics 
SET master_user_id = (
    SELECT id 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE name = 'Clínica Odontológica Trindade'
AND master_user_id IS NULL;

-- Verificar se a associação foi feita
SELECT 
    'ASSOCIATION RESULT' as status,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    u.email as user_email
FROM clinics c
LEFT JOIN auth.users u ON c.master_user_id = u.id
WHERE c.name = 'Clínica Odontológica Trindade';