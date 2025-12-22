-- Adicionar coluna installments na tabela credit_requests
ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN credit_requests.installments IS 'Número de parcelas para pagamento do crédito solicitado';

-- Verificar se a constraint já existe antes de criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_installments_positive' 
        AND table_name = 'credit_requests'
    ) THEN
        ALTER TABLE credit_requests 
        ADD CONSTRAINT check_installments_positive 
        CHECK (installments > 0 AND installments <= 60);
    END IF;
END $$;

-- Atualizar registros existentes que possam ter installments NULL
UPDATE credit_requests 
SET installments = 1 
WHERE installments IS NULL;