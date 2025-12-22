-- Inserir dados de teste para clínicas
INSERT INTO clinics (name, email, phone, address, description, is_active, is_verified)
VALUES 
  ('Clínica Odontológica Sorriso', 'contato@clinicasorriso.com', '(11) 99999-1111', 
   '{"street": "Rua das Flores, 123", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}',
   'Clínica especializada em tratamentos odontológicos gerais e estéticos', true, true),
  ('Dental Care Premium', 'atendimento@dentalcare.com', '(11) 99999-2222',
   '{"street": "Av. Paulista, 456", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}',
   'Centro odontológico com tecnologia avançada e especialistas', true, true),
  ('Clínica Vida & Saúde Bucal', 'info@vidasaude.com', '(11) 99999-3333',
   '{"street": "Rua da Saúde, 789", "city": "São Paulo", "state": "SP", "zipCode": "04038-001"}',
   'Atendimento odontológico familiar com foco em prevenção', true, true)
ON CONFLICT (email) DO NOTHING;