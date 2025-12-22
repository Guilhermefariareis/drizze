-- Verificar role do usuário e associação com clínica
SELECT 'Verificando usuário mauricio_dias06@hotmail.com' as info;

-- 1. Verificar se o usuário existe e seu role
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles 
WHERE email = 'mauricio_dias06@hotmail.com';

-- 2. Verificar se existe clínica associada
SELECT 
  id,
  name,
  email,
  owner_id,
  master_user_id,
  created_at
FROM clinics 
WHERE email = 'edeventosproducoes@gmail.com';

-- 3. Verificar se o usuário é owner ou master da clínica
SELECT 
  c.id as clinic_id,
  c.name as clinic_name,
  c.email as clinic_email,
  p.id as user_id,
  p.email as user_email,
  p.role as user_role,
  CASE 
    WHEN c.owner_id = p.id THEN 'Owner'
    WHEN c.master_user_id = p.id THEN 'Master'
    ELSE 'Não associado'
  END as relationship
FROM profiles p
CROSS JOIN clinics c
WHERE p.email = 'mauricio_dias06@hotmail.com'
  AND c.email = 'edeventosproducoes@gmail.com';

-- 4. Se necessário, atualizar o role do usuário para 'clinic'
UPDATE profiles 
SET role = 'clinic'
WHERE email = 'mauricio_dias06@hotmail.com' 
  AND role != 'clinic';

-- 5. Se necessário, associar o usuário como owner da clínica
UPDATE clinics 
SET owner_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com')
WHERE email = 'edeventosproducoes@gmail.com' 
  AND owner_id IS NULL;

-- 6. Verificar resultado final
SELECT 
  'Resultado final:' as info,
  p.email as user_email,
  p.role as user_role,
  c.name as clinic_name,
  CASE 
    WHEN c.owner_id = p.id THEN 'Owner'
    WHEN c.master_user_id = p.id THEN 'Master'
    ELSE 'Não associado'
  END as relationship
FROM profiles p
CROSS JOIN clinics c
WHERE p.email = 'mauricio_dias06@hotmail.com'
  AND c.email = 'edeventosproducoes@gmail.com';