-- Adicionar coluna session_id para suporte a sessões anônimas
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;