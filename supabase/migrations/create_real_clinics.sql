-- Criar clínicas reais no banco de dados para substituir as clínicas mock

-- Inserir clínicas reais que correspondem às clínicas mock usadas no frontend
INSERT INTO clinics (
    name,
    city,
    address,
    phone,
    is_active,
    is_verified,
    status,
    subscription_plan,
    created_at,
    updated_at
) VALUES 
(
    'Clínica Odontológica Trindade',
    'Trindade',
    '{"street": "Rua Principal, 123", "neighborhood": "Centro", "city": "Trindade", "state": "GO", "zipCode": "75380-000"}'::jsonb,
    '(62) 3506-1234',
    true,
    true,
    'active',
    'basic',
    now(),
    now()
),
(
    'Dental Care Goiânia',
    'Goiânia',
    '{"street": "Av. T-4, 456", "neighborhood": "Setor Bueno", "city": "Goiânia", "state": "GO", "zipCode": "74230-030"}'::jsonb,
    '(62) 3241-5678',
    true,
    true,
    'active',
    'basic',
    now(),
    now()
),
(
    'Sorriso Perfeito Anápolis',
    'Anápolis',
    '{"street": "Rua das Flores, 789", "neighborhood": "Centro", "city": "Anápolis", "state": "GO", "zipCode": "75020-140"}'::jsonb,
    '(62) 3318-9012',
    true,
    true,
    'active',
    'basic',
    now(),
    now()
);

-- Verificar se as clínicas foram criadas
SELECT 
    'CLINICS CREATED' as status,
    id,
    name,
    city,
    is_active
FROM clinics 
WHERE name IN (
    'Clínica Odontológica Trindade',
    'Dental Care Goiânia',
    'Sorriso Perfeito Anápolis'
);