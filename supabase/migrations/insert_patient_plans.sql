-- Inserir planos para pacientes
INSERT INTO pricing_plans (name, price, period, description, features, is_popular, is_active, display_order, plan_type)
VALUES 
  (
    'Básico',
    29.90,
    'mensal',
    'Ideal para cuidados básicos de saúde dental',
    '["Consultas de rotina", "Limpeza dental", "Orientações preventivas", "Suporte online"]',
    false,
    true,
    1,
    'patient'
  ),
  (
    'Premium',
    59.90,
    'mensal',
    'Plano completo com todos os benefícios',
    '["Consultas ilimitadas", "Limpeza dental", "Tratamentos básicos", "Emergências 24h", "Suporte prioritário", "Desconto em procedimentos"]',
    true,
    true,
    2,
    'patient'
  ),
  (
    'Família',
    99.90,
    'mensal',
    'Cobertura completa para toda a família',
    '["Até 4 pessoas", "Consultas ilimitadas", "Tratamentos completos", "Emergências 24h", "Ortodontia básica", "Suporte dedicado"]',
    false,
    true,
    3,
    'patient'
  );

-- Verificar se os dados foram inseridos
SELECT * FROM pricing_plans WHERE plan_type = 'patient' ORDER BY display_order;