-- Garantir que mauricio_dias06@hotmail tenha role 'patient' correto
-- Corrigir problema de redirecionamento para área de clínica

-- Atualizar role para 'patient' se existir
UPDATE profiles 
SET 
  role = 'patient',
  account_type = 'paciente',
  updated_at = now()
WHERE email = 'mauricio_dias06@hotmail'
  AND role != 'patient';

-- Inserir perfil se não existir (caso o usuário tenha se registrado mas não tenha perfil)
INSERT INTO profiles (id, user_id, email, role, account_type, created_at, updated_at)
SELECT 
  auth.users.id,
  auth.users.id,
  auth.users.email,
  'patient',
  'paciente',
  now(),
  now()
FROM auth.users 
WHERE auth.users.email = 'mauricio_dias06@hotmail'
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.email = 'mauricio_dias06@hotmail'
  );

-- Verificar resultado
SELECT 
  email,
  role,
  account_type,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'mauricio_dias06@hotmail';