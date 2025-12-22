-- Inserir dados de teste para horários de funcionamento
-- Este script adiciona horários básicos para testar o sistema

-- Primeiro, vamos verificar se a tabela existe e tem a estrutura correta
-- Se não existir, vamos criá-la
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de horários para usuários autenticados" ON horarios_funcionamento;
CREATE POLICY "Permitir leitura de horários para usuários autenticados"
    ON horarios_funcionamento FOR SELECT
    TO authenticated
    USING (true);

-- Criar política para permitir leitura para usuários anônimos (necessário para o frontend)
DROP POLICY IF EXISTS "Permitir leitura de horários para usuários anônimos" ON horarios_funcionamento;
CREATE POLICY "Permitir leitura de horários para usuários anônimos"
    ON horarios_funcionamento FOR SELECT
    TO anon
    USING (true);

-- Inserir dados de teste (usando um clinic_id genérico)
-- Vamos usar o clinic_id que aparece nos logs: 311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b
INSERT INTO horarios_funcionamento (clinic_id, dia_semana, hora_inicio, hora_fim)
VALUES 
    -- Segunda-feira (1)
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 1, '08:00', '12:00'),
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 1, '14:00', '18:00'),
    
    -- Terça-feira (2)
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 2, '08:00', '12:00'),
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 2, '14:00', '18:00'),
    
    -- Quarta-feira (3)
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 3, '08:00', '12:00'),
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 3, '14:00', '18:00'),
    
    -- Quinta-feira (4)
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 4, '08:00', '12:00'),
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 4, '14:00', '18:00'),
    
    -- Sexta-feira (5)
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 5, '08:00', '12:00'),
    ('311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b', 5, '14:00', '17:00')
ON CONFLICT DO NOTHING;

-- Conceder permissões explícitas para as roles anon e authenticated
GRANT SELECT ON horarios_funcionamento TO anon;
GRANT ALL PRIVILEGES ON horarios_funcionamento TO authenticated;

-- Verificar se os dados foram inseridos
SELECT 
    clinic_id,
    dia_semana,
    hora_inicio,
    hora_fim,
    COUNT(*) as total_horarios
FROM horarios_funcionamento 
WHERE clinic_id = '311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b'
GROUP BY clinic_id, dia_semana, hora_inicio, hora_fim
ORDER BY dia_semana, hora_inicio;