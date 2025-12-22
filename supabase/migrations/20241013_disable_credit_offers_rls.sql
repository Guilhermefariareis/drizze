-- Desabilitar RLS completamente para credit_offers (ATUALIZADO)
-- O admin precisa inserir ofertas sem restrições - SOLUÇÃO DEFINITIVA

-- Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "credit_offers_select_policy" ON credit_offers;
DROP POLICY IF EXISTS "credit_offers_insert_policy" ON credit_offers;
DROP POLICY IF EXISTS "credit_offers_update_policy" ON credit_offers;
DROP POLICY IF EXISTS "credit_offers_delete_policy" ON credit_offers;
DROP POLICY IF EXISTS "Enable read access for all users" ON credit_offers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON credit_offers;
DROP POLICY IF EXISTS "Enable update for users based on email" ON credit_offers;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON credit_offers;

-- DESABILITAR RLS COMPLETAMENTE
ALTER TABLE credit_offers DISABLE ROW LEVEL SECURITY;

-- Garantir que a tabela seja acessível para todos os usuários autenticados
GRANT ALL ON credit_offers TO authenticated;
GRANT ALL ON credit_offers TO service_role;
GRANT ALL ON credit_offers TO anon;