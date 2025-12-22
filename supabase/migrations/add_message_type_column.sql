-- Adiciona a coluna message_type à tabela chat_messages
ALTER TABLE chat_messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'options', 'booking_step'));

-- Adiciona comentário explicativo
COMMENT ON COLUMN chat_messages.message_type IS 'Tipo da mensagem: text (texto simples), options (mensagem com opções), booking_step (etapa do agendamento)';

-- Atualiza mensagens existentes para ter o tipo 'text' por padrão
UPDATE chat_messages SET message_type = 'text' WHERE message_type IS NULL;