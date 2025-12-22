-- Criar solicitação de teste para a clínica do usuário logado
DO $$
DECLARE
    logged_user_clinic_id uuid := '45b2554d-d220-43b4-a167-afa694caa76b';
    test_user_id uuid;
BEGIN
    -- Buscar um usuário de teste
    SELECT id INTO test_user_id FROM profiles WHERE email = 'teste@clinica.com' LIMIT 1;
    
    -- Se não encontrar, usar o próprio usuário logado
    IF test_user_id IS NULL THEN
        SELECT id INTO test_user_id FROM profiles WHERE email = 'edeventosproducoes@gmail.com' LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Usuário para teste: %', test_user_id;
    RAISE NOTICE 'Clínica do usuário logado: %', logged_user_clinic_id;
    
    -- Criar solicitação para a clínica do usuário logado
    IF test_user_id IS NOT NULL THEN
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
            'Paciente Teste Clínica Logada',
            'teste@paciente.com',
            '(11) 98765-4321',
            logged_user_clinic_id,
            15000.00,
            48,
            'Tratamento ortodôntico completo com aparelho fixo',
            'pending'
        );
        
        RAISE NOTICE 'Solicitação criada para a clínica do usuário logado!';
    ELSE
        RAISE NOTICE 'Usuário não encontrado para criar solicitação';
    END IF;
END $$;

-- Verificar se a solicitação foi criada
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
WHERE cr.clinic_id = '45b2554d-d220-43b4-a167-afa694caa76b'