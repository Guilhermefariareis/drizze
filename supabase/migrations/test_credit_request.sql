-- Inserir uma solicitação de crédito de teste para a clínica
INSERT INTO credit_requests (
  id,
  patient_id,
  clinic_id,
  status,
  description,
  patient_name,
  patient_email,
  patient_phone,
  patient_cpf,
  treatment_type,
  urgency_level,
  requested_date,
  requested_amount,
  treatment_description,
  installments,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'e0f4a11c-4b2e-4476-bd6f-51098a83f1df', -- ID do usuário logado
  '57a61d41-a8b6-4a47-be8a-b9f9ef574c17', -- ID da clínica de teste
  'pending',
  'Solicitação de crédito para tratamento ortodôntico',
  'João Silva',
  'edeventosproducoes@gmail.com',
  '(11) 99999-9999',
  '123.456.789-00',
  'Ortodontia',
  'normal',
  CURRENT_DATE,
  5000.00,
  'Tratamento ortodôntico completo com aparelho fixo metálico',
  12,
  NOW(),
  NOW()
);