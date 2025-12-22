-- Debug: Verificar horários de funcionamento salvos
-- Este arquivo é apenas para debug, não será aplicado como migração

-- Verificar todos os horários de funcionamento
SELECT 
    id,
    clinica_id,
    dia_semana,
    CASE dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
        ELSE 'Inválido'
    END as nome_dia,
    hora_inicio,
    hora_fim,
    duracao_consulta,
    ativo,
    created_at
FROM horarios_funcionamento
ORDER BY clinica_id, dia_semana;

-- Verificar qual dia da semana é hoje (PostgreSQL)
SELECT 
    EXTRACT(DOW FROM CURRENT_DATE) as dia_hoje_postgres,
    CASE EXTRACT(DOW FROM CURRENT_DATE)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END as nome_hoje,
    CURRENT_DATE as data_hoje;

-- Verificar se há horários para hoje
SELECT 
    h.*,
    CASE h.dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END as nome_dia
FROM horarios_funcionamento h
WHERE h.dia_semana = EXTRACT(DOW FROM CURRENT_DATE)
  AND h.ativo = true;

-- Contar horários por dia da semana
SELECT 
    dia_semana,
    CASE dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END as nome_dia,
    COUNT(*) as quantidade_horarios
FROM horarios_funcionamento
WHERE ativo = true
GROUP BY dia_semana
ORDER BY dia_semana;