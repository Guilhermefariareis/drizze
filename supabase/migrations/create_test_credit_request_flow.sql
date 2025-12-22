-- Primeiro, vamos verificar se temos dados de usuários e clínicas
DO $$
DECLARE
    test_user_id uuid;
    test_clinic_id uuid;
    existing_request_count integer;
BEGIN
    -- Buscar um usuário de teste
    SELECT id INTO test_user_id FROM profiles WHERE email = 'teste@clinica.com' LIMIT 1;
    
    -- Buscar uma clínica de teste
    SELECT id INTO test_clinic_id FROM clinics LIMIT 1;
    
    -- Verificar quantas solicitações já existem
    SELECT COUNT(*) INTO existing_request_count FROM credit_requests;
    
    RAISE NOTICE 'Usuário encontrado: %', test_user_id;
    RAISE NOTICE 'Clínica encontrada: %', test_clinic_id;
    RAISE NOTICE 'Solicitações existentes: %', existing_request_count;
    
    -- Se temos usuário e clínica, criar uma solicitação de teste
    IF test_user_id IS NOT NULL AND test_clinic_id IS NOT NULL THEN
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
            'Paciente Teste Fluxo',
            'teste@clinica.com',
            '(11) 99999-9999',
            test_clinic_id,
            8000.00,
            24,
            'Tratamento ortodôntico completo - Teste de fluxo',
            'pending'
        );
        
        RAISE NOTICE 'Solicitação de teste criada com sucesso!';
    ELSE
        RAISE NOTICE 'Não foi possível criar solicitação - dados insuficientes';
    END IF;
END $$;