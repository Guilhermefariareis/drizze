-- Conceder permissões para resolver o erro de fetch

-- 1. Conceder permissões para credit_requests
GRANT SELECT ON credit_requests TO anon;
GRANT SELECT ON credit_requests TO authenticated;
GRANT INSERT ON credit_requests TO authenticated;
GRANT UPDATE ON credit_requests TO authenticated;

-- 2. Conceder permissões para clinics
GRANT SELECT ON clinics TO anon;
GRANT SELECT ON clinics TO authenticated;

-- 3. Conceder permissões para profiles (caso necessário)
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- 4. Verificar permissões concedidas
SELECT 
    'PERMISSÕES CONCEDIDAS:' as status,
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('credit_requests', 'clinics', 'profiles')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 5. Criar uma solicitação de teste para verificar se funciona
INSERT INTO credit_requests (
    patient_id,
    clinic_id,
    requested_amount,
    treatment_description,
    installments,
    status
)
SELECT 
    'e72d40b2-a695-489b-968b-e2479b5889f2',
    c.id,
    1500.00,
    'Teste de solicitação após correção do perfil',
    12,
    'pending'
FROM clinics c
WHERE c.email = 'edeventosproducoes@gmail.com'
LIMIT 1;

-- 6. Verificar se a solicitação foi criada
SELECT 
    'SOLICITAÇÃO CRIADA:' as status,
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status,
    c.name as clinic_name
FROM credit_requests cr
INNER JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.patient_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
ORDER BY cr.created_at DESC
LIMIT 1;