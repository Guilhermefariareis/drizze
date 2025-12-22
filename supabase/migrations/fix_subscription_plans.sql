-- Criar tabela subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly', -- monthly, yearly
    features JSONB,
    max_appointments INTEGER,
    max_professionals INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna plan_id na tabela subscriptions se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES subscription_plans(id);

-- Inserir planos básicos
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, max_appointments, max_professionals) VALUES
('Básico', 'Plano básico para clínicas pequenas', 99.90, 'monthly', '{"features": ["Agendamento básico", "Até 100 consultas/mês"]}', 100, 3),
('Profissional', 'Plano para clínicas médias', 199.90, 'monthly', '{"features": ["Agendamento avançado", "Até 500 consultas/mês", "Relatórios"]}', 500, 10),
('Empresarial', 'Plano para clínicas grandes', 399.90, 'monthly', '{"features": ["Agendamento completo", "Consultas ilimitadas", "Relatórios avançados", "API"]}', -1, -1)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscription_plans
CREATE POLICY "subscription_plans_select" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "subscription_plans_insert" ON subscription_plans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "subscription_plans_update" ON subscription_plans
    FOR UPDATE USING (true);

-- Conceder permissões
GRANT ALL PRIVILEGES ON subscription_plans TO authenticated;
GRANT SELECT ON subscription_plans TO anon;