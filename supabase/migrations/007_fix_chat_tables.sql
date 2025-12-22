-- Correção das tabelas do chat para resolver incompatibilidades

-- Alterar o campo message_type para sender_type na tabela chat_messages
ALTER TABLE chat_messages 
RENAME COLUMN message_type TO sender_type;

-- Remover a constraint UNIQUE do session_id se existir
ALTER TABLE chat_conversations 
DROP CONSTRAINT IF EXISTS chat_conversations_session_id_key;

-- Remover NOT NULL do session_id
ALTER TABLE chat_conversations 
ALTER COLUMN session_id DROP NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN chat_messages.sender_type IS 'Tipo do remetente da mensagem: user, bot ou system';
COMMENT ON COLUMN chat_conversations.session_id IS 'ID da sessão para identificar conversas (pode ser nulo para usuários autenticados)';