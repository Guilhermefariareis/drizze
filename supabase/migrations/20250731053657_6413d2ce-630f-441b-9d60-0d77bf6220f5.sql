-- First ensure we have the master user profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'master@doutorizze.com.br') THEN
    INSERT INTO profiles (user_id, email, full_name, role) 
    VALUES (gen_random_uuid(), 'master@doutorizze.com.br', 'Administrador Master', 'admin');
  END IF;
END $$;

-- Insert sample specialties (ignore if already exist)
INSERT INTO specialties (name, description, icon) VALUES 
  ('Ortodontia', 'Correção de posição dos dentes e mordida', 'braces'),
  ('Implantes', 'Implantes dentários e próteses', 'anchor'),
  ('Endodontia', 'Tratamento de canal e polpa dentária', 'tooth'),
  ('Estética', 'Procedimentos estéticos dentários', 'star')
ON CONFLICT (name) DO NOTHING;

-- Get the master user id
DO $$
DECLARE
  master_user_id UUID;
BEGIN
  SELECT user_id INTO master_user_id FROM profiles WHERE email = 'master@doutorizze.com.br' LIMIT 1;
  
  -- Insert sample clinics
  INSERT INTO clinics (name, description, address, city, state, zip_code, phone, email, owner_id, is_active) VALUES
  ('Clínica Dental doltorizze', 'Especializada em ortodontia e estética dental', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', '(11) 3333-3333', 'contato@dentaldoltorizze.com', master_user_id, true),
  ('Odonto Excellence', 'Centro completo de odontologia', 'Av. Copacabana, 456', 'Rio de Janeiro', 'RJ', '22070-000', '(21) 4444-4444', 'contato@odontoexcellence.com', master_user_id, true),
  ('Sorriso Perfeito', 'Clínica focada em estética dental', 'Rua Central, 789', 'Belo Horizonte', 'MG', '30123-456', '(31) 5555-5555', 'contato@sorrisoperfeito.com', master_user_id, true)
  ON CONFLICT (name) DO NOTHING;
  
  -- Insert sample patients
  INSERT INTO profiles (user_id, email, full_name, phone, role) VALUES
  (gen_random_uuid(), 'joao.silva@email.com', 'João Silva', '(11) 99999-9999', 'patient'),
  (gen_random_uuid(), 'maria.santos@email.com', 'Maria Santos', '(11) 88888-8888', 'patient'),
  (gen_random_uuid(), 'carlos.lima@email.com', 'Carlos Lima', '(11) 77777-7777', 'patient')
  ON CONFLICT (email) DO NOTHING;
END $$;