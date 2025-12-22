-- Garantir permissões corretas para clinic_profiles
GRANT SELECT, INSERT, UPDATE ON clinic_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON clinic_profiles TO authenticated;

-- Verificar se há registros em clinic_profiles
SELECT COUNT(*) as total_profiles FROM clinic_profiles;

-- Criar registros de perfil para clínicas que não têm
INSERT INTO clinic_profiles (clinic_id, logo_url, cover_image_url)
SELECT 
  c.id as clinic_id,
  c.logo_url,
  c.hero_image_url as cover_image_url
FROM clinics c
LEFT JOIN clinic_profiles cp ON c.id = cp.clinic_id
WHERE cp.clinic_id IS NULL;

-- Verificar dados após inserção
SELECT 
  c.name,
  cp.logo_url,
  cp.cover_image_url
FROM clinics c
LEFT JOIN clinic_profiles cp ON c.id = cp.clinic_id
LIMIT 5;