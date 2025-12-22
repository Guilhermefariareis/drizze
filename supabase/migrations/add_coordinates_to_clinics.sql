-- Adicionar colunas de coordenadas à tabela clinics
ALTER TABLE clinics 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN clinics.latitude IS 'Latitude da clínica em graus decimais';
COMMENT ON COLUMN clinics.longitude IS 'Longitude da clínica em graus decimais';

-- Criar índice para otimizar consultas de geolocalização
CREATE INDEX idx_clinics_coordinates ON clinics (latitude, longitude);

-- Popular coordenadas baseadas nas cidades conhecidas
-- Coordenadas aproximadas das principais cidades do Brasil

-- Goiânia, GO
UPDATE clinics 
SET latitude = -16.6869, longitude = -49.2648 
WHERE city ILIKE '%goiânia%' OR city ILIKE '%goiania%';

-- Trindade, GO
UPDATE clinics 
SET latitude = -16.6469, longitude = -49.4871 
WHERE city ILIKE '%trindade%';

-- Anápolis, GO
UPDATE clinics 
SET latitude = -16.3281, longitude = -48.9531 
WHERE city ILIKE '%anápolis%' OR city ILIKE '%anapoli%';

-- Aparecida de Goiânia, GO
UPDATE clinics 
SET latitude = -16.8173, longitude = -49.2437 
WHERE city ILIKE '%aparecida%';

-- Rio Verde, GO
UPDATE clinics 
SET latitude = -17.7973, longitude = -50.9264 
WHERE city ILIKE '%rio verde%';

-- Luziânia, GO
UPDATE clinics 
SET latitude = -16.2572, longitude = -47.9502 
WHERE city ILIKE '%luziânia%' OR city ILIKE '%luziania%';

-- Águas Lindas, GO
UPDATE clinics 
SET latitude = -15.7539, longitude = -48.2839 
WHERE city ILIKE '%águas lindas%' OR city ILIKE '%aguas lindas%';

-- Valparaíso, GO
UPDATE clinics 
SET latitude = -15.8989, longitude = -48.1689 
WHERE city ILIKE '%valparaíso%' OR city ILIKE '%valparaiso%';

-- Novo Gama, GO
UPDATE clinics 
SET latitude = -16.0439, longitude = -48.1289 
WHERE city ILIKE '%novo gama%';

-- Planaltina, GO
UPDATE clinics 
SET latitude = -15.6189, longitude = -47.6539 
WHERE city ILIKE '%planaltina%';

-- Brasília, DF (caso haja clínicas cadastradas como Brasília)
UPDATE clinics 
SET latitude = -15.7801, longitude = -47.9292 
WHERE city ILIKE '%brasília%' OR city ILIKE '%brasilia%';

-- São Paulo, SP (para identificar clínicas que estão muito longe)
UPDATE clinics 
SET latitude = -23.5505, longitude = -46.6333 
WHERE city ILIKE '%são paulo%' OR city ILIKE '%sao paulo%';

-- Rio de Janeiro, RJ
UPDATE clinics 
SET latitude = -22.9068, longitude = -43.1729 
WHERE city ILIKE '%rio de janeiro%';

-- Belo Horizonte, MG
UPDATE clinics 
SET latitude = -19.9191, longitude = -43.9386 
WHERE city ILIKE '%belo horizonte%';

-- Para clínicas sem cidade definida ou com coordenadas ainda nulas,
-- vamos definir coordenadas padrão de Goiânia (centro de Goiás)
UPDATE clinics 
SET latitude = -16.6869, longitude = -49.2648 
WHERE (latitude IS NULL OR longitude IS NULL) 
AND (city IS NULL OR city = '');

-- Verificar se ainda há clínicas sem coordenadas
-- (isso nos ajudará a identificar cidades não mapeadas)
SELECT 
    city,
    COUNT(*) as total_clinics,
    COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as without_coordinates
FROM clinics 
WHERE is_active = true
GROUP BY city
HAVING COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) > 0
ORDER BY total_clinics DESC;