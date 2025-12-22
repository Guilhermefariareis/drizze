-- Criar o perfil correto primeiro
-- 1. Verificar o usuário em auth.users
SELECT 
    'USUÁRIO EM AUTH.USERS:' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 2. Verificar perfil atual
SELECT 
    'PERFIL ATUAL:' as status,
    id,
    user_id,
    email
FROM profiles 
WHERE user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 3. Criar o perfil com id correto (se não existir)
INSERT INTO profiles (
    id,
    user_id,
    email,
    full_name,
    role,
    account_type,
    created_at,
    updated_at
)
SELECT 
    'e72d40b2-a695-489b-968b-e2479b5889f2',
    'e72d40b2-a695-489b-968b-e2479b5889f2',
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    'patient',
    'paciente',
    u.created_at,
    NOW()
FROM auth.users u
WHERE u.id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
  );

-- 4. Verificar se o perfil foi criado corretamente
SELECT 
    'PERFIL CRIADO:' as status,
    id,
    user_id,
    email,
    role,
    account_type
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- 5. Verificar se agora podemos referenciar este perfil
SELECT 
    'VERIFICAÇÃO FINAL:' as status,
    'Perfil pronto para ser usado em credit_requests' as message,
    id as profile_id
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';