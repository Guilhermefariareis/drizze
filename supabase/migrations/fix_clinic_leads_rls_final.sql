-- Remove políticas RLS problemáticas e permite acesso direto à tabela clinic_leads
-- Esta migração resolve o problema de permissão que impede o admin de acessar os dados

-- Remove todas as políticas RLS existentes da tabela clinic_leads
DROP POLICY IF EXISTS "clinic_leads_select_policy" ON clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_insert_policy" ON clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_update_policy" ON clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_delete_policy" ON clinic_leads;
DROP POLICY IF EXISTS "Admin can view all clinic leads" ON clinic_leads;
DROP POLICY IF EXISTS "Admin can update clinic leads" ON clinic_leads;

-- Desabilita RLS temporariamente para permitir acesso direto
ALTER TABLE clinic_leads DISABLE ROW LEVEL SECURITY;

-- Garante que as roles anon e authenticated tenham acesso total
GRANT ALL PRIVILEGES ON clinic_leads TO anon;
GRANT ALL PRIVILEGES ON clinic_leads TO authenticated;
GRANT ALL PRIVILEGES ON clinic_leads TO service_role;

-- Garante acesso à sequência do ID
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Comentário explicativo
COMMENT ON TABLE clinic_leads IS 'Tabela de leads de clínicas - RLS desabilitado para permitir acesso admin