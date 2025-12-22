-- Verificar se a solicitação foi criada
SELECT 
    cr.id,
    cr.patient_name,
    cr.patient_email,
    cr.clinic_id,
    c.name as clinic_name,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.patient_name = 'Paciente Teste Fluxo'
ORDER BY cr.created_at DESC;

-- Verificar todas as solicitações para a clínica
SELECT 
    cr.id,
    cr.patient_name,
    cr.requested_amount,
    cr.status,
    cr.created_at
FROM credit_requests cr
WHERE cr.clinic_id = (SELECT id FROM clinics LIMIT 1)
ORDER BY cr.created_at DESC;