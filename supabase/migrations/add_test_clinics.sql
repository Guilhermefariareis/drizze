-- Adicionar dados de teste para clínicas
INSERT INTO clinics (name, email, phone, description, is_active, is_verified, city) VALUES
('Clínica Odontológica Sorriso', 'contato@clinicasorriso.com', '(11) 99999-1111', 'Clínica especializada em tratamentos odontológicos completos', true, true, 'São Paulo'),
('Dental Care Premium', 'atendimento@dentalcare.com', '(11) 99999-2222', 'Tratamentos odontológicos de alta qualidade', true, true, 'Rio de Janeiro'),
('Centro Odontológico Vida', 'info@centrovida.com', '(11) 99999-3333', 'Especialistas em implantes e ortodontia', true, true, 'Belo Horizonte')
ON CONFLICT (email) DO NOTHING;

-- Garantir permissões para a tabela clinics
GRANT SELECT ON clinics TO anon;
GRANT SELECT ON clinics TO authenticated;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_clinics FROM clinics WHERE is_active = true;