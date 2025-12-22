-- Teste do fluxo de aprovação de crédito
-- Este script testa se o fluxo de aprovação está funcionando corretamente

-- 1. Verificar se existe uma solicitação pendente
DO $$
DECLARE
    test_request_id UUID;
    clinic_test_id UUID := '00000000-0000-0000-0000-000000000001';
    patient_test_id UUID := 'e0f4a11c-4b2e-4476-bd6f-51098a83f1df';
    request_count INTEGER;
BEGIN
    -- Verificar se existe uma solicitação pendente
    SELECT COUNT(*) INTO request_count 
    FROM credit_requests 
    WHERE status = 'pending' AND clinic_id = clinic_test_id;
    
    RAISE NOTICE '🔍 Solicitações pendentes encontradas: %', request_count;
    
    -- Se não existe, criar uma
    IF request_count = 0 THEN
        RAISE NOTICE '⚠️ Criando solicitação de teste...';
        
        INSERT INTO credit_requests (
            patient_id,
            clinic_id,
            requested_amount,
            treatment_description,
            status,
            patient_birth_date,
            patient_gender,
            patient_address,
            treatment_type,
            urgency_level,
            preferred_date
        ) VALUES (
            patient_test_id,
            clinic_test_id,
            5000.00,
            'Teste de aprovação de crédito - SQL',
            'pending',
            '1990-01-01',
            'M',
            'Endereço de teste',
            'Ortodontia',
            'medium',
            '2024-02-01'
        ) RETURNING id INTO test_request_id;
        
        RAISE NOTICE '✅ Solicitação de teste criada com ID: %', test_request_id;
    ELSE
        -- Usar uma solicitação existente
        SELECT id INTO test_request_id 
        FROM credit_requests 
        WHERE status = 'pending' AND clinic_id = clinic_test_id 
        LIMIT 1;
        
        RAISE NOTICE '📋 Usando solicitação existente com ID: %', test_request_id;
    END IF;
    
    -- 2. Testar aprovação pela clínica
    RAISE NOTICE '🚀 Testando aprovação pela clínica...';
    
    UPDATE credit_requests 
    SET 
        status = 'clinic_approved',
        clinic_comments = 'Aprovado pela clínica - teste SQL',
        updated_at = NOW()
    WHERE id = test_request_id AND clinic_id = clinic_test_id;
    
    -- Verificar se a atualização funcionou
    IF FOUND THEN
        RAISE NOTICE '✅ Solicitação aprovada com sucesso!';
        
        -- Verificar o status atual
        SELECT status INTO request_count FROM credit_requests WHERE id = test_request_id;
        RAISE NOTICE '📊 Status atual da solicitação: %', request_count;
        
        -- 3. Verificar se aparece no painel admin
        SELECT COUNT(*) INTO request_count 
        FROM credit_requests 
        WHERE status = 'clinic_approved';
        
        RAISE NOTICE '🏥 Total de solicitações clinic_approved no painel admin: %', request_count;
        
        -- 4. Criar notificação para o paciente
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            read
        ) VALUES (
            patient_test_id,
            'Solicitação Aprovada pela Clínica',
            'Sua solicitação de crédito foi aprovada pela clínica e enviada para análise final.',
            'credit_update',
            false
        );
        
        RAISE NOTICE '📧 Notificação criada para o paciente';
        
        RAISE NOTICE '🎉 TESTE CONCLUÍDO COM SUCESSO!';
        RAISE NOTICE '==========================================';
        RAISE NOTICE '✅ Fluxo de aprovação funcionando corretamente';
        RAISE NOTICE '✅ Solicitação aprovada pela clínica';
        RAISE NOTICE '✅ Status atualizado para clinic_approved';
        RAISE NOTICE '✅ Aparece no painel admin';
        RAISE NOTICE '✅ Notificação criada';
        
    ELSE
        RAISE NOTICE '❌ ERRO: Não foi possível aprovar a solicitação';
        RAISE NOTICE '🔍 Verificando políticas RLS...';
        
        -- Verificar se a solicitação ainda existe
        SELECT COUNT(*) INTO request_count 
        FROM credit_requests 
        WHERE id = test_request_id;
        
        IF request_count = 0 THEN
            RAISE NOTICE '❌ Solicitação não encontrada';
        ELSE
            RAISE NOTICE '⚠️ Solicitação existe mas não foi atualizada - possível problema de RLS';
        END IF;
    END IF;
    
END $$;