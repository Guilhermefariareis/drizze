-- Corrigir políticas RLS para credit_offers
-- Permitir que clínicas vejam ofertas das suas solicitações

-- Primeiro, remover políticas existentes se houver
DROP POLICY IF EXISTS "Clínicas podem ver ofertas das suas solicitações" ON credit_offers;
DROP POLICY IF EXISTS "Admins podem ver todas as ofertas" ON credit_offers;
DROP POLICY IF EXISTS "Admins podem criar ofertas" ON credit_offers;
DROP POLICY IF EXISTS "Admins podem atualizar ofertas" ON credit_offers;

-- Política para clínicas verem ofertas das suas solicitações
CREATE POLICY "Clínicas podem ver ofertas das suas solicitações" ON credit_offers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM credit_requests cr
    INNER JOIN clinics c ON cr.clinic_id = c.id
    WHERE cr.id = credit_offers.credit_request_id
    AND (c.master_user_id = auth.uid() OR c.owner_id = auth.uid())
  )
);

-- Política para admins verem todas as ofertas
CREATE POLICY "Admins podem ver todas as ofertas" ON credit_offers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Política para admins criarem ofertas
CREATE POLICY "Admins podem criar ofertas" ON credit_offers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Política para admins atualizarem ofertas
CREATE POLICY "Admins podem atualizar ofertas" ON credit_offers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Garantir que RLS está habilitado
ALTER TABLE credit_offers ENABLE ROW LEVEL SECURITY;