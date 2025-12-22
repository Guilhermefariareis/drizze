-- Verificar clínicas existentes
SELECT id, name, email, owner_id FROM clinics LIMIT 5;

-- Verificar solicitações de crédito existentes
SELECT 
    cr.id,
    cr.patient_name,
    cr.clinic_id,
    c.name as clinic_name,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- Atualizar o testClinic ID no código para corresponder à clínica real
-- Primeiro, vamos pegar o ID da primeira clínica
DO $$
DECLARE
    real_clinic_id uuid;
    test_user_id uuid;
BEGIN
    -- Buscar a primeira clínica
    SELECT id INTO real_clinic_id FROM clinics LIMIT 1;
    
    -- Buscar o usuário de teste
    SELECT id INTO test_user_id FROM profiles WHERE email = 'teste@clinica.com' LIMIT 1;
    
    RAISE NOTICE 'Clínica real ID: %', real_clinic_id;
    RAISE NOTICE 'Usuário teste ID: %', test_user_id;
    
    -- Se não há solicitações para a clínica real, criar uma
    IF real_clinic_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Verificar se já existe solicitação para esta clínica
        IF NOT EXISTS (SELECT 1 FROM credit_requests WHERE clinic_id = real_clinic_id) THEN
            INSERT INTO credit_requests (
                patient_id,
                patient_name,
                patient_email,
                patient_phone,
                clinic_id,
                requested_amount,
                installments,
                treatment_description,
                status
            ) VALUES (
                test_user_id,
                'Paciente Teste Real',
                'teste@clinica.com',
                '(11) 99999-9999',
                real_clinic_id,
                12000.00,
                36,
                'Implante dentário completo - Teste real',
                'pending'
            );
            
            RAISE NOTICE 'Solicitação criada para a clínica real!';
        ELSE
            RAISE NOTICE 'Já existe solicitação para esta clínica';
        END IF;
    END IF;
END $$;