-- Criar perfil ausente para o usuário específico
-- Primeiro, verificar se o usuário existe em auth.users
DO $$
DECLARE
    user_email TEXT;
    user_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Buscar dados do usuário em auth.users
    SELECT email, created_at 
    INTO user_email, user_created_at
    FROM auth.users 
    WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';
    
    -- Se o usuário existe, criar o perfil
    IF user_email IS NOT NULL THEN
        -- Inserir perfil apenas se não existir
        INSERT INTO profiles (id, user_id, email, full_name, role, account_type, created_at, updated_at)
        SELECT 
            'e72d40b2-a695-489b-968b-e2479b5889f2',
            'e72d40b2-a695-489b-968b-e2479b5889f2',
            user_email,
            COALESCE(
                (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2'),
                'Usuário'
            ),
            'patient',
            'paciente',
            user_created_at,
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM profiles WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
        );
        
        RAISE NOTICE 'Perfil criado para usuário: %', user_email;
    ELSE
        RAISE NOTICE 'Usuário não encontrado em auth.users';
    END IF;
END $$;

-- Verificar se o perfil foi criado
SELECT 
    'Perfil após criação:' as status,
    id,
    user_id,
    email,
    full_name,
    role,
    account_type,
    created_at
FROM profiles 
WHERE id = 'e72d40b2-a695-489b-968b-e2479b5889f2';

-- Criar perfis para todos os usuários sem perfil (máximo 10)
INSERT INTO profiles (id, user_id, email, full_name, role, account_type, created_at, updated_at)
SELECT 
    u.id,
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    'patient',
    'paciente',
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
LIMIT 10
ON CONFLICT (id) DO NOTHING;

-- Mostrar resultado final
SELECT 
    'Sincronização completa:' as info,
    COUNT(*) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;