-- Migração para sistema de chat de agendamento melhorado
-- Criação das tabelas necessárias para o novo sistema de chat

-- Verificar se as tabelas já existem antes de criar
DO $$ 
BEGIN
    -- Criar tabela faq_items se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faq_items') THEN
        CREATE TABLE public.faq_items (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            question text NOT NULL,
            answer text NOT NULL,
            category varchar(100) DEFAULT 'geral',
            keywords text[], -- Array de palavras-chave para busca
            is_active boolean DEFAULT true,
            display_order integer DEFAULT 0,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        
        -- Inserir dados iniciais de FAQ
        INSERT INTO public.faq_items (question, answer, category, keywords, display_order) VALUES
        ('Como posso agendar uma consulta?', 'Você pode agendar através do nosso chat interativo. Basta escolher a clínica, o serviço desejado e o horário disponível.', 'agendamento', ARRAY['agendar', 'consulta', 'marcar'], 1),
        ('Quais são os horários de funcionamento?', 'Os horários variam por clínica. Durante o agendamento, você verá os horários disponíveis para cada estabelecimento.', 'horarios', ARRAY['horário', 'funcionamento', 'aberto'], 2),
        ('Posso cancelar ou remarcar minha consulta?', 'Sim, você pode cancelar ou remarcar sua consulta através do código de confirmação enviado por SMS ou email.', 'agendamento', ARRAY['cancelar', 'remarcar', 'alterar'], 3),
        ('Como funciona o pagamento?', 'O pagamento pode ser feito diretamente na clínica ou através de nossos parceiros de crédito, dependendo da clínica escolhida.', 'pagamento', ARRAY['pagamento', 'pagar', 'valor'], 4),
        ('Preciso de algum documento para a consulta?', 'Recomendamos levar um documento de identidade e, se possível, exames anteriores relacionados ao tratamento.', 'documentos', ARRAY['documento', 'identidade', 'exames'], 5);
    END IF;

    -- Verificar se as tabelas de chat já existem
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_conversations') THEN
        -- A tabela chat_conversations já existe, vamos apenas adicionar campos se necessário
        -- Verificar se o campo ai_context existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_conversations' AND column_name = 'ai_context') THEN
            ALTER TABLE public.chat_conversations ADD COLUMN ai_context jsonb DEFAULT '{}'::jsonb;
        END IF;
        
        -- Verificar se o campo last_activity existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_conversations' AND column_name = 'last_activity') THEN
            ALTER TABLE public.chat_conversations ADD COLUMN last_activity timestamptz DEFAULT now();
        END IF;
    END IF;

    -- Verificar se a tabela chat_messages já existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
        -- A tabela já existe, vamos apenas adicionar campos se necessário
        -- Verificar se o campo quick_replies existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'quick_replies') THEN
            ALTER TABLE public.chat_messages ADD COLUMN quick_replies jsonb DEFAULT '[]'::jsonb;
        END IF;
        
        -- Verificar se o campo is_ai_generated existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'is_ai_generated') THEN
            ALTER TABLE public.chat_messages ADD COLUMN is_ai_generated boolean DEFAULT false;
        END IF;
    END IF;

    -- Criar tabela chat_sessions se não existir (para gerenciar sessões de chat)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_sessions') THEN
        CREATE TABLE public.chat_sessions (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            session_token text UNIQUE NOT NULL,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
            ip_address inet,
            user_agent text,
            expires_at timestamptz NOT NULL,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        
        -- Índices para performance
        CREATE INDEX idx_chat_sessions_token ON public.chat_sessions(session_token);
        CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
        CREATE INDEX idx_chat_sessions_expires_at ON public.chat_sessions(expires_at);
    END IF;

    -- Criar tabela chat_analytics se não existir (para métricas do chat)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_analytics') THEN
        CREATE TABLE public.chat_analytics (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
            event_type text NOT NULL CHECK (event_type IN ('conversation_started', 'step_completed', 'booking_completed', 'conversation_abandoned', 'faq_accessed', 'ai_response_generated')),
            event_data jsonb DEFAULT '{}'::jsonb,
            user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
            session_id text,
            created_at timestamptz DEFAULT now()
        );
        
        -- Índices para análise
        CREATE INDEX idx_chat_analytics_event_type ON public.chat_analytics(event_type);
        CREATE INDEX idx_chat_analytics_created_at ON public.chat_analytics(created_at);
        CREATE INDEX idx_chat_analytics_conversation_id ON public.chat_analytics(conversation_id);
    END IF;

END $$;

-- Atualizar função de trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at nas tabelas que precisam
DO $$
BEGIN
    -- Trigger para faq_items
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_faq_items_updated_at') THEN
        CREATE TRIGGER update_faq_items_updated_at
            BEFORE UPDATE ON public.faq_items
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para chat_conversations
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_chat_conversations_updated_at') THEN
        CREATE TRIGGER update_chat_conversations_updated_at
            BEFORE UPDATE ON public.chat_conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para chat_sessions
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_chat_sessions_updated_at') THEN
        CREATE TRIGGER update_chat_sessions_updated_at
            BEFORE UPDATE ON public.chat_sessions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para faq_items (leitura pública, escrita apenas para autenticados)
CREATE POLICY "FAQ items são visíveis para todos" ON public.faq_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Apenas usuários autenticados podem gerenciar FAQ" ON public.faq_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para chat_sessions
CREATE POLICY "Usuários podem ver suas próprias sessões" ON public.chat_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.role() = 'anon'
    );

CREATE POLICY "Usuários podem criar sessões" ON public.chat_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas sessões" ON public.chat_sessions
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.role() = 'anon'
    );

-- Políticas RLS para chat_analytics
CREATE POLICY "Analytics são visíveis para admins" ON public.chat_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sistema pode inserir analytics" ON public.chat_analytics
    FOR INSERT WITH CHECK (true);

-- Comentários nas tabelas
COMMENT ON TABLE public.faq_items IS 'Perguntas frequentes para o sistema de chat';
COMMENT ON TABLE public.chat_sessions IS 'Sessões de chat para usuários anônimos e autenticados';
COMMENT ON TABLE public.chat_analytics IS 'Métricas e analytics do sistema de chat';

-- Comentários nas colunas importantes
COMMENT ON COLUMN public.faq_items.keywords IS 'Array de palavras-chave para busca inteligente';
COMMENT ON COLUMN public.chat_sessions.session_token IS 'Token único para identificar sessões anônimas';
COMMENT ON COLUMN public.chat_analytics.event_type IS 'Tipo de evento para análise de comportamento';