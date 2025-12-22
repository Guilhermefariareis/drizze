-- Configurar relacionamento entre usuário e clínica

-- 1. Verificar as clínicas criadas
SELECT 
    'AVAILABLE CLINICS' as info,
    id,
    name,
    city
FROM clinics 
WHERE name IN (
    'Clínica Odontológica Trindade',
    'Dental Care Goiânia',
    'Sorriso Perfeito Anápolis'
)
ORDER BY name;

-- 2. Para demonstração, vamos associar a primeira clínica a um usuário
-- (Este script deve ser executado quando soubermos o user_id real)
-- UPDATE clinics 
-- SET master_user_id = 'USER_ID_AQUI'
-- WHERE name = 'Clínica Odontológica Trindade';

-- 3. Verificar se há solicitações com clinic_id mock que precisam ser corrigidas
SELECT 
    'MOCK REQUESTS TO FIX' as info,
    COUNT(*) as count
FROM credit_requests 
WHERE clinic_id::text LIKE 'mock-%';

-- 4. Mostrar os IDs das clínicas reais para usar no frontend
SELECT 
    'REAL CLINIC IDS FOR FRONTEND' as info,
    id,
    name,
    city
FROM clinics 
WHERE is_active = true
ORDER BY name;