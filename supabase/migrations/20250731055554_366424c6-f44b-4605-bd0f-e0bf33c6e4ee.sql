-- Temporariamente alterar a tabela para permitir owner_id nulo
ALTER TABLE public.clinics ALTER COLUMN owner_id DROP NOT NULL;

-- Inserir as clínicas sem owner_id por enquanto
INSERT INTO public.clinics (id, name, description, address, city, state, zip_code, phone, email, website, is_active, rating, total_reviews, parcelamais_clinic_id) VALUES
(gen_random_uuid(), 'Clínica OdontoSaúde', 'Especializada em implantes e ortodontia com tecnologia de ponta', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', '(11) 3456-7890', 'contato@odontosaude.com.br', 'www.odontosaude.com.br', true, 4.8, 150, 'CLI001'),
(gen_random_uuid(), 'Sorriso Perfeito', 'Clínica familiar com atendimento humanizado e preços acessíveis', 'Av. Central, 456', 'Rio de Janeiro', 'RJ', '20000-000', '(21) 2345-6789', 'atendimento@sorrisoperfeito.com.br', 'www.sorrisoperfeito.com.br', true, 4.6, 89, 'CLI002'),
(gen_random_uuid(), 'DentalCare Premium', 'Centro odontológico completo com especialistas renomados', 'Rua Presidente Vargas, 789', 'Belo Horizonte', 'MG', '30000-000', '(31) 3456-7890', 'premium@dentalcare.com.br', 'www.dentalcarepremium.com.br', true, 4.9, 234, 'CLI003'),
(gen_random_uuid(), 'Clínica Dental Moderna', 'Equipamentos de última geração e tratamentos inovadores', 'Rua da Saúde, 321', 'Porto Alegre', 'RS', '90000-000', '(51) 3456-7890', 'moderna@dentalmoderna.com.br', 'www.dentalmoderna.com.br', true, 4.7, 167, 'CLI004'),
(gen_random_uuid(), 'Odonto Excellence', 'Especializada em estética dental e harmonização facial', 'Av. Boa Viagem, 654', 'Recife', 'PE', '50000-000', '(81) 3456-7890', 'excellence@odontoexcellence.com.br', 'www.odontoexcellence.com.br', true, 4.5, 98, 'CLI005');

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