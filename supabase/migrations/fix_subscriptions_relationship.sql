-- Adicionar coluna plan_id na tabela subscriptions se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES subscription_plans(id);

-- Verificar se já existem planos, se não inserir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Básico') THEN
        INSERT INTO subscription_plans (name, description, price_monthly, price_annual, is_popular, is_active, display_order) VALUES
        ('Básico', 'Plano básico para clínicas pequenas', 99.90, 999.00, false, true, 1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Profissional') THEN
        INSERT INTO subscription_plans (name, description, price_monthly, price_annual, is_popular, is_active, display_order) VALUES
        ('Profissional', 'Plano para clínicas médias', 199.90, 1999.00, true, true, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Empresarial') THEN
        INSERT INTO subscription_plans (name, description, price_monthly, price_annual, is_popular, is_active, display_order) VALUES
        ('Empresarial', 'Plano para clínicas grandes', 399.90, 3999.00, false, true, 3);
    END IF;
END $$;

-- Habilitar RLS se não estiver habilitado
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "subscription_plans_select" ON subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_insert" ON subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_update" ON subscription_plans;

-- Criar políticas RLS para subscription_plans
CREATE POLICY "subscription_plans_select" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "subscription_plans_insert" ON subscription_plans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "subscription_plans_update" ON subscription_plans
    FOR UPDATE USING (true);

-- Conceder permissões
GRANT ALL PRIVILEGES ON subscription_plans TO authenticated;
GRANT SELECT ON subscription_plans TO anon;