-- Verificar estrutura da tabela clinics
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clinics'
ORDER BY ordinal_position;

-- Verificar se a coluna state existe especificamente
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'clinics' 
  AND column_name = 'state'
) as state_column_exists;

-- Verificar algumas clínicas para ver os dados
SELECT id, name, city, address, latitude, longitude, active
FROM public.clinics 
LIMIT 5;