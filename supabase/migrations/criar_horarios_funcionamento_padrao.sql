-- Criar horários de funcionamento padrão para clínicas que não possuem
-- Esta migração adiciona horários padrão (Segunda a Sexta, 8h às 18h) para clínicas sem horários

-- Inserir horários de funcionamento padrão para a clínica "Clínica Principal"
INSERT INTO horarios_funcionamento (clinica_id, dia_semana, hora_inicio, hora_fim, duracao_consulta, ativo)
SELECT 
    '987095d4-bf88-420e-a89b-bfa074b2a790'::uuid as clinica_id,
    dia_semana,
    '08:00:00'::time as hora_inicio,
    '18:00:00'::time as hora_fim,
    30 as duracao_consulta,
    true as ativo
FROM generate_series(1, 5) as dia_semana -- Segunda (1) a Sexta (5)
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_funcionamento 
    WHERE clinica_id = '987095d4-bf88-420e-a89b-bfa074b2a790'::uuid
);

-- Verificar se os horários foram criados
SELECT 
    c.name as clinica_nome,
    hf.dia_semana,
    CASE hf.dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
    END as dia_nome,
    hf.hora_inicio,
    hf.hora_fim,
    hf.duracao_consulta
FROM horarios_funcionamento hf
JOIN clinics c ON c.id = hf.clinica_id
WHERE hf.clinica_id = '987095d4-bf88-420e-a89b-bfa074b2a790'::uuid
ORDER BY hf.dia_semana;