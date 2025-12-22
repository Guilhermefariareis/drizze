-- Atualizar agendamentos para a clínica correta
-- Os agendamentos estão na clínica: 45b2554d-d220-43b4-a167-afa694caa76b
-- Mas o frontend está buscando pela clínica: 57a61d41-a8b6-4a47-be8a-b9f9ef574c17

-- Verificar quantos agendamentos existem com a clínica antiga
SELECT 
    COUNT(*) as total_agendamentos,
    clinica_id
FROM agendamentos 
WHERE clinica_id = '45b2554d-d220-43b4-a167-afa694caa76b'
GROUP BY clinica_id;

-- Atualizar os agendamentos para a clínica correta
UPDATE agendamentos 
SET 
    clinica_id = '57a61d41-a8b6-4a47-be8a-b9f9ef574c17',
    updated_at = NOW()
WHERE clinica_id = '45b2554d-d220-43b4-a167-afa694caa76b';

-- Verificar se a atualização foi bem-sucedida
SELECT 
    COUNT(*) as total_agendamentos,
    clinica_id
FROM agendamentos 
WHERE clinica_id = '57a61d41-a8b6-4a47-be8a-b9f9ef574c17'
GROUP BY clinica_id;

-- Verificar se não restaram agendamentos na clínica antiga
SELECT 
    COUNT(*) as agendamentos_restantes
FROM agendamentos 
WHERE clinica_id = '45b2554d-d220-43b4-a167-afa694caa76b';