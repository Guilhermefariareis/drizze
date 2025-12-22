-- Criar alguns usuários de teste para facilitar o login
-- Para clínica
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, encrypted_password, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'clinica@teste.com',
  now(),
  now(),
  now(),
  crypt('123456', gen_salt('bf')),
  '{"full_name": "Clínica Teste"}'::jsonb
);

-- Para paciente  
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, encrypted_password, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'paciente@teste.com',
  now(), 
  now(),
  now(),
  crypt('123456', gen_salt('bf')),
  '{"full_name": "Paciente Teste"}'::jsonb
);