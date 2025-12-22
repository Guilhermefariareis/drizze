-- Criar clínica "Crédito Odontológico" para o usuário edeventosproducoes@gmail.com
DO $$
DECLARE
    v_user_id uuid;
    v_clinic_id uuid;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'edeventosproducoes@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuário edeventosproducoes@gmail.com não encontrado';
        RETURN;
    END IF;
    
    -- Verificar se já existe uma clínica para este usuário
    SELECT id INTO v_clinic_id
    FROM clinics 
    WHERE owner_id = v_user_id;
    
    IF v_clinic_id IS NOT NULL THEN
        RAISE NOTICE 'Usuário já possui clínica: %', v_clinic_id;
        
        -- Atualizar o nome da clínica existente
        UPDATE clinics 
        SET 
            name = 'Crédito Odontológico',
            description = 'Sistema de crédito para tratamentos odontológicos',
            is_active = true,
            status = 'active',
            updated_at = now()
        WHERE id = v_clinic_id;
        
        RAISE NOTICE 'Clínica atualizada: %', v_clinic_id;
    ELSE
        -- Criar nova clínica
        INSERT INTO clinics (
            name,
            email,
            description,
            owner_id,
            is_active,
            status,
            subscription_plan,
            created_at,
            updated_at
        ) VALUES (
            'Crédito Odontológico',
            'edeventosproducoes@gmail.com',
            'Sistema de crédito para tratamentos odontológicos',
            v_user_id,
            true,
            'active',
            'basic',
            now(),
            now()
        ) RETURNING id INTO v_clinic_id;
        
        RAISE NOTICE 'Nova clínica criada: %', v_clinic_id;
    END IF;
    
END $$;

-- Verificar o resultado
SELECT 
    c.id,
    c.name,
    c.email,
    c.owner_id,
    c.is_active,
    c.status,
    au.email as owner_email
FROM clinics c
JOIN auth.users au ON c.owner_id = au.id
WHERE au.email = 'edeventosproducoes@gmail.com';

-- Verificar solicitações para esta clínica
SELECT 
    cr.id,
    cr.requested_amount,
    cr.status,
    cr.created_at,
    p.email as patient_email,
    c.name as clinic_name
FROM credit_requests cr
JOIN clinics c ON cr.clinic_id = c.id
JOIN auth.users au ON c.owner_id = au.id
LEFT JOIN profiles p ON cr.patient_id = p.id
WHERE au.email = 'edeventosproducoes@gmail.com'
ORDER BY cr.created_at DESC;