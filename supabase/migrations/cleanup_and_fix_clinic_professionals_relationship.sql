-- Migração para limpar dados órfãos e corrigir relacionamento entre clinic_professionals e profiles

-- Primeiro, vamos identificar e remover registros órfãos em clinic_professionals
-- que não têm um perfil correspondente
DELETE FROM clinic_professionals 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Verificar quantos registros foram removidos
SELECT 'Registros órfãos removidos de clinic_professionals' as status;

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

-- Verificar a integridade dos dados após a limpeza
SELECT 
  cp.id,
  cp.user_id,
  p.full_name,
  p.email
FROM clinic_professionals cp
JOIN profiles p ON cp.user_id = p.id
LIMIT 5;