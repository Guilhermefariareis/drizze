-- Migração para Sistema de Chat de Agendamento Melhorado
-- Criação das tabelas: chat_sessions, chat_messages, faq_items

-- Tabela de Sessões de Chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- Políticas RLS para chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
CREATE POLICY "Users can view own sessions" ON chat_sessions 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON chat_sessions;
CREATE POLICY "Users can create own sessions" ON chat_sessions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
CREATE POLICY "Users can update own sessions" ON chat_sessions 
    FOR UPDATE USING (auth.uid() = user_id);

-- Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('user', 'bot', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'buttons', 'quick_reply', 'system')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Políticas RLS para chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages from own sessions" ON chat_messages;
CREATE POLICY "Users can view messages from own sessions" ON chat_messages 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = chat_messages.session_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create messages in own sessions" ON chat_messages;
CREATE POLICY "Users can create messages in own sessions" ON chat_messages 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = chat_messages.session_id AND user_id = auth.uid()
        )
    );

-- Tabela de FAQ
CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    keywords TEXT[], -- Array de palavras-chave para busca
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para faq_items
CREATE INDEX IF NOT EXISTS idx_faq_items_categoria ON faq_items(categoria);
CREATE INDEX IF NOT EXISTS idx_faq_items_ativo ON faq_items(ativo);
CREATE INDEX IF NOT EXISTS idx_faq_items_keywords ON faq_items USING GIN(keywords);

-- Políticas RLS para faq_items (leitura pública)
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "FAQ items are publicly readable" ON faq_items;
CREATE POLICY "FAQ items are publicly readable" ON faq_items 
    FOR SELECT USING (ativo = true);

-- Adicionar campos para integração com chat na tabela agendamentos existente
ALTER TABLE agendamentos 
    ADD COLUMN IF NOT EXISTS chat_session_id UUID REFERENCES chat_sessions(id),
    ADD COLUMN IF NOT EXISTS dados_coletados_chat JSONB DEFAULT '{}';

-- Índice para agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_chat_session ON agendamentos(chat_session_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para faq_items
DROP TRIGGER IF EXISTS update_faq_items_updated_at ON faq_items;
CREATE TRIGGER update_faq_items_updated_at
    BEFORE UPDATE ON faq_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais para FAQ
INSERT INTO faq_items (categoria, pergunta, resposta, keywords) VALUES
('agendamento', 'Como agendar uma consulta?', 'Você pode agendar através do nosso chat! Basta dizer "quero agendar" e eu te ajudo passo a passo.', ARRAY['agendar', 'consulta', 'marcar', 'como']),
('agendamento', 'Posso cancelar minha consulta?', 'Sim! Você pode cancelar até 24 horas antes da consulta através do chat ou na área de agendamentos.', ARRAY['cancelar', 'desmarcar', 'consulta']),
('agendamento', 'Como reagendar uma consulta?', 'Para reagendar, você pode cancelar a consulta atual e agendar uma nova, ou falar comigo que te ajudo!', ARRAY['reagendar', 'remarcar', 'mudar', 'data']),
('preparo', 'Preciso de preparo para exames?', 'Depende do tipo de exame. Vou te informar todos os preparos necessários após o agendamento.', ARRAY['preparo', 'exame', 'jejum', 'preparação']),
('pagamento', 'Quais formas de pagamento aceitas?', 'Aceitamos dinheiro, cartão de débito/crédito, PIX e convênios médicos.', ARRAY['pagamento', 'pagar', 'cartão', 'pix', 'convênio']),
('horario', 'Qual o horário de funcionamento?', 'Nosso horário varia por clínica. Após selecionar a clínica, mostrarei os horários disponíveis.', ARRAY['horário', 'funcionamento', 'aberto', 'fechado']),
('localizacao', 'Onde ficam as clínicas?', 'Temos várias clínicas! Após escolher a especialidade, mostrarei as opções mais próximas de você.', ARRAY['localização', 'endereço', 'onde', 'clínica']),
('documentos', 'Que documentos preciso levar?', 'Leve um documento com foto (RG ou CNH) e carteirinha do convênio se tiver.', ARRAY['documentos', 'rg', 'identidade', 'carteirinha'])
ON CONFLICT DO NOTHING;

-- Conceder permissões para roles anon e authenticated
GRANT SELECT ON chat_sessions TO anon, authenticated;
GRANT INSERT, UPDATE ON chat_sessions TO authenticated;

GRANT SELECT ON chat_messages TO anon, authenticated;
GRANT INSERT ON chat_messages TO authenticated;

GRANT SELECT ON faq_items TO anon, authenticated;

-- Comentários para documentação
COMMENT ON TABLE chat_sessions IS 'Sessões de chat para agendamentos';
COMMENT ON TABLE chat_messages IS 'Mensagens trocadas durante as sessões de chat';
COMMENT ON TABLE faq_items IS 'Itens de FAQ para respostas automáticas';

COMMENT ON COLUMN chat_sessions.context IS 'Contexto da conversa em JSON (etapa atual, dados coletados, etc.)';
COMMENT ON COLUMN chat_messages.metadata IS 'Metadados da mensagem (botões, quick replies, etc.)';
COMMENT ON COLUMN faq_items.keywords IS 'Palavras-chave para busca automática de respostas';