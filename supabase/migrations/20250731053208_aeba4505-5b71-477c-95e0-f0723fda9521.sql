-- Insert basic specialties if they don't exist
INSERT INTO public.specialties (name, description, icon) VALUES 
('Ortodontia', 'Correção de posição dos dentes e mordida', 'braces'),
('Implantes', 'Implantes dentários e próteses', 'anchor'),
('Endodontia', 'Tratamento de canal e polpa dentária', 'tooth'),
('Periodontia', 'Tratamento de gengivas e tecidos de suporte', 'heart'),
('Estética', 'Clareamento e procedimentos estéticos', 'star'),
('Clareamento', 'Clareamento dental profissional', 'sun'),
('Cirurgia', 'Cirurgias orais e extrações', 'scissors'),
('Prótese', 'Próteses dentárias e reabilitação', 'doltorizze');

-- Insert sample clinic data
INSERT INTO public.clinics (
  name, description, address, city, state, zip_code, phone, email, website, owner_id, is_active
) VALUES 
(
  'Clínica Dental doltorizze',
  'Clínica especializada em ortodontia e implantes dentários com mais de 15 anos de experiência.',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '01234-567',
  '(11) 3333-3333',
  'contato@dentaldoltorizze.com.br',
  'https://dentaldoltorizze.com.br',
  (SELECT user_id FROM profiles WHERE email = 'master@doutorizze.com.br' LIMIT 1),
  true
),
(
  'Odonto Excellence',
  'Centro odontológico completo com especialistas em todas as áreas da odontologia.',
  'Av. Copacabana, 456',
  'Rio de Janeiro',
  'RJ',
  '22070-000',
  '(21) 4444-4444',
  'contato@odontoexcellence.com.br',
  'https://odontoexcellence.com.br',
  (SELECT user_id FROM profiles WHERE email = 'master@doutorizze.com.br' LIMIT 1),
  true
),
(
  'Sorriso Perfeito',
  'Clínica focada em estética dental e procedimentos de clareamento.',
  'Rua Central, 789',
  'Belo Horizonte',
  'MG',
  '30123-456',
  '(31) 5555-5555',
  'contato@sorrisoperfeito.com.br',
  'https://sorrisoperfeito.com.br',
  (SELECT user_id FROM profiles WHERE email = 'master@doutorizze.com.br' LIMIT 1),
  true
);

-- Insert sample users/profiles
INSERT INTO public.profiles (
  user_id, email, full_name, phone, role
) VALUES 
(gen_random_uuid(), 'joao.silva@email.com', 'João Silva', '(11) 99999-9999', 'patient'),
(gen_random_uuid(), 'maria.santos@email.com', 'Maria Santos', '(11) 88888-8888', 'clinic'),
(gen_random_uuid(), 'carlos.lima@email.com', 'Carlos Lima', '(11) 77777-7777', 'patient'),
(gen_random_uuid(), 'ana.costa@email.com', 'Ana Costa', '(11) 66666-6666', 'clinic');