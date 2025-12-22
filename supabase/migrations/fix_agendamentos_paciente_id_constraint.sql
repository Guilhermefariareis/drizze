-- Migração para corrigir a foreign key constraint do paciente_id
-- Alterando de auth.users para profiles

-- Remover a constraint existente
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_paciente_id_fkey;

-- Adicionar nova constraint referenciando profiles
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_paciente_id_fkey 
FOREIGN KEY (paciente_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verificar se a constraint foi criada corretamente
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE 
  tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'agendamentos'
  AND kcu.column_name = 'paciente_id';