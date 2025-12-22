-- Insert test data for credit request testing
-- This will create a test credit request that can be used to test the approval flow

-- First, get the current user ID and a clinic ID
DO $$
DECLARE
    test_user_id uuid;
    test_clinic_id uuid;
    test_patient_id uuid;
BEGIN
    -- Get the current user (should be the logged in user)
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'edeventosproducoes@gmail.com' LIMIT 1;
    
    -- Get any clinic (or create one if none exists)
    SELECT id INTO test_clinic_id FROM clinics WHERE owner_id = test_user_id OR master_user_id = test_user_id LIMIT 1;
    
    -- If no clinic found, create a test clinic
    IF test_clinic_id IS NULL THEN
        INSERT INTO clinics (name, email, owner_id, master_user_id, is_active, is_verified)
        VALUES ('Clínica Teste', 'teste@clinica.com', test_user_id, test_user_id, true, true)
        RETURNING id INTO test_clinic_id;
    END IF;
    
    -- Get or create a test patient profile
    SELECT id INTO test_patient_id FROM profiles WHERE email = 'paciente.teste@email.com' LIMIT 1;
    
    IF test_patient_id IS NULL THEN
        INSERT INTO profiles (id, email, full_name, phone, cpf, user_type)
        VALUES (gen_random_uuid(), 'paciente.teste@email.com', 'João Silva Teste', '(11) 99999-9999', '123.456.789-00', 'patient')
        RETURNING id INTO test_patient_id;
    END IF;
    
    -- Insert test credit request
    INSERT INTO credit_requests (
        patient_id,
        clinic_id,
        patient_name,
        patient_email,
        patient_phone,
        patient_cpf,
        requested_amount,
        installments,
        treatment_description,
        status,
        created_at
    ) VALUES (
        test_patient_id,
        test_clinic_id,
        'João Silva Teste',
        'paciente.teste@email.com',
        '(11) 99999-9999',
        '123.456.789-00',
        5000.00,
        12,
        'Tratamento odontológico - Implante dentário - Valor: R$ 5.000,00 - Profissão: Engenheiro - Renda: R$ 8.000,00',
        'pending',
        NOW()
    );
    
    RAISE NOTICE 'Test credit request created successfully for clinic % and patient %', test_clinic_id, test_patient_id;
END $$;