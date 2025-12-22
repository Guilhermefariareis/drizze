-- Migração para Sistema de Agendamento Doutorizze
-- Criação das tabelas principais do sistema

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinica_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_consulta VARCHAR(50) NOT NULL DEFAULT 'consulta_geral',
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
    observacoes TEXT,
    codigo_confirmacao VARCHAR(10) UNIQUE,
    valor DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de horários de funcionamento das clínicas
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 6=sábado
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    duracao_consulta INTEGER DEFAULT 30, -- em minutos
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações do sistema de agendamento
CREATE TABLE IF NOT EXISTS agendamento_notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('email', 'sms', 'push', 'in_app')),
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    enviada_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de horários bloqueados/indisponíveis
CREATE TABLE IF NOT EXISTS horarios_bloqueados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_clinica ON agendamentos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_codigo ON agendamentos(codigo_confirmacao);

CREATE INDEX IF NOT EXISTS idx_horarios_funcionamento_clinica ON horarios_funcionamento(clinica_id);
CREATE INDEX IF NOT EXISTS idx_horarios_funcionamento_dia ON horarios_funcionamento(dia_semana);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON agendamento_notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_agendamento ON agendamento_notificacoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON agendamento_notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON agendamento_notificacoes(lida);

CREATE INDEX IF NOT EXISTS idx_horarios_bloqueados_clinica ON horarios_bloqueados(clinica_id);
CREATE INDEX IF NOT EXISTS idx_horarios_bloqueados_profissional ON horarios_bloqueados(profissional_id);
CREATE INDEX IF NOT EXISTS idx_horarios_bloqueados_data ON horarios_bloqueados(data_inicio, data_fim);

-- Função para gerar código de confirmação
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION set_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_confirmacao IS NULL THEN
        NEW.codigo_confirmacao := generate_confirmation_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_confirmation_code ON agendamentos;
CREATE TRIGGER trigger_set_confirmation_code
    BEFORE INSERT ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION set_confirmation_code();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER trigger_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamento_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_bloqueados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agendamentos
CREATE POLICY "Pacientes podem ver seus próprios agendamentos" ON agendamentos
    FOR SELECT USING (auth.uid() = paciente_id);

CREATE POLICY "Pacientes podem criar agendamentos" ON agendamentos
    FOR INSERT WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "Pacientes podem atualizar seus próprios agendamentos" ON agendamentos
    FOR UPDATE USING (auth.uid() = paciente_id);

-- Políticas RLS para notificações
CREATE POLICY "Usuários podem ver suas próprias notificações" ON agendamento_notificacoes
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Sistema pode criar notificações" ON agendamento_notificacoes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem marcar notificações como lidas" ON agendamento_notificacoes
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas RLS para horários de funcionamento (apenas leitura para usuários)
CREATE POLICY "Todos podem ver horários de funcionamento" ON horarios_funcionamento
    FOR SELECT USING (true);

-- Políticas RLS para horários bloqueados (apenas leitura para usuários)
CREATE POLICY "Todos podem ver horários bloqueados" ON horarios_bloqueados
    FOR SELECT USING (true);

-- Inserir dados iniciais de exemplo
INSERT INTO horarios_funcionamento (clinica_id, dia_semana, hora_inicio, hora_fim, duracao_consulta)
SELECT 
    id,
    generate_series(1, 5) as dia_semana, -- Segunda a sexta
    '08:00'::TIME as hora_inicio,
    '18:00'::TIME as hora_fim,
    30 as duracao_consulta
FROM clinics 
WHERE id IN (SELECT id FROM clinics LIMIT 3)
ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE agendamentos IS 'Tabela principal de agendamentos do sistema';
COMMENT ON TABLE horarios_funcionamento IS 'Horários de funcionamento das clínicas por dia da semana';
COMMENT ON TABLE agendamento_notificacoes IS 'Notificações relacionadas ao sistema de agendamento';
COMMENT ON TABLE horarios_bloqueados IS 'Horários bloqueados ou indisponíveis para agendamento';

COMMENT ON COLUMN agendamentos.status IS 'Status do agendamento: pendente, confirmado, cancelado, concluido';
COMMENT ON COLUMN agendamentos.codigo_confirmacao IS 'Código único de 6 caracteres para confirmação';
COMMENT ON COLUMN horarios_funcionamento.dia_semana IS 'Dia da semana: 0=domingo, 1=segunda, ..., 6=sábado';
COMMENT ON COLUMN horarios_funcionamento.duracao_consulta IS 'Duração padrão da consulta em minutos';