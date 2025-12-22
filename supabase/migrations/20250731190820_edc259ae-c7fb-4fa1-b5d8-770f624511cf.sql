-- Criar clínica para o usuário
INSERT INTO public.clinics (
  id,
  owner_id,
  name,
  description,
  address,
  city,
  state,
  zip_code,
  phone,
  email,
  is_active
) VALUES (
  gen_random_uuid(),
  '868b3f09-1c08-44d9-91ab-3f4fa1088d3c',
  'SORRISO SAUDE',
  'Clínica odontológica especializada em tratamentos completos para toda a família',
  'RUA M15',
  'Goiânia',
  'GO',
  '74000-000',
  '62995347257',
  'mauriciodias06@gmail.com',
  true
);