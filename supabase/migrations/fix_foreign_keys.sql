-- Verificar e corrigir chaves estrangeiras da tabela credit_requests

-- 1. Verificar constraints existentes
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'credit_requests';

-- 3. Remover constraints de chave estrangeira existentes
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_clinic_id_fkey;
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_patient_id_fkey;

-- 4. Verificar se as tabelas auth.users e profiles existem
SELECT 'auth.users' as table_name, count(*) as record_count FROM auth.users
UNION ALL
SELECT 'profiles' as table_name, count(*) as record_count FROM profiles;

-- 5. Como estamos usando profiles, vamos recriar as constraints apontando para profiles
-- Mas primeiro, vamos verificar se todos os IDs existem
SELECT 
    'clinic_ids_not_in_profiles' as check_type,
    count(*) as count
FROM credit_requests cr
LEFT JOIN profiles p ON cr.clinic_id = p.id
WHERE p.id IS NULL AND cr.clinic_id IS NOT NULL

UNION ALL

SELECT 
    'patient_ids_not_in_profiles' as check_type,
    count(*) as count
FROM credit_requests cr
LEFT JOIN profiles p ON cr.patient_id = p.id
WHERE p.id IS NULL AND cr.patient_id IS NOT NULL;

-- 6. Adicionar as constraints corretas (referenciando profiles)
ALTER TABLE credit_requests 
ADD CONSTRAINT credit_requests_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE credit_requests 
ADD CONSTRAINT credit_requests_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 7. Verificar as constraints após a alteração
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'credit_requests';