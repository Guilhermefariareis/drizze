-- Debug: Verificar dados na tabela credit_requests
SELECT 'Total de solicitações de crédito:' as info, COUNT(*) as total FROM credit_requests;

-- Mostrar todas as solicitações com detalhes
SELECT 
  cr.id,
  cr.patient_id,
  cr.clinic_id,
  cr.requested_amount,
  cr.installments,
  cr.status,
  cr.treatment_description,
  cr.created_at,
  p.full_name as patient_name,
  p.email as patient_email,
  p.phone as patient_phone
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.user_id
ORDER BY cr.created_at DESC;

-- Verificar se há clínicas na tabela
SELECT 'Total de clínicas:' as info, COUNT(*) as total FROM clinics;

-- Verificar se há perfis de usuários
SELECT 'Total de perfis:' as info, COUNT(*) as total FROM profiles;