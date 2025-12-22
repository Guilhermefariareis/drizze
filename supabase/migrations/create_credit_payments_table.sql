-- Criar tabela para armazenar informações de pagamentos de crédito
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_request_id UUID NOT NULL REFERENCES credit_requests(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  installments INTEGER NOT NULL DEFAULT 1,
  installment_amount DECIMAL(10,2),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('single', 'installment')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method_id TEXT,
  customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_request_id ON credit_payments(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_stripe_payment_intent_id ON credit_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_stripe_subscription_id ON credit_payments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_status ON credit_payments(status);
CREATE INDEX IF NOT EXISTS idx_credit_payments_created_at ON credit_payments(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- Política para pacientes verem apenas seus próprios pagamentos
CREATE POLICY "Patients can view their own payments" ON credit_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM credit_requests cr
      WHERE cr.id = credit_payments.credit_request_id
      AND cr.patient_id = auth.uid()
    )
  );

-- Política para clínicas verem pagamentos de suas solicitações
CREATE POLICY "Clinics can view payments for their requests" ON credit_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.clinic_id = credit_requests.clinic_id
      AND cu.user_id = auth.uid()
    )
  );

-- Política para administradores verem todos os pagamentos
CREATE POLICY "Admins can view all payments" ON credit_payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Política para sistema inserir/atualizar pagamentos
CREATE POLICY "System can manage payments" ON credit_payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_credit_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_credit_payments_updated_at_trigger
  BEFORE UPDATE ON credit_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_payments_updated_at();

-- Comentários para documentação
COMMENT ON TABLE credit_payments IS 'Tabela para armazenar informações de pagamentos de solicitações de crédito';
COMMENT ON COLUMN credit_payments.credit_request_id IS 'ID da solicitação de crédito relacionada';
COMMENT ON COLUMN credit_payments.stripe_payment_intent_id IS 'ID do Payment Intent do Stripe para pagamentos únicos';
COMMENT ON COLUMN credit_payments.stripe_subscription_id IS 'ID da Subscription do Stripe para pagamentos parcelados';
COMMENT ON COLUMN credit_payments.amount IS 'Valor total do pagamento';
COMMENT ON COLUMN credit_payments.installments IS 'Número de parcelas';
COMMENT ON COLUMN credit_payments.installment_amount IS 'Valor de cada parcela';
COMMENT ON COLUMN credit_payments.payment_type IS 'Tipo de pagamento: single (à vista) ou installment (parcelado)';
COMMENT ON COLUMN credit_payments.status IS 'Status do pagamento: pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN credit_payments.payment_method_id IS 'ID do método de pagamento salvo no Stripe';
COMMENT ON COLUMN credit_payments.customer_id IS 'ID do cliente no Stripe';