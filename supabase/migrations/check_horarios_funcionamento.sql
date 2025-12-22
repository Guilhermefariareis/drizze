-- Verificar dados na tabela horarios_funcionamento
SELECT 
  id,
  clinica_id,
  dia_semana,
  hora_inicio,
  hora_fim,
  duracao_consulta,
  ativo,
  created_at
FROM horarios_funcionamento
ORDER BY clinica_id, dia_semana, hora_inicio;

-- Verificar quantos registros existem por clínica
SELECT 
  clinica_id,
  COUNT(*) as total_horarios,
  COUNT(CASE WHEN ativo = true THEN 1 END) as horarios_ativos
FROM horarios_funcionamento
GROUP BY clinica_id;

-- Verificar se existem clínicas
SELECT id, name FROM clinics LIMIT 5;