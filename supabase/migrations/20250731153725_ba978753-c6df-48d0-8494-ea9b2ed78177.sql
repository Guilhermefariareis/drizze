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
  '20aa8fa7-f9e5-4eab-884a-e5af12bb08d3',
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
  '8a634302-f0df-45be-ae23-ecfdddf4a3dd',
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
  '514a12ba-ff28-4b5b-9e7a-fe84775aa7bc',
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
('20aa8fa7-f9e5-4eab-884a-e5af12bb08d3', 'Implante Dentário', 'Implante unitário com coroa em porcelana', 2500.00, 4500.00, 90, 'Implantodontia'),
('20aa8fa7-f9e5-4eab-884a-e5af12bb08d3', 'Clareamento Dental', 'Clareamento a laser em consultório', 800.00, 1200.00, 60, 'Estética'),
('20aa8fa7-f9e5-4eab-884a-e5af12bb08d3', 'Lentes de Contato Dental', 'Facetas ultra finas em porcelana', 1500.00, 2500.00, 120, 'Estética'),

-- OdontoExcelência services  
('8a634302-f0df-45be-ae23-ecfdddf4a3dd', 'Aparelho Ortodôntico', 'Tratamento ortodôntico completo', 3000.00, 6000.00, 45, 'Ortodontia'),
('8a634302-f0df-45be-ae23-ecfdddf4a3dd', 'Tratamento de Canal', 'Endodontia completa com pino e coroa', 800.00, 1500.00, 90, 'Endodontia'),
('8a634302-f0df-45be-ae23-ecfdddf4a3dd', 'Cirurgia de Siso', 'Extração de dentes do siso', 400.00, 800.00, 60, 'Cirurgia'),

-- Dental Care Premium services
('514a12ba-ff28-4b5b-9e7a-fe84775aa7bc', 'Reabilitação Oral Completa', 'Tratamento completo da boca', 15000.00, 30000.00, 180, 'Reabilitação'),
('514a12ba-ff28-4b5b-9e7a-fe84775aa7bc', 'Harmonização Facial', 'Botox e preenchimento facial', 1200.00, 2500.00, 60, 'Estética Facial'),
('514a12ba-ff28-4b5b-9e7a-fe84775aa7bc', 'Implante com Carga Imediata', 'Implante e prótese no mesmo dia', 5000.00, 8000.00, 150, 'Implantodontia');