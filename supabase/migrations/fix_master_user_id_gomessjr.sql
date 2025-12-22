-- Verificar dados existentes para gomessjr@outlook.com

-- 1. Verificar se existe perfil para este email
SELECT 
  'PROFILES' as table_name,
  id,
  user_id,
  email,
  full_name,
  role,
  account_type,
  is_active
FROM profiles 
WHERE email = 'gomessjr@outlook.com';

-- 2. Verificar clínicas associadas a este email
SELECT 
  'CLINICS' as table_name,
  id,
  name,
  email,
  master_user_id,
  is_active,
  status
FROM clinics 
WHERE email = 'gomessjr@outlook.com';

-- 3. Verificar usuários auth que podem estar relacionados
SELECT 
  'AUTH_USERS' as table_name,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'gomessjr@outlook.com';

-- 4. Verificar se já existe entrada em clinic_professionals
SELECT 
  'CLINIC_PROFESSIONALS' as table_name,
  cp.id,
  cp.clinic_id,
  cp.user_id,
  cp.role,
  cp.is_active,
  p.email,
  p.full_name,
  c.name as clinic_name
FROM clinic_professionals cp
LEFT JOIN profiles p ON p.id = cp.user_id
LEFT JOIN clinics c ON c.id = cp.clinic_id
WHERE p.email = 'gomessjr@outlook.com' OR c.email = 'gomessjr@outlook.com';

-- 5. Verificar relacionamento entre auth.users e profiles
SELECT 
  'USER_PROFILE_RELATION' as table_name,
  au.id as auth_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.user_id as profile_user_id,
  p.email as profile_email,
  CASE 
    WHEN au.id = p.user_id THEN 'MATCH'
    ELSE 'NO_MATCH'
  END as relation_status
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE au.email = 'gomessjr@outlook.com';

-- 6. Atualizar apenas master_user_id se possível
DO $$
DECLARE
    auth_user_id uuid;
    clinic_id_var uuid;
    profile_exists boolean := false;
BEGIN
    -- Buscar o id do usuário auth
    SELECT id INTO auth_user_id
    FROM auth.users 
    WHERE email = 'gomessjr@outlook.com';
    
    -- Verificar se existe perfil para este usuário
    SELECT EXISTS(
        SELECT 1 FROM profiles WHERE user_id = auth_user_id
    ) INTO profile_exists;
    
    -- Buscar o id da clínica
    SELECT id INTO clinic_id_var
    FROM clinics 
    WHERE email = 'gomessjr@outlook.com';
    
    -- Se usuário auth e clínica existirem, atualizar master_user_id
    IF auth_user_id IS NOT NULL AND clinic_id_var IS NOT NULL THEN
        UPDATE clinics 
        SET master_user_id = auth_user_id
        WHERE id = clinic_id_var;
        
        RAISE NOTICE 'Master user ID atualizado para clínica % com auth_user_id %', clinic_id_var, auth_user_id;
        RAISE NOTICE 'Profile exists for this user: %', profile_exists;
    ELSE
        RAISE NOTICE 'Usuário auth ou clínica não encontrados para gomessjr@outlook.com';
        RAISE NOTICE 'Auth user ID: %, Clinic ID: %', auth_user_id, clinic_id_var;
    END IF;
END $$;

-- 7. Verificar resultado final
SELECT 
  'FINAL_RESULT' as table_name,
  c.id as clinic_id,
  c.name as clinic_name,
  c.email as clinic_email,
  c.master_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.full_name
FROM clinics c
LEFT JOIN auth.users au ON au.id = c.master_user_id
LEFT JOIN profiles p ON p.user_id = c.master_user_id
WHERE c.email = 'gomessjr@outlook.com';