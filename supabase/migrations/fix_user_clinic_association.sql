-- Verificar se o usuário tem uma clínica associada
SELECT 
  id,
  name,
  master_user_id,
  owner_id
FROM clinics 
WHERE master_user_id = '0d23449c-a163-4d8f-83e9-8302902923d8' 
   OR owner_id = '0d23449c-a163-4d8f-83e9-8302902923d8';

-- Se não existir, criar uma clínica para o usuário
INSERT INTO clinics (
  name,
  master_user_id,
  owner_id,
  is_active,
  status
) 
SELECT 
  'Clínica Principal',
  '0d23449c-a163-4d8f-83e9-8302902923d8',
  '0d23449c-a163-4d8f-83e9-8302902923d8',
  true,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM clinics 
  WHERE master_user_id = '0d23449c-a163-4d8f-83e9-8302902923d8' 
     OR owner_id = '0d23449c-a163-4d8f-83e9-8302902923d8'
);

-- Verificar o resultado
SELECT 
  id,
  name,
  master_user_id,
  owner_id,
  created_at
FROM clinics 
WHERE master_user_id = '0d23449c-a163-4d8f-83e9-8302902923d8' 
   OR owner_id = '0d23449c-a163-4d8f-83e9-8302902923d8';