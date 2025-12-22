-- Inserir dados de teste para credit_requests
-- Clínica ID: 57a61d41-a8b6-4a47-be8a-b9f9ef574c17

-- Primeiro, vamos verificar se existem profiles para usar como patient_id
-- Se não existir, vamos criar um profile de teste

-- Usar profiles existentes ou criar novos com CPFs únicos
INSERT INTO profiles (id, user_id, full_name, email, phone, cpf, role, account_type, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'João Silva Teste', 'joao.silva.teste@email.com', '(11) 99999-9999', '111.111.111-11', 'patient', 'paciente', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Maria Santos Teste', 'maria.santos.teste@email.com', '(11) 88888-8888', '222.222.222-22', 'patient', 'paciente', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Alternativamente, vamos usar profiles existentes se houver
-- Primeiro vamos verificar quais profiles existem
DO $$
DECLARE
    existing_profile_id uuid;
BEGIN
    -- Pegar um profile existente para usar como patient_id
    SELECT id INTO existing_profile_id FROM profiles WHERE role = 'patient' LIMIT 1;
    
    -- Se encontrou um profile existente, usar ele
    IF existing_profile_id IS NOT NULL THEN
        -- Inserir solicitações usando profile existente
        INSERT INTO credit_requests (
          id,
          patient_id,
          clinic_id,
          requested_amount,
          approved_amount,
          installments,
          interest_rate,
          status,
          treatment_description,
          clinic_comments,
          admin_comments,
          payment_conditions,
          created_at,
          updated_at
        ) VALUES 
          (
            '33333333-3333-3333-3333-333333333333',
            existing_profile_id,
            '57a61d41-a8b6-4a47-be8a-b9f9ef574c17',
            5000.00,
            NULL,
            12,
            2.5,
            'pending',
            'Tratamento ortodôntico completo',
            NULL,
            NULL,
            '{"payment_method": "credit", "down_payment": 500}',
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '2 days'
          )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Inserir mais solicitações de crédito de teste usando os profiles criados
INSERT INTO credit_requests (
  id,
  patient_id,
  clinic_id,
  requested_amount,
  approved_amount,
  installments,
  interest_rate,
  status,
  treatment_description,
  clinic_comments,
  admin_comments,
  payment_conditions,
  created_at,
  updated_at
) VALUES 
  (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    '57a61d41-a8b6-4a47-be8a-b9f9ef574c17',
    3500.00,
    3000.00,
    18,
    2.5,
    'approved',
    'Implante dentário',
    'Aprovado pela clínica com valor ajustado',
    NULL,
    '{"payment_method": "credit", "down_payment": 350}',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '57a61d41-a8b6-4a47-be8a-b9f9ef574c17',
    2000.00,
    NULL,
    6,
    2.5,
    'admin_review',
    'Clareamento dental e limpeza',
    NULL,
    'Em análise pela administração',
    '{"payment_method": "credit", "down_payment": 200}',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 
  cr.id,
  cr.patient_id,
  cr.clinic_id,
  cr.requested_amount,
  cr.status,
  cr.treatment_description,
  p.full_name as patient_name,
  p.email as patient_email
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.id
WHERE cr.clinic_id = '57a61d41-a8b6-4a47-be8a-b9f9ef574c17'
ORDER BY cr.created_at DESC;