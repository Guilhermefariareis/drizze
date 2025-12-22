-- Inserir horários padrão de funcionamento para clínicas que não possuem
-- Segunda a Sexta: 08:00 às 18:00, duração de consulta: 30 minutos

INSERT INTO horarios_funcionamento (clinica_id, dia_semana, hora_inicio, hora_fim, duracao_consulta, ativo)
SELECT 
    c.id as clinica_id,
    dias.dia_semana,
    '08:00'::time as hora_inicio,
    '18:00'::time as hora_fim,
    30 as duracao_consulta,
    true as ativo
FROM clinics c
CROSS JOIN (
    SELECT 1 as dia_semana UNION ALL -- Segunda
    SELECT 2 as dia_semana UNION ALL -- Terça
    SELECT 3 as dia_semana UNION ALL -- Quarta
    SELECT 4 as dia_semana UNION ALL -- Quinta
    SELECT 5 as dia_semana           -- Sexta
) dias
WHERE NOT EXISTS (
    SELECT 1 
    FROM horarios_funcionamento hf 
    WHERE hf.clinica_id = c.id 
    AND hf.dia_semana = dias.dia_semana 
    AND hf.ativo = true
);

-- Verificar quantos registros foram inseridos
SELECT 
    'Horários inseridos' as status,
    COUNT(*) as total_inseridos
FROM horarios_funcionamento 
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Verificar o estado final
SELECT 
    COUNT(*) as total_horarios,
    COUNT(DISTINCT clinica_id) as clinicas_com_horarios
FROM horarios_funcionamento 
WHERE ativo = true;