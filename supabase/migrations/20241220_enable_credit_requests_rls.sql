-- Habilitar RLS na tabela credit_requests
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- Política para usuários de clínicas visualizarem suas solicitações
CREATE POLICY "clinic_users_can_view_their_credit_requests" ON credit_requests
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_professionals 
      WHERE user_id = auth.uid()
    )
    OR
    clinic_id IN (
      SELECT id 
      FROM clinics 
      WHERE owner_id = auth.uid() OR master_user_id = auth.uid()
    )
  );

-- Política para usuários autenticados criarem solicitações
CREATE POLICY "authenticated_users_can_create_credit_requests" ON credit_requests
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários de clínicas atualizarem suas solicitações
CREATE POLICY "clinic_users_can_update_their_credit_requests" ON credit_requests
  FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_professionals 
      WHERE user_id = auth.uid()
    )
    OR
    clinic_id IN (
      SELECT id 
      FROM clinics 
      WHERE owner_id = auth.uid() OR master_user_id = auth.uid()
    )
  );

-- Conceder permissões básicas aos roles
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;