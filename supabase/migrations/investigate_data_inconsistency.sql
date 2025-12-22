-- INVESTIGAÇÃO CRÍTICA: Inconsistências entre painéis do paciente e clínica
-- Problema: Dados diferentes aparecem nos dois painéis

-- 1. VERIFICAR TODAS AS SOLICITAÇÕES COM DETALHES COMPLETOS
SELECT 
    'TODAS AS SOLICITAÇÕES' as status,
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    -- Dados do paciente
    p.email as patient_email,
    p.full_name as patient_name,
    -- Dados da clínica
    c.name as clinic_name,
    c.email as clinic_email,
    c.master_user_id,
    c.owner_id
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
LEFT JOIN clinics c ON c.id = cr.clinic_id
ORDER BY cr.created_at DESC;

-- 2. VERIFICAR SOLICITAÇÕES POR VALOR (baseado nos dados fornecidos)
SELECT 
    'ANÁLISE POR VALOR' as status,
    cr.requested_amount,
    COUNT(*) as quantidade,
    STRING_AGG(cr.clinic_id::text, ', ') as clinic_ids,
    STRING_AGG(c.name, ', ') as clinic_names
FROM credit_requests cr
LEFT JOIN clinics c ON c.id = cr.clinic_id
WHERE cr.requested_amount IN (10500, 12450, 5800, 7777.77, 2500)
GROUP BY cr.requested_amount
ORDER BY cr.requested_amount DESC;

-- 3. VERIFICAR SOLICITAÇÕES DO PACIENTE mauricio_dias06@hotmail.com
SELECT 
    'SOLICITAÇÕES DO MAURÍCIO' as status,
    cr.id,
    cr.requested_amount,
    cr.clinic_id,
    c.name as clinic_name,
    cr.status,
    cr.created_at
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
LEFT JOIN clinics c ON c.id = cr.clinic_id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;

-- 4. VERIFICAR CLÍNICAS ENVOLVIDAS
SELECT 
    'CLÍNICAS ENVOLVIDAS' as status,
    c.id,
    c.name,
    c.email,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_solicitacoes
FROM clinics c
LEFT JOIN credit_requests cr ON cr.clinic_id = c.id
GROUP BY c.id, c.name, c.email, c.master_user_id, c.owner_id
HAVING COUNT(cr.id) > 0
ORDER BY total_solicitacoes DESC;

-- 5. VERIFICAR SOLICITAÇÕES SEM CLÍNICA ASSOCIADA
SELECT 
    'SOLICITAÇÕES ÓRFÃS' as status,
    cr.id,
    cr.requested_amount,
    cr.clinic_id,
    cr.patient_id,
    p.email as patient_email,
    cr.created_at
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
WHERE cr.clinic_id IS NULL OR cr.clinic_id NOT IN (SELECT id FROM clinics)
ORDER BY cr.created_at DESC;

-- 6. VERIFICAR USUÁRIOS ENVOLVIDOS
SELECT 
    'USUÁRIOS ENVOLVIDOS' as status,
    p.id,
    p.email,
    p.full_name,
    p.role,
    COUNT(cr.id) as total_solicitacoes
FROM profiles p
LEFT JOIN credit_requests cr ON cr.patient_id = p.user_id
WHERE p.role = 'patient'
GROUP BY p.id, p.email, p.full_name, p.role
HAVING COUNT(cr.id) > 0
ORDER BY total_solicitacoes DESC;
-- Problema: Dados diferentes aparecem nos dois painéis

-- 1. VERIFICAR TODAS AS SOLICITAÇÕES COM DETALHES COMPLETOS
SELECT 
    'TODAS AS SOLICITAÇÕES' as status,
    cr.id,
    cr.patient_id,
    cr.clinic_id,
    cr.requested_amount,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    -- Dados do paciente
    p.email as patient_email,
    p.full_name as patient_name,
    -- Dados da clínica
    c.name as clinic_name,
    c.email as clinic_email,
    c.master_user_id,
    c.owner_id
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
LEFT JOIN clinics c ON c.id = cr.clinic_id
ORDER BY cr.created_at DESC;

-- 2. VERIFICAR SOLICITAÇÕES POR VALOR (baseado nos dados fornecidos)
SELECT 
    'ANÁLISE POR VALOR' as status,
    cr.requested_amount,
    COUNT(*) as quantidade,
    STRING_AGG(cr.clinic_id::text, ', ') as clinic_ids,
    STRING_AGG(c.name, ', ') as clinic_names
FROM credit_requests cr
LEFT JOIN clinics c ON c.id = cr.clinic_id
WHERE cr.requested_amount IN (10500, 12450, 5800, 7777.77, 2500)
GROUP BY cr.requested_amount
ORDER BY cr.requested_amount DESC;

-- 3. VERIFICAR SOLICITAÇÕES DO PACIENTE mauricio_dias06@hotmail.com
SELECT 
    'SOLICITAÇÕES DO MAURÍCIO' as status,
    cr.id,
    cr.requested_amount,
    cr.clinic_id,
    c.name as clinic_name,
    cr.status,
    cr.created_at
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
LEFT JOIN clinics c ON c.id = cr.clinic_id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;

-- 4. VERIFICAR CLÍNICAS ENVOLVIDAS
SELECT 
    'CLÍNICAS ENVOLVIDAS' as status,
    c.id,
    c.name,
    c.email,
    c.master_user_id,
    c.owner_id,
    COUNT(cr.id) as total_solicitacoes
FROM clinics c
LEFT JOIN credit_requests cr ON cr.clinic_id = c.id
GROUP BY c.id, c.name, c.email, c.master_user_id, c.owner_id
HAVING COUNT(cr.id) > 0
ORDER BY total_solicitacoes DESC;

-- 5. VERIFICAR SOLICITAÇÕES SEM CLÍNICA ASSOCIADA
SELECT 
    'SOLICITAÇÕES ÓRFÃS' as status,
    cr.id,
    cr.requested_amount,
    cr.clinic_id,
    cr.patient_id,
    p.email as patient_email,
    cr.created_at
FROM credit_requests cr
LEFT JOIN profiles p ON p.user_id = cr.patient_id
WHERE cr.clinic_id IS NULL OR cr.clinic_id NOT IN (SELECT id FROM clinics)
ORDER BY cr.created_at DESC;

-- 6. VERIFICAR USUÁRIOS ENVOLVIDOS
SELECT 
    'USUÁRIOS ENVOLVIDOS' as status,
    p.id,
    p.email,
    p.full_name,
    p.role,
    COUNT(cr.id) as total_solicitacoes
FROM profiles p
LEFT JOIN credit_requests cr ON cr.patient_id = p.user_id
WHERE p.role = 'patient'
GROUP BY p.id, p.email, p.full_name, p.role
HAVING COUNT(cr.id) > 0
ORDER BY total_solicitacoes DESC;