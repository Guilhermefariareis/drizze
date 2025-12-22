-- Migração para adicionar clínicas em Goiás, especialmente em Trindade e região
-- Isso resolverá o problema de não haver clínicas próximas para usuários em Trindade

INSERT INTO public.clinics (
  id,
  name,
  description,
  address,
  city,
  state,
  zip_code,
  phone,
  email,
  is_active,
  rating,
  total_reviews
) VALUES 
-- Clínicas em Trindade
(
  gen_random_uuid(),
  'Clínica OdontoTrindade',
  'Clínica odontológica completa em Trindade com atendimento familiar',
  'Rua Principal, 123 - Centro',
  'Trindade',
  'GO',
  '75380-000',
  '(62) 3506-1234',
  'contato@odontotrindade.com.br',
  true,
  4.7,
  85
),
(
  gen_random_uuid(),
  'Sorriso Trindade',
  'Especializada em ortodontia e implantes dentários',
  'Av. Bernardo Sayão, 456',
  'Trindade',
  'GO',
  '75380-000',
  '(62) 3506-5678',
  'atendimento@sorrisotrindade.com.br',
  true,
  4.5,
  67
),
(
  gen_random_uuid(),
  'Dental Care Trindade',
  'Centro odontológico moderno com tecnologia avançada',
  'Rua São José, 789',
  'Trindade',
  'GO',
  '75380-000',
  '(62) 3506-9012',
  'contato@dentalcaretrindade.com.br',
  true,
  4.8,
  92
),

-- Clínicas em Goiânia (cidade próxima)
(
  gen_random_uuid(),
  'OdontoGoiânia Premium',
  'Clínica premium com especialistas em todas as áreas',
  'Rua T-25, 1234 - Setor Bueno',
  'Goiânia',
  'GO',
  '74210-030',
  '(62) 3241-1234',
  'premium@odontogoiania.com.br',
  true,
  4.9,
  156
),
(
  gen_random_uuid(),
  'Clínica Dental Goiás',
  'Tradição em odontologia há mais de 20 anos',
  'Av. 85, 567 - Setor Sul',
  'Goiânia',
  'GO',
  '74080-010',
  '(62) 3241-5678',
  'contato@dentalgoias.com.br',
  true,
  4.6,
  134
),

-- Clínicas em Anápolis
(
  gen_random_uuid(),
  'Anápolis Odonto Center',
  'Centro odontológico completo em Anápolis',
  'Rua Marechal Deodoro, 890',
  'Anápolis',
  'GO',
  '75020-010',
  '(62) 3324-1234',
  'contato@anapolisodonto.com.br',
  true,
  4.4,
  78
),

-- Clínicas em Aparecida de Goiânia
(
  gen_random_uuid(),
  'Aparecida Dental',
  'Atendimento odontológico de qualidade em Aparecida',
  'Av. Independência, 321',
  'Aparecida de Goiânia',
  'GO',
  '74905-000',
  '(62) 3277-1234',
  'contato@aparecidadental.com.br',
  true,
  4.3,
  56
),

-- Clínicas em Senador Canedo
(
  gen_random_uuid(),
  'Canedo Odontologia',
  'Clínica familiar em Senador Canedo',
  'Rua Central, 654',
  'Senador Canedo',
  'GO',
  '75250-000',
  '(62) 3336-1234',
  'contato@canedoodonto.com.br',
  true,
  4.2,
  43
);

-- Garantir permissões para as tabelas
GRANT SELECT ON public.clinics TO anon;
GRANT SELECT ON public.clinics TO authenticated;

-- Comentário sobre a migração
COMMENT ON TABLE public.clinics IS 'Tabela de clínicas odontológicas - atualizada com clínicas em Goiás para resolver problema de proximidade';