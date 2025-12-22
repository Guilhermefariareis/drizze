-- Atualizar agendamentos para a clínica correta do usuário
-- Clínica do usuário: 987095d4-bf88-420e-a89b-bfa074b2a790
-- Clínica antiga dos agendamentos: 45b2554d-d220-43b4-a167-afa694caa76b

-- Primeiro, verificar quantos agendamentos existem com a clínica antiga
SELECT 
    COUNT(*) as total_agendamentos,
    clinica_id
FROM agendamentos 
WHERE clinica_id = '45b2554d-d220-43b4-a167-afa694caa76b'
GROUP BY clinica_id;

-- Atualizar os agendamentos para a clínica correta
UPDATE agendamentos 
SET 
    clinica_id = '987095d4-bf88-420e-a89b-bfa074b2a790',
    updated_at = NOW()
WHERE clinica_id = '45b2554d-d220-43b4-a167-afa694caa76b';

-- Verificar se a atualização foi bem-sucedida
SELECT 
    COUNT(*) as total_agendamentos_atualizados,
    clinica_id
FROM agendamentos 
WHERE clinica_id = '987095d4-bf88-420e-a89b-bfa074b2a790'
GROUP BY clinica_id;

-- Mostrar alguns agendamentos atualizados
SELECT 
    id,
    clinica_id,
    data_hora,
    status,
    tipo_consulta,
    updated_at
FROM agendamentos 
WHERE clinica_id = '987095d4-bf88-420e-a89b-bfa074b2a790'
ORDER BY data_hora
LIMIT 5;