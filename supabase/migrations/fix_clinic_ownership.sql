-- Verificar o user_id do usuário mauricio_dias06@hotmail.com
SELECT id, email FROM profiles WHERE email = 'mauricio_dias06@hotmail.com';

-- Verificar a clínica criada
SELECT id, name, email, owner_id, master_user_id FROM clinics WHERE email = 'edeventosproducoes@gmail.com';

-- Atualizar a clínica para ter o owner_id correto
UPDATE clinics 
SET owner_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
    master_user_id = (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com')
WHERE email = 'edeventosproducoes@gmail.com';

-- Verificar se a atualização funcionou
SELECT id, name, email, owner_id, master_user_id FROM clinics WHERE email = 'edeventosproducoes@gmail.com';

-- Verificar se agora o hook vai encontrar a clínica
SELECT c.id, c.name, c.email, c.owner_id, c.master_user_id, p.email as user_email
FROM clinics c
JOIN profiles p ON (c.owner_id = p.id OR c.master_user_id = p.id)
WHERE p.email = 'mauricio_dias06@hotmail.com';