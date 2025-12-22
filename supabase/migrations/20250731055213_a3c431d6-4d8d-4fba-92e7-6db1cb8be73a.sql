-- Primeiro criar alguns perfis de usuário para as clínicas
INSERT INTO public.profiles (id, user_id, email, full_name, role, phone) VALUES
(gen_random_uuid(), gen_random_uuid(), 'admin@odontosaude.com.br', 'Dr. João Silva', 'clinic_owner', '(11) 98765-4321'),
(gen_random_uuid(), gen_random_uuid(), 'admin@sorrisoperfeito.com.br', 'Dra. Maria Santos', 'clinic_owner', '(21) 98765-4321'),
(gen_random_uuid(), gen_random_uuid(), 'admin@dentalcare.com.br', 'Dr. Carlos Oliveira', 'clinic_owner', '(31) 98765-4321'),
(gen_random_uuid(), gen_random_uuid(), 'admin@dentalmoderna.com.br', 'Dra. Ana Costa', 'clinic_owner', '(51) 98765-4321'),
(gen_random_uuid(), gen_random_uuid(), 'admin@odontoexcellence.com.br', 'Dr. Pedro Lima', 'clinic_owner', '(81) 98765-4321');

-- Agora inserir as clínicas usando os user_id dos perfis criados
INSERT INTO public.clinics (id, owner_id, name, description, address, city, state, zip_code, phone, email, website, is_active, rating, total_reviews, parcelamais_clinic_id) 
SELECT 
  gen_random_uuid(),
  p.user_id,
  c.name,
  c.description,
  c.address,
  c.city,
  c.state,
  c.zip_code,
  c.phone,
  c.email,
  c.website,
  c.is_active,
  c.rating,
  c.total_reviews,
  c.parcelamais_clinic_id
FROM (VALUES
  ('Clínica OdontoSaúde', 'Especializada em implantes e ortodontia com tecnologia de ponta', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', '(11) 3456-7890', 'contato@odontosaude.com.br', 'www.odontosaude.com.br', true, 4.8, 150, 'CLI001', 'admin@odontosaude.com.br'),
  ('Sorriso Perfeito', 'Clínica familiar com atendimento humanizado e preços acessíveis', 'Av. Central, 456', 'Rio de Janeiro', 'RJ', '20000-000', '(21) 2345-6789', 'atendimento@sorrisoperfeito.com.br', 'www.sorrisoperfeito.com.br', true, 4.6, 89, 'CLI002', 'admin@sorrisoperfeito.com.br'),
  ('DentalCare Premium', 'Centro odontológico completo com especialistas renomados', 'Rua Presidente Vargas, 789', 'Belo Horizonte', 'MG', '30000-000', '(31) 3456-7890', 'premium@dentalcare.com.br', 'www.dentalcarepremium.com.br', true, 4.9, 234, 'CLI003', 'admin@dentalcare.com.br'),
  ('Clínica Dental Moderna', 'Equipamentos de última geração e tratamentos inovadores', 'Rua da Saúde, 321', 'Porto Alegre', 'RS', '90000-000', '(51) 3456-7890', 'moderna@dentalmoderna.com.br', 'www.dentalmoderna.com.br', true, 4.7, 167, 'CLI004', 'admin@dentalmoderna.com.br'),
  ('Odonto Excellence', 'Especializada em estética dental e harmonização facial', 'Av. Boa Viagem, 654', 'Recife', 'PE', '50000-000', '(81) 3456-7890', 'excellence@odontoexcellence.com.br', 'www.odontoexcellence.com.br', true, 4.5, 98, 'CLI005', 'admin@odontoexcellence.com.br')
) AS c(name, description, address, city, state, zip_code, phone, email, website, is_active, rating, total_reviews, parcelamais_clinic_id, owner_email)
JOIN public.profiles p ON p.email = c.owner_email;

-- Recriar alguns tratamentos
INSERT INTO public.treatments (id, name, description, estimated_cost_min, estimated_cost_max, typical_installments) VALUES
(gen_random_uuid(), 'Limpeza Dental', 'Profilaxia e remoção de tártaro', 80.00, 150.00, 3),
(gen_random_uuid(), 'Clareamento Dental', 'Clareamento a laser ou com moldeiras', 300.00, 800.00, 6),
(gen_random_uuid(), 'Implante Unitário', 'Implante com coroa cerâmica', 1500.00, 3500.00, 12),
(gen_random_uuid(), 'Aparelho Ortodôntico', 'Tratamento ortodôntico completo', 2000.00, 6000.00, 24),
(gen_random_uuid(), 'Tratamento de Canal', 'Endodontia completa', 400.00, 1200.00, 8),
(gen_random_uuid(), 'Prótese Dentária', 'Prótese parcial ou total', 800.00, 4000.00, 15),
(gen_random_uuid(), 'Extração Dental', 'Extração simples ou cirúrgica', 100.00, 500.00, 3),
(gen_random_uuid(), 'Facetas de Porcelana', 'Facetas estéticas', 1000.00, 2500.00, 10);