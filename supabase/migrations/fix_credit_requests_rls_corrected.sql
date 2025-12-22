-- Corrigir políticas RLS para credit_requests (versão corrigida)
-- Permitir que usuários autenticados criem solicitações de crédito

-- Primeiro, remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins can update credit requests" ON credit_requests;

-- Política para permitir inserção de solicitações de crédito
CREATE POLICY "Users can insert their own credit requests" ON credit_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

-- Política para permitir visualização das próprias solicitações
CREATE POLICY "Users can view their own credit requests" ON credit_requests
  FOR SELECT 
  USING (auth