-- Verificar todas as solicitações de crédito
SELECT 
    cr.id,
    cr.patient_name,
    cr.patient_email,
    cr.clinic_id,
    c.name as clinic_name,
    cr.requested_amount,
    cr.installments,
    cr.status,
    cr.treatment_description,
    cr.created_at
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
ORDER BY cr.created_at DESC;

-- Verificar se há clínicas
SELECT id, name, email FROM clinics LIMIT 5;

-- Verificar se há perfis de usuários
SELECT id, full_name, email FROM profiles LIMIT 5;