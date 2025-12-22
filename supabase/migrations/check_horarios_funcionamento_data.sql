-- Verificar dados na tabela horarios_funcionamento
SELECT 
    id,
    clinica_id,
    dia_semana,
    hora_inicio,
    hora_fim,
    ativo,
    created_at
FROM horarios_funcionamento
ORDER BY clinica_id, dia_semana, hora_inicio;

-- Verificar se existem clínicas
SELECT id, nome FROM clinicas LIMIT 5;

-- Verificar relação entre horários e clínicas
SELECT 
    hf.id,
    c.nome as clinica_nome,
    hf.dia_semana,
    hf.hora_inicio,
    hf.hora_fim,
    hf.ativo
FROM horarios_funcionamento hf
JOIN clinicas c ON hf.clinica_id = c.id
ORDER BY c.nome, hf.dia_semana, hf.hora_