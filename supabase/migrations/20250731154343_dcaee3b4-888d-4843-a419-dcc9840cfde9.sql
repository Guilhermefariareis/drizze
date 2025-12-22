-- Desativar clínicas antigas para mostrar apenas as novas
UPDATE public.clinics 
SET is_active = false 
WHERE id NOT IN (
  '20aa8fa7-f9e5-4eab-884a-e5af12bb08d3',
  '8a634302-f0df-45be-ae23-ecfdddf4a3dd', 
  '514a12ba-ff28-4b5b-9e7a-fe84775aa7bc'
);

-- Adicionar configuração do simulador de empréstimo que está faltando
INSERT INTO public.site_configurations (
  config_key,
  config_value,
  description
) VALUES (
  'loan_simulator_config',
  '{
    "min_amount": 500,
    "max_amount": 50000,
    "min_installments": 3,
    "max_installments": 24,
    "interest_rate": 2.5,
    "description": "Simule seu financiamento e descubra as melhores condições para seu tratamento odontológico."
  }',
  'Configurações do simulador de empréstimo'
) ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();