-- Migração para corrigir a coluna requested_amount na tabela credit_requests
-- Remove a coluna 'amount' e adiciona 'requested_amount'

-- Primeiro, adicionar a nova coluna requested_amount
ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS requested_amount NUMERIC NOT NULL DEFAULT 0;

-- Copiar dados da coluna amount para requested_amount (se houver dados)
UPDATE credit_requests 
SET requested_amount = amount 
WHERE amount IS NOT NULL;

-- Remover a coluna amount antiga
ALTER TABLE credit_requests 
DROP COLUMN IF EXISTS amount;

-- Adicionar constraint para garantir que requested_amount seja positivo
ALTER TABLE credit_requests 
ADD CONSTRAINT check_requested_amount_positive 
CHECK (requested_amount > 0);

-- Adicionar comentário na coluna
COMMENT ON COLUMN credit_requests.requested_amount IS 'Valor solicitado para o crédito odontológico';

-- Verificar se a coluna treatment_description existe, se não, adicionar
ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS treatment_description TEXT;

-- Comentário na coluna treatment_description
COMMENT ON COLUMN credit_requests.treatment_description IS 'Descrição do tratamento odontológico solicitado';