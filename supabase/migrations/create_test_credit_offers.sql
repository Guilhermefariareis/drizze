-- Inserir ofertas de crédito de teste para as solicitações existentes
-- Este arquivo cria ofertas bancárias para testar a exibição no dashboard da clínica

-- Primeiro, verificar se existem solicitações de crédito
DO $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO request_count FROM credit_requests;
    RAISE NOTICE 'Total de solicitações encontradas: %', request_count;
END $$;

-- Inserir ofertas para as solicitações existentes
INSERT INTO credit_offers (
    credit_request_id,
    bank_name,
    approved_amount,
    interest_rate,
    installments,
    conditions,
    monthly_payment,
    total_amount,
    created_at
)
SELECT 
    cr.id as credit_request_id,
    'Banco do Brasil' as bank_name,
    cr.requested_amount * 0.9 as approved_amount, -- 90% do valor solicitado
    2.5 as interest_rate,
    cr.installments,
    'Aprovação sujeita à análise de crédito. Taxa promocional válida por 30 dias.' as conditions,
    ROUND((cr.requested_amount * 0.9 * POWER(1 + 0.025/12, cr.installments) * (0.025/12)) / (POWER(1 + 0.025/12, cr.installments) - 1), 2) as monthly_payment,
    ROUND(cr.requested_amount * 0.9 * 1.025, 2) as total_amount,
    NOW() - INTERVAL '1 hour'
FROM credit_requests cr
WHERE NOT EXISTS (
    SELECT 1 FROM credit_offers co 
    WHERE co.credit_request_id = cr.id 
    AND co.bank_name = 'Banco do Brasil'
)
LIMIT 10;

-- Inserir segunda oferta para cada solicitação
INSERT INTO credit_offers (
    credit_request_id,
    bank_name,
    approved_amount,
    interest_rate,
    installments,
    conditions,
    monthly_payment,
    total_amount,
    created_at
)
SELECT 
    cr.id as credit_request_id,
    'Itaú' as bank_name,
    cr.requested_amount * 0.85 as approved_amount, -- 85% do valor solicitado
    3.2 as interest_rate,
    cr.installments,
    'Oferta especial para clientes odontológicos. Sem taxa de adesão.' as conditions,
    ROUND((cr.requested_amount * 0.85 * POWER(1 + 0.032/12, cr.installments) * (0.032/12)) / (POWER(1 + 0.032/12, cr.installments) - 1), 2) as monthly_payment,
    ROUND(cr.requested_amount * 0.85 * 1.032, 2) as total_amount,
    NOW() - INTERVAL '30 minutes'
FROM credit_requests cr
WHERE NOT EXISTS (
    SELECT 1 FROM credit_offers co 
    WHERE co.credit_request_id = cr.id 
    AND co.bank_name = 'Itaú'
)
LIMIT 10;

-- Inserir terceira oferta para algumas solicitações
INSERT INTO credit_offers (
    credit_request_id,
    bank_name,
    approved_amount,
    interest_rate,
    installments,
    conditions,
    monthly_payment,
    total_amount,
    created_at
)
SELECT 
    cr.id as credit_request_id,
    'Santander' as bank_name,
    cr.requested_amount as approved_amount, -- 100% do valor solicitado
    2.8 as interest_rate,
    cr.installments,
    'Melhor oferta do mercado! Aprovação em até 24h.' as conditions,
    ROUND((cr.requested_amount * POWER(1 + 0.028/12, cr.installments) * (0.028/12)) / (POWER(1 + 0.028/12, cr.installments) - 1), 2) as monthly_payment,
    ROUND(cr.requested_amount * 1.028, 2) as total_amount,
    NOW() - INTERVAL '15 minutes'
FROM credit_requests cr
WHERE cr.requested_amount >= 3000 -- Apenas para valores maiores
AND NOT EXISTS (
    SELECT 1 FROM credit_offers co 
    WHERE co.credit_request_id = cr.id 
    AND co.bank_name = 'Santander'
)
LIMIT 5;

-- Verificar as ofertas criadas
SELECT 
    'OFERTAS CRIADAS:' as info,
    co.id,
    co.credit_request_id,
    co.bank_name,
    co.approved_amount,
    co.interest_rate,
    co.installments,
    co.monthly_payment,
    co.total_amount,
    co.created_at,
    cr.requested_amount,
    cr.treatment_description
FROM credit_offers co
JOIN credit_requests cr ON cr.id = co.credit_request_id
ORDER BY co.credit_request_id, co.created_at DESC;

-- Mostrar estatísticas
SELECT 
    'ESTATÍSTICAS:' as info,
    COUNT(*) as total_ofertas,
    COUNT(DISTINCT credit_request_id) as solicitacoes_com_ofertas,
    COUNT(DISTINCT bank_name) as bancos_diferentes
FROM credit_offers;