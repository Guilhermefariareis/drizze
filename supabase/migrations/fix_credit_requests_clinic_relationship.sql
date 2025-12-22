-- Primeiro, limpar dados inconsistentes
-- Remover registros de credit_requests que referenciam clinics inexistentes
DELETE FROM credit_requests 
WHERE clinic_id IS NOT NULL 
AND clinic_id NOT IN (SELECT id FROM clinics);

-- Remover registros de credit_requests que referenciam usuários inexistentes
DELETE FROM credit_requests 
WHERE patient_id IS NOT NULL 
AND patient_id NOT IN (SELECT id FROM auth.users);

-- Adicionar foreign key constraint entre credit_requests e clinics
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'credit_requests_clinic_id_fkey' 
        AND table_name = 'credit_requests'
    ) THEN
        ALTER TABLE credit_requests 
        ADD CONSTRAINT credit_requests_clinic_id_fkey 
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar foreign key constraint entre credit_requests e auth.users para patient_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'credit_requests_patient_id_fkey' 
        AND table_name = 'credit_requests'
    ) THEN
        ALTER TABLE credit_requests 
        ADD CONSTRAINT credit_requests_patient_id_fkey 
        FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e corrigir permissões para credit_requests
GRANT ALL PRIVILEGES ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

-- Verificar e corrigir permissões para clinics
GRANT ALL PRIVILEGES ON clinics TO authenticated;
GRANT SELECT ON clinics TO anon;