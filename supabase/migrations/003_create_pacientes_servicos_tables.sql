-- Migração para tabelas complementares do sistema de agendamento
-- Criação das tabelas de pacientes e serviços

-- Tabela de pacientes (separada dos usuários auth)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    data_nascimento DATE,
    cpf VARCHAR(14),
    endereco JSONB,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços oferecidos pelas clínicas
CREATE TABLE IF NOT EXISTS servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    preco DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    categoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela de agendamentos para referenciar pacientes e serviços
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS paciente_dados_id UUID REFERENCES pacientes(id),
ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES servicos(id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pacientes_telefone ON pacientes(telefone);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);

CREATE INDEX IF NOT EXISTS idx_servicos_clinic_id ON servicos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON servicos(categoria);

CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_dados ON agendamentos(paciente_dados_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico ON agendamentos(servico_id);

-- Trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER trigger_pacientes_updated_at
    BEFORE UPDATE ON pacientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_servicos_updated_at
    BEFORE UPDATE ON servicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pacientes
CREATE POLICY "Pacientes podem ver seus próprios dados" ON pacientes
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Clínicas podem ver pacientes" ON pacientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Clínicas podem inserir pacientes" ON pacientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Clínicas podem atualizar pacientes" ON pacientes
     FOR UPDATE USING (auth.role() = 'authenticated');

-- Política removida: pacientes não tem clinica_id

-- Políticas RLS para serviços
CREATE POLICY "Todos podem ver serviços ativos" ON servicos
    FOR SELECT USING (ativo = true);

CREATE POLICY "Clínicas podem gerenciar seus serviços" ON servicos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinics c 
            WHERE c.id = clinic_id 
            AND c.owner_id = auth.uid()
        )
    );

-- Função para buscar horários disponíveis (atualizada)
CREATE OR REPLACE FUNCTION buscar_horarios_disponiveis(
    p_clinic_id UUID,
    p_data DATE,
    p_servico_id UUID DEFAULT NULL
)
RETURNS TABLE(
    horario TIME,
    disponivel BOOLEAN
) AS $$
DECLARE
    r RECORD;
    duracao_servico INTEGER := 30;
BEGIN
    -- Buscar duração do serviço se fornecido
    IF p_servico_id IS NOT NULL THEN
        SELECT duracao_minutos INTO duracao_servico 
        FROM servicos 
        WHERE id = p_servico_id AND ativo = true;
        
        -- Se serviço não encontrado, usar duração padrão
        IF duracao_servico IS NULL THEN
            duracao_servico := 30;
        END IF;
    END IF;
    
    -- Retornar horários disponíveis baseado no funcionamento da clínica
    FOR r IN (
        SELECT 
            generate_series(
                (p_data + hf.hora_inicio)::timestamp,
                (p_data + hf.hora_fim - (duracao_servico || ' minutes')::interval)::timestamp,
                (COALESCE(hf.duracao_consulta, 30) || ' minutes')::interval
            ) AS slot_time
        FROM horarios_funcionamento hf
        WHERE hf.clinica_id = p_clinic_id
        AND hf.dia_semana = EXTRACT(DOW FROM p_data)
        AND hf.ativo = true
    ) LOOP
        -- Verificar se o horário está disponível
        horario := r.slot_time::time;
        disponivel := NOT EXISTS (
            SELECT 1 FROM agendamentos a
            WHERE a.clinica_id = p_clinic_id
            AND a.data_hora::date = p_data
            AND a.data_hora::time = horario
            AND a.status IN ('confirmado', 'pendente')
        ) AND NOT EXISTS (
            SELECT 1 FROM horarios_bloqueados hb
            WHERE hb.clinica_id = p_clinic_id
            AND r.slot_time BETWEEN hb.data_inicio AND hb.data_fim
        );
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Inserir alguns serviços padrão para clínicas existentes
INSERT INTO servicos (clinic_id, nome, descricao, duracao_minutos, preco, categoria)
SELECT 
    c.id,
    'Consulta Odontológica',
    'Consulta odontológica geral',
    30,
    100.00,
    'Consulta'
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM servicos s WHERE s.clinic_id = c.id AND s.nome = 'Consulta Odontológica'
)
LIMIT 10;

INSERT INTO servicos (clinic_id, nome, descricao, duracao_minutos, preco, categoria)
SELECT 
    c.id,
    'Limpeza Dental',
    'Limpeza e profilaxia dental',
    45,
    80.00,
    'Prevenção'
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM servicos s WHERE s.clinic_id = c.id AND s.nome = 'Limpeza Dental'
)
LIMIT 10;

-- Comentários
COMMENT ON TABLE pacientes IS 'Dados dos pacientes para agendamentos';
COMMENT ON TABLE servicos IS 'Serviços oferecidos pelas clínicas';
COMMENT ON COLUMN servicos.duracao_minutos IS 'Duração do serviço em minutos';
COMMENT ON COLUMN servicos.preco IS 'Preço do serviço em reais';
COMMENT ON COLUMN pacientes.endereco IS 'Endereço em formato JSON';