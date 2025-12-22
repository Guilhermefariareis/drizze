-- Verificar o user_id do usuário mauricio_dias06@hotmail.com
SELECT 'USER INFO' as type, id, email FROM profiles WHERE email = 'mauricio_dias06@hotmail.com';

-- Verificar todas as clínicas e seus proprietários
SELECT 'ALL CLINICS' as type, id, name, email, owner_id, master_user_id FROM clinics;

-- Verificar especificamente a clínica que deveria estar associada
SELECT 'TARGET CLINIC' as type, c.id, c.name, c.email, c.owner_id, c.master_user_id, 
       p1.email as owner_email, p2.email as master_email
FROM clinics c
LEFT JOIN profiles p1 ON c.owner_id = p1.id
LEFT JOIN profiles p2 ON c.master_user_id = p2.id
WHERE c.email = 'edeventosproducoes@gmail.com';

-- Verificar se existe alguma clínica para o usuário mauricio_dias06@hotmail.com
SELECT 'USER CLINICS' as type, c.id, c.name, c.email, c.owner_id, c.master_user_id
FROM clinics c
WHERE c.owner_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com')
   OR c.master_user_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com');

-- Testar a query exata que o hook useClinicProfile usa
SELECT 'HOOK QUERY TEST' as type, *
FROM clinics
WHERE owner_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com')
   OR master_user_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com')
LIMIT 1;