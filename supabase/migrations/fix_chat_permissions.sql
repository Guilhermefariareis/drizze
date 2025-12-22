-- Garantir permissões para as tabelas de chat

-- Permissões para chat_conversations
GRANT ALL ON chat_conversations TO anon;
GRANT ALL ON chat_conversations TO authenticated;

-- Permissões para chat_messages
GRANT ALL ON chat_messages TO anon;
GRANT ALL ON chat_messages TO authenticated;

-- Permissões para chat_booking_sessions
GRANT ALL ON chat_booking_sessions TO anon;
GRANT ALL ON chat_booking_sessions TO authenticated;

-- Políticas RLS para permitir acesso anônimo

-- Política para chat_conversations
DROP POLICY IF EXISTS "Allow anonymous access to chat_conversations" ON chat_conversations;
CREATE POLICY "Allow anonymous access to chat_conversations" ON chat_conversations
  FOR ALL USING (true);

-- Política para chat_messages
DROP POLICY IF EXISTS "Allow anonymous access to chat_messages" ON chat_messages;
CREATE POLICY "Allow anonymous access to chat_messages" ON chat_messages
  FOR ALL USING (true);

-- Política para chat_booking_sessions
DROP POLICY IF EXISTS "Allow anonymous access to chat_booking_sessions" ON chat_booking_sessions;
CREATE POLICY "Allow anonymous access to chat_booking_sessions" ON chat_booking_sessions
  FOR ALL USING (true);