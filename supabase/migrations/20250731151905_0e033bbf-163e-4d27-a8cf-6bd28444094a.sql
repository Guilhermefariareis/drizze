-- Create 3 demo clinics
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
  rating, 
  total_reviews,
  latitude,
  longitude,
  website,
  is_active
) VALUES 
(
  'a1b2c3d4-e5f6-7890-1234-567890123456',
  'Clínica Dental doltorizze Plus',
  'Especializada em odontologia estética e implantes dentários. Oferecemos tratamentos modernos com tecnologia de ponta.',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '01234-567',
  '(11) 99999-0001',
  'contato@doltorizzeplus.com.br',
  4.8,
  127,
  -23.5505,
  -46.6333,
  'https://doltorizzeplus.com.br',
  true
),
(
  'b2c3d4e5-f6g7-8901-2345-678901234567',
  'OdontoExcelência Centro',
  'Clínica completa com especialistas em ortodontia, endodontia e cirurgia oral. Atendimento humanizado e de qualidade.',
  'Av. Paulista, 456',
  'São Paulo',
  'SP',
  '01310-100',
  '(11) 99999-0002',
  'atendimento@odontoexcelencia.com.br',
  4.6,
  203,
  -23.5616,
  -46.6562,
  'https://odontoexcelencia.com.br',
  true
),
(
  'c3d4e5f6-g7h8-9012-3456-789012345678',
  'Dental Care Premium',
  'Referência em tratamentos odontológicos premium. Oferecemos desde limpeza até procedimentos complexos de reabilitação oral.',
  'Rua Augusta, 789',
  'São Paulo',
  'SP',
  '01305-000',
  '(11) 99999-0003',
  'premium@dentalcare.com.br',
  4.9,
  156,
  -23.5489,
  -46.6511,
  'https://dentalcarepremium.com.br',
  true
);

-- Create clinic profiles for the demo clinics
INSERT INTO public.clinic_profiles (
  clinic_id,
  description,
  specialties,
  opening_hours,
  team_size,
  founded_year,
  gallery_images,
  cover_image_url,
  logo_url
) VALUES 
(
  'a1b2c3d4-e5f6-7890-1234-567890123456',
  'Nossa clínica é especializada em transformar sorrisos com tecnologia de ponta e atendimento humanizado.',
  ARRAY['Implantes', 'Estética Dental', 'Clareamento', 'Próteses'],
  '{
    "monday": {"open": "08:00", "close": "18:00"},
    "tuesday": {"open": "08:00", "close": "18:00"},
    "wednesday": {"open": "08:00", "close": "18:00"},
    "thursday": {"open": "08:00", "close": "18:00"},
    "friday": {"open": "08:00", "close": "17:00"},
    "saturday": {"open": "08:00", "close": "12:00"},
    "sunday": {"closed": true}
  }',
  12,
  2018,
  ARRAY['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400'],
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200'
),
(
  'b2c3d4e5-f6g7-8901-2345-678901234567',
  'Centro odontológico completo com foco em excelência e inovação nos tratamentos.',
  ARRAY['Ortodontia', 'Endodontia', 'Cirurgia Oral', 'Periodontia'],
  '{
    "monday": {"open": "07:00", "close": "19:00"},
    "tuesday": {"open": "07:00", "close": "19:00"},
    "wednesday": {"open": "07:00", "close": "19:00"},
    "thursday": {"open": "07:00", "close": "19:00"},
    "friday": {"open": "07:00", "close": "18:00"},
    "saturday": {"open": "08:00", "close": "14:00"},
    "sunday": {"closed": true}
  }',
  18,
  2015,
  ARRAY['https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400'],
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200'
),
(
  'c3d4e5f6-g7h8-9012-3456-789012345678',
  'Clínica premium com foco em tratamentos de alta complexidade e conforto do paciente.',
  ARRAY['Reabilitação Oral', 'Implantodontia', 'Harmonização Facial', 'Sedação'],
  '{
    "monday": {"open": "08:00", "close": "20:00"},
    "tuesday": {"open": "08:00", "close": "20:00"},
    "wednesday": {"open": "08:00", "close": "20:00"},
    "thursday": {"open": "08:00", "close": "20:00"},
    "friday": {"open": "08:00", "close": "18:00"},
    "saturday": {"open": "09:00", "close": "15:00"},
    "sunday": {"closed": true}
  }',
  25,
  2012,
  ARRAY['https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccf?w=400', 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400'],
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200'
);

-- Create some services for each clinic
INSERT INTO public.clinic_services (
  clinic_id,
  name,
  description,
  price_min,
  price_max,
  duration_minutes,
  category
) VALUES 
-- doltorizze Plus services
('a1b2c3d4-e5f6-7890-1234-567890123456', 'Implante Dentário', 'Implante unitário com coroa em porcelana', 2500.00, 4500.00, 90, 'Implantodontia'),
('a1b2c3d4-e5f6-7890-1234-567890123456', 'Clareamento Dental', 'Clareamento a laser em consultório', 800.00, 1200.00, 60, 'Estética'),
('a1b2c3d4-e5f6-7890-1234-567890123456', 'Lentes de Contato Dental', 'Facetas ultra finas em porcelana', 1500.00, 2500.00, 120, 'Estética'),

-- OdontoExcelência services  
('b2c3d4e5-f6g7-8901-2345-678901234567', 'Aparelho Ortodôntico', 'Tratamento ortodôntico completo', 3000.00, 6000.00, 45, 'Ortodontia'),
('b2c3d4e5-f6g7-8901-2345-678901234567', 'Tratamento de Canal', 'Endodontia completa com pino e coroa', 800.00, 1500.00, 90, 'Endodontia'),
('b2c3d4e5-f6g7-8901-2345-678901234567', 'Cirurgia de Siso', 'Extração de dentes do siso', 400.00, 800.00, 60, 'Cirurgia'),

-- Dental Care Premium services
('c3d4e5f6-g7h8-9012-3456-789012345678', 'Reabilitação Oral Completa', 'Tratamento completo da boca', 15000.00, 30000.00, 180, 'Reabilitação'),
('c3d4e5f6-g7h8-9012-3456-789012345678', 'Harmonização Facial', 'Botox e preenchimento facial', 1200.00, 2500.00, 60, 'Estética Facial'),
('c3d4e5f6-g7h8-9012-3456-789012345678', 'Implante com Carga Imediata', 'Implante e prótese no mesmo dia', 5000.00, 8000.00, 150, 'Implantodontia');