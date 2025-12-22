-- Get the master user id and insert sample data
WITH master_user AS (
  SELECT user_id FROM profiles WHERE email = 'master@doutorizze.com.br' LIMIT 1
)
INSERT INTO clinics (name, description, address, city, state, zip_code, phone, email, owner_id, is_active)
SELECT 
  'Clínica Dental doltorizze',
  'Especializada em ortodontia e estética dental',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '01234-567',
  '(11) 3333-3333',
  'contato@dentaldoltorizze.com',
  master_user.user_id,
  true
FROM master_user
WHERE NOT EXISTS (SELECT 1 FROM clinics WHERE name = 'Clínica Dental doltorizze');

-- Insert patient profiles
INSERT INTO profiles (user_id, email, full_name, phone, role)
SELECT 
  gen_random_uuid(),
  'joao.silva@email.com',
  'João Silva',
  '(11) 99999-9999',
  'patient'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'joao.silva@email.com');