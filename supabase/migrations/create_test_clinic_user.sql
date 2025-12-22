-- Criar usuário de teste e clínica associada para gomessjr@outlook.com

-- Primeiro, inserir o perfil do usuário na tabela profiles
INSERT INTO profiles (id, user_id, email, full_name, role, account_type, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'gomessjr@outlook.com',
  'Dr. Gomes Jr',
  'clinic',
  'clinica',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Inserir a clínica associada ao usuário
INSERT INTO clinics (
  id,
  name,
  email,
  phone,
  address,
  city,
  cnpj,
  owner_id,
  status,
  subscription_plan,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'Clínica Dr. Gomes Jr',
  'gomessjr@outlook.com',
  '(11) 99999-9999',
  '{"street": "Rua das Flores, 123", "city": "São Paulo", "state": "SP", "zip_code": "01234-567"}'::jsonb,
  'São Paulo',
  '12.345.678/0001-90',
  p.id,
  'active',
  'basic',
  NOW(),
  NOW()
FROM profiles p
WHERE p.email = 'gomessjr@outlook.com'
ON CONFLICT DO NOTHING;

-- Inserir algumas especialidades para a clínica
INSERT INTO specialties (id, name, description, created_at)
VALUES 
  (gen_random_uuid(), 'Clínica Geral', 'Atendimento médico geral', NOW()),
  (gen_random_uuid(), 'Cardiologia', 'Especialidade em doenças do coração', NOW())
ON CONFLICT (name) DO NOTHING;

-- Inserir alguns serviços para a clínica
INSERT INTO clinic_services (id, clinic_id, service_name, service_description, price, duration_minutes, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  'Consulta Médica',
  'Consulta médica geral',
  150.00,
  60,
  NOW()
FROM clinics c
WHERE c.email = 'gomessjr@outlook.com'
ON CONFLICT DO NOTHING;

-- Inserir horários de funcionamento padrão
INSERT INTO horarios_funcionamento (id, clinica_id, dia_semana, hora_inicio, hora_fim, ativo, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  generate_series(1, 5), -- Segunda a sexta
  '08:00:00',
  '18:00:00',
  true,
  NOW()
FROM clinics c
WHERE c.email = 'gomessjr@outlook.com'
ON CONFLICT DO NOTHING;

-- Conceder permissões para as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinic_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON specialties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON horarios_funcionamento TO authenticated;

-- Verificar se os dados foram inseridos corretamente
SELECT 
  p.email as user_email,
  p.full_name,
  c.name as clinic_name,
  c.status as clinic_status
FROM profiles p
LEFT JOIN clinics c ON c.owner_id = p.id
WHERE p.email = 'gomessjr@outlook.com';