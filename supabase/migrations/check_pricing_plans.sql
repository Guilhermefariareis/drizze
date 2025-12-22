-- Consulta para verificar todos os planos de preços e seus valores
SELECT 
  id,
  name,
  price,
  plan_type,
  is_active,
  is_popular,
  features
FROM pricing_plans 
WHERE is_active = true
ORDER BY plan_type, price;

-- Verificar especificamente valores que podem estar mal formatados
SELECT 
  id,
  name,
  price,
  plan_type,
  CASE 
    WHEN price::text LIKE '%.9' THEN 'Possível problema de formatação'
    WHEN price::text LIKE '%9.9%' THEN 'Possível problema de formatação'
    ELSE 'Formatação OK'
  END as status_formatacao
FROM pricing_plans 
WHERE is_active = true
  AND (price::text LIKE '%.9' OR price::text LIKE '%9.9%')
ORDER BY price;