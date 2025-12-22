-- Criação das tabelas para o sistema de chat com agendamento integrado

-- Tabela para conversas do chat
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    current_step TEXT DEFAULT 'greeting' CHECK (current_step IN (
        'greeting', 'clinic_selection', 'service_selection', 
        'date_selection', 'time_selection', 'patient_info', 
        'confirmation', 'completed'
    )),
    selected_clinic_id UUID REFERENCES clinics(id),
    selected_service_id UUID REFERENCES servicos(id),
    selected_date DATE,
    selected_time TIME,
    patient_name TEXT,
    patient_phone TEXT,
    patient_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões de agendamento via chat
CREATE TABLE IF NOT EXISTS chat_booking_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    booking_data JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_booking_sessions_conversation_id ON chat_booking_sessions(conversation_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE chat_conversations IS 'Armazena as conversas do chat com informações do agendamento em progresso';
COMMENT ON TABLE chat_messages IS 'Armazena todas as mensagens trocadas no chat';
COMMENT ON TABLE chat_booking_sessions IS 'Armazena as sessões de agendamento via chat e sua relação com agendamentos finalizados';

COMMENT ON COLUMN chat_conversations.current_step IS 'Etapa atual do fluxo de agendamento';
COMMENT ON COLUMN chat_conversations.session_id IS 'ID único da sessão para identificar conversas anônimas';
COMMENT ON COLUMN chat_messages.metadata IS 'Dados adicionais da mensagem (botões, opções, etc.)';
COMMENT ON COLUMN chat_booking_sessions.booking_data IS 'Dados temporários do agendamento durante o processo';