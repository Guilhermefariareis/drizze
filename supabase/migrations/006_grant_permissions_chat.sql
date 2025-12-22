-- Conceder permissões para as tabelas do chat

-- Habilitar RLS (Row Level Security) nas tabelas do chat
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_booking_sessions ENABLE ROW LEVEL SECURITY;

-- Conceder permissões básicas para o role anon
GRANT SELECT, INSERT, UPDATE ON chat_conversations TO anon;
GRANT SELECT, INSERT ON chat_messages TO anon;
GRANT SELECT, INSERT, UPDATE ON chat_booking_sessions TO anon;

-- Conceder permissões completas para o role authenticated
GRANT ALL PRIVILEGES ON chat_conversations TO authenticated;
GRANT ALL PRIVILEGES ON chat_messages TO authenticated;
GRANT ALL PRIVILEGES ON chat_booking_sessions TO authenticated;

-- Políticas RLS para chat_conversations
CREATE POLICY "Usuários podem ver suas próprias conversas" ON chat_conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Permite conversas anônimas
    );

CREATE POLICY "Usuários podem criar conversas" ON chat_conversations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL -- Permite conversas anônimas
    );

CREATE POLICY "Usuários podem atualizar suas próprias conversas" ON chat_conversations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Permite conversas anônimas
    );

-- Políticas RLS para chat_messages
CREATE POLICY "Usuários podem ver mensagens de suas conversas" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE id = chat_messages.conversation_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

CREATE POLICY "Usuários podem criar mensagens em suas conversas" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE id = chat_messages.conversation_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

-- Políticas RLS para chat_booking_sessions
CREATE POLICY "Usuários podem ver suas próprias sessões de agendamento" ON chat_booking_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE id = chat_booking_sessions.conversation_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

CREATE POLICY "Usuários podem criar sessões de agendamento" ON chat_booking_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE id = chat_booking_sessions.conversation_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

CREATE POLICY "Usuários podem atualizar suas próprias sessões" ON chat_booking_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE id = chat_booking_sessions.conversation_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

-- Comentários para documentação
COMMENT ON POLICY "Usuários podem ver suas próprias conversas" ON chat_conversations IS 'Permite que usuários vejam apenas suas próprias conversas, incluindo conversas anônimas';
COMMENT ON POLICY "Usuários podem ver mensagens de suas conversas" ON chat_messages IS 'Permite que usuários vejam apenas mensagens de suas próprias conversas';
COMMENT ON POLICY "Usuários podem ver suas próprias sessões de agendamento" ON chat_booking_sessions IS 'Permite que usuários vejam apenas suas próprias sessões de agendamento via chat';