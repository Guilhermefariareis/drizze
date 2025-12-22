-- Criar clínica de teste para o usuário gomessjr@outlook.com

-- Primeiro, vamos buscar o ID do usuário gomessjr@outlook.com
DO $$
DECLARE
    gomes_user_id UUID;
    gomes_profile_id UUID;
    new_clinic_id UUID;
BEGIN
    -- Buscar o ID do usuário na tabela auth.users
    SELECT id INTO gomes_user_id 
    FROM auth.users 
    WHERE email = 'gomessjr@outlook.com';
    
    -- Verificar se o usuário existe
    IF gomes_user_id IS NULL THEN
        RAISE NOTICE 'Usuário gomessjr@outlook.com não encontrado na tabela auth.users';
        RETURN;
    END IF;
    
    -- Buscar o ID do profile
    SELECT id INTO gomes_profile_id 
    FROM profiles 
    WHERE email = 'gomessjr@outlook.com';
    
    -- Se não existe profile, criar um
    IF gomes_profile_id IS NULL THEN
        INSERT INTO profiles (
            id,
            user_id,
            email,
            full_name,
            role,
            account_type,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gomes_user_id,
            gomes_user_id,
            'gomessjr@outlook.com',
            'Dr. Gomes Jr',
            'clinic_owner',
            'clinic',
            true,
            NOW(),
            NOW()
        );
        gomes_profile_id := gomes_user_id;
        RAISE NOTICE 'Profile criado para gomessjr@outlook.com';
    END IF;
    
    -- Verificar se já existe uma clínica para este usuário
    SELECT id INTO new_clinic_id 
    FROM clinics 
    WHERE master_user_id = gomes_user_id OR owner_id = gomes_profile_id;
    
    -- Se não existe clínica, criar uma
    IF new_clinic_id IS NULL THEN
        INSERT INTO clinics (
            id,
            name,
            email,
            phone,
            address,
            city,
            state,
            zip_code,
            cnpj,
            master_user_id,
            owner_id,
            status,
            is_active,
            subscription_plan,
            subscription_status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Clínica Dr. Gomes Jr - Teste',
            'gomessjr@outlook.com',
            '(11) 99999-9999',
            'Rua Teste, 123',
            'São Paulo',
            'SP',
            '01234-567',
            '12.345.678/0001-90',
            gomes_user_id,
            gomes_profile_id,
            'active',
            true,
            'premium',
            'active',
            NOW(),
            NOW()
        ) RETURNING id INTO new_clinic_id;
        
        RAISE NOTICE 'Clínica criada com ID: %', new_clinic_id;
        
        -- Criar registro na tabela clinic_professionals
        INSERT INTO clinic_professionals (
            id,
            clinic_id,
            user_id,
            role,
            is_active,
            accepted_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            new_clinic_id,
            gomes_user_id,
            'owner',
            true,
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Registro clinic_professionals criado';
        
        -- Criar registro na tabela user_profiles se não existir
        INSERT INTO user_profiles (
            id,
            name,
            user_type,
            created_at,
            updated_at
        ) VALUES (
            gomes_user_id,
            'Dr. Gomes Jr',
            'clinic_owner',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Registro user_profiles criado/atualizado';
        
    ELSE
        RAISE NOTICE 'Clínica já existe para o usuário gomessjr@outlook.com com ID: %', new_clinic_id;
    END IF;
    
END $$;

-- Verificar o resultado
SELECT 
    'Verificação final' as status,
    c.id as clinic_id,
    c.name as clinic_name,
    c.master_user_id,
    c.owner_id,
    u.email as master_email,
    p.email as owner_email,
    c.status,
    c.is_active
FROM clinics c
LEFT JOIN auth.users u ON c.master_user_id = u.id
LEFT JOIN profiles p ON c.owner_id = p.id
WHERE u.email = 'gomessjr@outlook.com' OR p.email = 'gomessjr@outlook.com';