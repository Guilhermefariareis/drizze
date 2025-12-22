-- Criação das tabelas para gerenciar assinaturas do Stripe

-- Tabela para armazenar informações dos clientes do Stripe
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar informações das assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT REFERENCES stripe_customers(stripe_customer_id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    stripe_product_id TEXT NOT NULL,
    plan_id TEXT NOT NULL, -- 'patient', 'clinic', 'clinic_advanced'
    status TEXT NOT NULL, -- 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT REFERENCES stripe_customers(stripe_customer_id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_invoice_id TEXT,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Valor em centavos
    currency TEXT NOT NULL DEFAULT 'brl',
    status TEXT NOT NULL, -- 'succeeded', 'pending', 'failed', 'canceled'
    payment_method_type TEXT, -- 'card', 'boleto', 'pix', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar eventos de webhook do Stripe
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para stripe_customers
CREATE POLICY "Users can view their own stripe customer data" ON stripe_customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stripe customer data" ON stripe_customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stripe customer data" ON stripe_customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas RLS para payment_history
CREATE POLICY "Users can view their own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment history" ON payment_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas RLS para stripe_webhook_events (apenas service role)
CREATE POLICY "Only service role can access webhook events" ON stripe_webhook_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Função para obter assinatura ativa do usuário
CREATE OR REPLACE FUNCTION get_user_active_subscription(user_uuid UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_id TEXT,
    status TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_id,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end
    FROM subscriptions s
    WHERE s.user_id = user_uuid
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem plano ativo
CREATE OR REPLACE FUNCTION user_has_active_plan(user_uuid UUID, required_plan TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    active_subscription RECORD;
BEGIN
    SELECT * INTO active_subscription
    FROM get_user_active_subscription(user_uuid)
    LIMIT 1;
    
    IF active_subscription IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF required_plan IS NOT NULL THEN
        RETURN active_subscription.plan_id = required_plan;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários nas tabelas
COMMENT ON TABLE stripe_customers IS 'Armazena informações dos clientes do Stripe vinculados aos usuários';
COMMENT ON TABLE subscriptions IS 'Armazena informações das assinaturas ativas e históricas';
COMMENT ON TABLE payment_history IS 'Histórico de todos os pagamentos processados';
COMMENT ON TABLE stripe_webhook_events IS 'Log de eventos recebidos via webhook do Stripe';

COMMENT ON FUNCTION get_user_active_subscription(UUID) IS 'Retorna a assinatura ativa do usuário';
COMMENT ON FUNCTION user_has_active_plan(UUID, TEXT) IS 'Verifica se o usuário possui um plano ativo específico';