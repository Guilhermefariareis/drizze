-- Adicionar permissões para a tabela horarios_funcionamento
GRANT INSERT, UPDATE, DELETE ON horarios_funcionamento TO authenticated;
GRANT INSERT, UPDATE, DELETE ON horarios_funcionamento TO anon;

-- Inserir horários de funcionamento para a clínica "Minha Clínica"
INSERT INTO horarios_funcionamento (clinica_id, dia_semana, hora_inicio, hora_fim, duracao_consulta, ativo)
VALUES 
  ('57a61d41-a8b6-4a47-be8a-b9f9ef574c17', 1, '08:00:00', '18:00:00', 30, true), -- Segunda
  ('57a61d41-a8b6-4a47-be8a-b9f9ef574c17', 2, '08:00:00', '18:00:00', 30, true), -- Terça
  ('57a61d41-a8b6-4a47-be8a-b9f9ef574c17', 3, '08:00:00', '18:00:00', 30, true), -- Quarta
  ('57a61d41-a8b6-4a47-be8a-b9f9ef574c17', 4, '08:00:00', '18:00:00', 30, true), -- Quinta
  ('57a61d41-a8b6-4a47-be8a-b9f9ef574c17', 5, '08:00:00', '18:00:00', 30, true); -- Sexta

-- Verificar se os horários foram inseridos
SELECT 
  dia_semana,
  hora_inicio,
  hora_fim,
  duracao_consulta,
  ativo
FROM horarios_funcionamento 
WHERE clinica_id = '57a61d41-a8b6-4a47-be8a-b9f9ef574c17'
ORDER BY dia_semana;