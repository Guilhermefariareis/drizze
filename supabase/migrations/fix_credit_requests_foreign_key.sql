-- Corrigir foreign key constraint da tabela credit_requests
-- Primeiro limpar dados órfãos, depois corrigir a constraint

-- Remover a constraint incorreta
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_patient_id_fkey;

-- Limpar registros órfãos (patient_id que não existem em profiles)
DELETE FROM credit_requests 
WHERE patient_id IS NOT NULL 
AND patient_id NOT IN (SELECT id FROM profiles);

-- Limpar registros órfãos (clinic_id que não existem em clinics)
DELETE FROM credit_requests 
WHERE clinic_id IS NOT NULL 
AND clinic_id NOT IN (SELECT id FROM clinics);

-- Adicionar a constraint correta
ALTER TABLE credit_requests 
ADD CONSTRAINT credit_requests_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verificar se a constraint da clínica precisa ser recriada
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_clinic_id_fkey;
ALTER TABLE credit_requests 
ADD CONSTRAINT credit_requests_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;