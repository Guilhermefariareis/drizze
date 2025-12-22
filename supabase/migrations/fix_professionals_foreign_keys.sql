-- Migração para corrigir referências de chave estrangeira
-- Alterando de 'professionals' para 'clinic_professionals'

-- Corrigir tabela agendamentos
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_fkey;
ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_profissional_id_fkey 
  FOREIGN KEY (profissional_id) REFERENCES clinic_professionals(id) ON DELETE SET NULL;

-- Corrigir tabela horarios_bloqueados
ALTER TABLE horarios_bloqueados DROP CONSTRAINT IF EXISTS horarios_bloqueados_profissional_id_fkey;
ALTER TABLE horarios_bloqueados ADD CONSTRAINT horarios_bloqueados_profissional_id_fkey 
  FOREIGN KEY (profissional_id) REFERENCES clinic_professionals(id) ON DELETE CASCADE;

-- Verificar se as constraints foram criadas corretamente
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
  AND tc.table_name IN ('agendamentos', 'horarios_bloqueados')
  AND kcu.column_name = 'profissional_id';