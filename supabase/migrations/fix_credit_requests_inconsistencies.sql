-- Correção das inconsistências entre painéis do paciente e clínica
-- Baseado na análise das consultas SQL
-- ATUALIZADO: Script completo de correção

-- 1. Primeiro, vamos identificar a clínica correta do usuário edeventosproducoes@gmail.com
DO $$
DECLARE
    target_clinic_id UUID;
    target_user_id UUID;
    mauricio_user_id UUID;
BEGIN
    -- Buscar o ID do usuário edeventosproducoes@gmail.com
    SELECT p.user_id INTO target_user_id
    FROM profiles p 
    WHERE p.email = 'edeventosproducoes@gmail.com'
    LIMIT 1;
    
    -- Se não encontrar por user_id, tentar por id
    IF target_user_id IS NULL THEN
        SELECT p.id INTO target_user_id
        FROM profiles p 
        WHERE p.email = 'edeventosproducoes@gmail.com'
        LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Target user ID: %', target_user_id;
    
    -- Buscar a clínica do usuário (como owner, master ou professional)
    SELECT c.id INTO target_clinic_id
    FROM clinics c
    WHERE c.owner_id = target_user_id 
       OR c.master_user_id = target_user_id
    LIMIT 1;
    
    -- Se não encontrar como owner/master, buscar como professional
    IF target_clinic_id IS NULL THEN
        SELECT cp.clinic_id INTO target_clinic_id
        FROM clinic_professionals cp
        WHERE cp.user_id = target_user_id
        LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Target clinic ID: %', target_clinic_id;
    
    -- Buscar o ID do usuário mauricio_dias06@hotmail.com
    SELECT p.user_id INTO mauricio_user_id
    FROM profiles p 
    WHERE p.email = 'mauricio_dias06@hotmail.com'
    LIMIT 1;
    
    -- Se não encontrar por user_id, tentar por id
    IF mauricio_user_id IS NULL THEN
        SELECT p.id INTO mauricio_user_id
        FROM profiles p 
        WHERE p.email = 'mauricio_dias06@hotmail.com'
        LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Mauricio user ID: %', mauricio_user_id;
    
    -- Se encontramos a clínica correta, vamos corrigir as solicitações
    IF target_clinic_id IS NOT NULL THEN
        -- Atualizar solicitações de R$ 10.500 e R$ 12.450 que não têm clinic_id correto
        UPDATE credit_requests 
        SET clinic_id = target_clinic_id,
            updated_at = NOW()
        WHERE requested_amount IN (10500.00, 12450.00)
          AND patient_id = mauricio_user_id
          AND (clinic_id IS NULL OR clinic_id != target_clinic_id);
        
        RAISE NOTICE 'Atualizadas solicitações de R$ 10.500 e R$ 12.450';
        
        -- Verificar se há solicitações com clinic_id NULL
        UPDATE credit_requests 
        SET clinic_id = target_clinic_id,
            updated_at = NOW()
        WHERE clinic_id IS NULL 
          AND patient_id = mauricio_user_id;
        
        RAISE NOTICE 'Atualizadas solicitações com clinic_id NULL';
        
        -- Verificar solicitações órfãs (clinic_id aponta para clínica inexistente)
        UPDATE credit_requests 
        SET clinic_id = target_clinic_id,
            updated_at = NOW()
        WHERE patient_id = mauricio_user_id
          AND clinic_id NOT IN (SELECT id FROM clinics);
        
        RAISE NOTICE 'Atualizadas solicitações órfãs';
        
    ELSE
        RAISE NOTICE 'Clínica não encontrada para o usuário edeventosproducoes@gmail.com';
    END IF;
    
END $$;

-- 2. Verificar o resultado das correções
SELECT 
    'APÓS CORREÇÃO - Solicitações do mauricio_dias06@hotmail.com' as status,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    cr.treatment_description,
    cr.created_at,
    c.name as clinic_name,
    p.email as patient_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;

-- 3. Verificar se ainda há solicitações problemáticas
SELECT 
    'VERIFICAÇÃO - Solicitações com problemas' as status,
    cr.id,
    cr.requested_amount,
    cr.patient_id,
    cr.clinic_id,
    cr.status,
    CASE 
        WHEN cr.clinic_id IS NULL THEN 'CLINIC_ID_NULL'
        WHEN c.id IS NULL THEN 'CLINIC_NOT_EXISTS'
        ELSE 'OK'
    END as problema,
    p.email as patient_email
FROM credit_requests cr
LEFT JOIN clinics c ON cr.clinic_id = c.id
LEFT JOIN profiles p ON cr.patient_id = p.user_id OR cr.patient_id = p.id
WHERE cr.clinic_id IS NULL OR c.id IS NULL
ORDER BY cr.created_at DESC;