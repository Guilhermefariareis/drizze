-- Verificar quantas clínicas existem para o usuário específico
SELECT 
    'Clínicas como owner_id' as tipo,
    COUNT(*) as quantidade
FROM clinics 
WHERE owner_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa';

SELECT 
    'Clínicas como master_user_id' as tipo,
    COUNT(*) as quantidade
FROM clinics 
WHERE master_user_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa';

-- Listar todas as clínicas do usuário
SELECT 
    'Detalhes das clínicas' as tipo,
    id,
    name,
    owner_id,
    master_user_id,
    created_at
FROM clinics 
WHERE owner_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa' 
   OR master_user_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa'
ORDER BY created_at;

-- Verificar se há clínicas duplicadas
SELECT 
    name,
    COUNT(*) as quantidade_duplicadas
FROM clinics 
WHERE owner_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa' 
   OR master_user_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa'
GROUP BY name
HAVING COUNT(*) > 1;