-- Criar usuário de teste e clínica associada
-- Primeiro, inserir um usuário de teste
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  encrypted_password,
  raw_user_meta_data
) VALUES (
  '12345678-1234-1234-1234-123456789012',
  'teste@clinica.com',
  now(),
  now(),
  now(),
  crypt('123456', gen_salt('bf')),
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- Inserir perfil do usuário
INSERT INTO public.profiles (
  id,
  user_id,
  email,
  full_name,
  role,
  phone
) VALUES (
  gen_random_uuid(),
  '12345678-1234-1234-1234-123456789012',
  'teste@clinica.com',
  'Dr. Teste Silva