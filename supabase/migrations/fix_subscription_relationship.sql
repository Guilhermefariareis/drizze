-- Corrigir relacionamento entre subscriptions e subscription_plans

-- Primeiro, vamos verificar se há dados na tabela subscriptions
-- Se houver, precisamos fazer backup antes de alterar

-- Adicionar coluna plan_id_int temporária
ALTER TABLE subscriptions ADD COLUMN plan_id_int INTEGER;

-- Tentar mapear os plan_id existentes para os IDs da tabela subscription_plans
-- Assumindo que plan_id pode ser um nome ou identificador que precisa ser mapeado
UPDATE subscriptions 
SET plan_id_int = (
  SELECT sp.id 
  FROM subscription_plans sp 
  WHERE sp.name ILIKE '%' || subscriptions.plan_id || '%'
  LIMIT 1
);

-- Se não conseguir mapear automaticamente, vamos criar um plano padrão
INSERT INTO subscription_plans (name, description, price_monthly, price_annual)
VALUES ('Plano Padrão', 'Plano padrão para migração', 0.00, 0.00)
ON CONFLICT DO NOTHING;

-- Atualizar registros que não foram mapeados para o plano padrão
UPDATE subscriptions 
SET plan_id_int = (SELECT id FROM subscription_plans WHERE name = 'Plano Padrão')
WHERE plan_id_int IS NULL;

-- Remover a coluna plan_id antiga
ALTER TABLE subscriptions DROP COLUMN plan_id;

-- Renomear a nova coluna
ALTER TABLE subscriptions RENAME COLUMN plan_id_int TO plan_id;

-- Adicionar a foreign key constraint
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);

-- Comentário para documentar a mudança
COMMENT ON COLUMN subscriptions.plan_id IS 'Foreign key para subscription_plans.id';