-- Remover constraints de chave estrangeira da tabela credit_requests

-- Remover constraint da clinic_id
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_clinic_id_fkey;

-- Remover constraint da patient_id  
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_patient_id_fkey;

-- Verificar se as constraints foram removidas
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