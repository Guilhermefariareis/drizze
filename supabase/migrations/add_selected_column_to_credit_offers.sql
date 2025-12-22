-- Adicionar coluna selected à tabela credit_offers
-- Esta coluna indica se uma oferta foi selecionada pela clínica

ALTER TABLE credit_offers 
ADD COLUMN selected BOOLEAN DEFAULT FALSE;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_credit_offers_selected ON credit_offers(selected);

-- Adicionar comentário para documentação
COMMENT ON COLUMN credit_offers.selected IS 'Indica se esta oferta foi selecionada pela clínica';

-- Garantir que apenas uma oferta por solicitação pode ser selecionada
-- (Esta constraint será aplicada via lógica da aplicação)