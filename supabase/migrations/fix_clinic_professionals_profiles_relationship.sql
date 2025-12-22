-- Migração para corrigir o relacionamento entre clinic_professionals e profiles
-- O relacionamento deve ser através de user_id em clinic_professionals -> id em profiles

-- Primeiro, vamos remover a constraint existente se houver
ALTER TABLE clinic_professionals DROP CONSTRAINT IF EXISTS clinic_professionals_user_id_profiles_fkey;

-- Agora vamos adicionar a constraint correta para referenciar profiles
ALTER TABLE clinic_professionals 
ADD CONSTRAINT clinic_professionals_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

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
  AND tc.table_name = 'clinic_professionals'
  AND kcu.column_name = 'user_id';