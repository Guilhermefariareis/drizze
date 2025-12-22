-- Verificação simples para o usuário mauricio_dias06@hotmail.com

-- 1. Verificar se o usuário existe
SELECT 'Usuário encontrado' as status, id, email 
FROM auth.users 
WHERE email = 'mauricio_dias06@hotmail.com';

-- 2. Verificar clínicas associadas a este usuário
SELECT 'Clínica encontrada' as status, id, name, email, master_user_id, owner_id
FROM clinics 
WHERE master_user_id = 'e72d40b2-a695-489b-968b-e2479b5889f2' 
   OR owner_id = 'e72d40b2-a695-489b-968b-e2479b5889f2'
   OR email = 'mauricio_dias06@hotmail.com';

-- 3. Verificar todas as clínicas (para debug)
SELECT 'Todas as clínicas' as status, id, name, email, master_user_id, owner_id
FROM clinics 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar solicitações de crédito recentes
SELECT 'Solicitações recentes' as status, id, clinic_id, patient_name, requested_amount, created_at
FROM credit_requests 
ORDER BY created_at DESC
LIMIT 5;