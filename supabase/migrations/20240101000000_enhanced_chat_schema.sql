-- Enhanced Chat Schema Migration
-- Creates improved chat_sessions table and FAQ system

-- Drop existing chat tables if they exist to recreate with new schema
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS chat_booking_sessions CASCADE;
DROP TABLE IF EXISTS faq_items CASCADE;

-- Create enhanced chat_sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    context JSONB DEFAULT '{}',
    current_step VARCHAR(50) DEFAULT 'greeting',
    booking_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('user', 'bot', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'buttons', 'quick_reply', 'system')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ items table
CREATE TABLE faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    keywords TEXT[], -- Array of keywords for search
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_booking_sessions table for booking flow
CREATE TABLE chat_booking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    specialty_id UUID,
    clinic_id UUID REFERENCES clinics(id),
    service_id UUID,
    selected_date DATE,
    selected_time TIME,
    patient_data JSONB DEFAULT '{}',
    booking_step VARCHAR(50) DEFAULT 'selecting_specialty',
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_current_step ON chat_sessions(current_step);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender);

CREATE INDEX idx_faq_items_categoria ON faq_items(categoria);
CREATE INDEX idx_faq_items_active ON faq_items(active);
CREATE INDEX idx_faq_items_keywords ON faq_items USING GIN(keywords);

CREATE INDEX idx_chat_booking_sessions_user_id ON chat_booking_sessions(user_id);
CREATE INDEX idx_chat_booking_sessions_session_id ON chat_booking_sessions(session_id);
CREATE INDEX idx_chat_booking_sessions_status ON chat_booking_sessions(status);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_booking_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON chat_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON chat_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages from own sessions" ON chat_messages FOR SELECT 
USING (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can create messages in own sessions" ON chat_messages FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid()));

-- Create RLS policies for faq_items (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active FAQ items" ON faq_items FOR SELECT 
USING (auth.role() = 'authenticated' AND active = true);

-- Create RLS policies for chat_booking_sessions
CREATE POLICY "Users can view own booking sessions" ON chat_booking_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own booking sessions" ON chat_booking_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own booking sessions" ON chat_booking_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON chat_sessions TO authenticated;
GRANT SELECT, INSERT ON chat_messages TO authenticated;
GRANT SELECT ON faq_items TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON chat_booking_sessions TO authenticated;

-- Insert initial FAQ data
INSERT INTO faq_items (categoria, pergunta, resposta, keywords) VALUES
('agendamento', 'Como agendar uma consulta?', 'Você pode agendar através do nosso chat! Basta dizer "quero agendar" e eu te ajudo passo a passo.', ARRAY['agendar', 'consulta', 'marcar', 'horário']),
('agendamento', 'Posso cancelar minha consulta?', 'Sim! Você pode cancelar até 24 horas antes da consulta através do chat ou na área de agendamentos.', ARRAY['cancelar', 'desmarcar', 'consulta']),
('agendamento', 'Como remarcar uma consulta?', 'Para remarcar, você pode cancelar a consulta atual e agendar uma nova, ou falar comigo que te ajudo!', ARRAY['remarcar', 'reagendar', 'mudar', 'horário']),
('preparo', 'Preciso de preparo para exames?', 'Depende do tipo de exame. Vou te informar todos os preparos necessários após o agendamento.', ARRAY['preparo', 'exame', 'jejum', 'preparação']),
('pagamento', 'Quais formas de pagamento aceitas?', 'Aceitamos dinheiro, cartão de débito/crédito, PIX e convênios médicos.', ARRAY['pagamento', 'forma', 'cartão', 'pix', 'convênio']),
('horario', 'Quais são os horários de funcionamento?', 'Os horários variam por clínica. Após selecionar a clínica, mostrarei os horários disponíveis.', ARRAY['horário', 'funcionamento', 'aberto', 'fechado']),
('localizacao', 'Como encontrar a clínica?', 'Após confirmar seu agendamento, enviarei o endereço completo e instruções de como chegar.', ARRAY['localização', 'endereço', 'como', 'chegar']),
('documentos', 'Que documentos preciso levar?', 'Leve um documento com foto (RG ou CNH) e carteirinha do convênio, se tiver.', ARRAY['documentos', 'rg', 'identidade', 'carteirinha', 'convênio']);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_booking_sessions_updated_at BEFORE UPDATE ON chat_booking_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint to agendamentos table for chat integration
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS chat_session_id UUID REFERENCES chat_sessions(id);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS dados_coletados_chat JSONB DEFAULT '{}';

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_agendamentos_chat_session ON agendamentos(chat_session_id);