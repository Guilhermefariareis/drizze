-- CORREÇÃO CRÍTICA: Ajustar roles dos usuários conforme especificado
-- Esta migração corrige a confusão de papéis que estava causando vazamento de dados

-- 1. Definir role correto para edeventosproducoes@gmail.com (CLÍNICA)
UPDATE profiles 
SET role = 'clinic', account_type = 'clinica'
WHERE email = 'edeventosproducoes@gmail.com';

-- 2. Definir role correto para master@doutorizze.com.br (ADMIN MASTER)
-- Primeiro, inserir o perfil se não existir
INSERT INTO profiles (id, user_id, email, full_name, role, account_type, is_active, email_verified)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'master@doutorizze.com.br',
    'Master Admin',
    'master',
    'clinica',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'master@doutorizze.com.br'
);

-- Atualizar se já existir
UPDATE profiles 
SET role = 'master', account_type = 'clinica'
WHERE email = 'master@doutorizze.com.br';

-- 3. Definir role correto para mauricio_dias06@hotmail (PACIENTE)
UPDATE profiles 
SET role = 'patient', account_type = 'paciente'
WHERE email = 'mauricio_dias06@hotmail';

-- 4. Log das alterações para auditoria
INSERT INTO audit_logs (user_id, action, table_name, record_id, changes, created_at)
SELECT 
    id,
    'CRITICAL_ROLE_FIX',
    'profiles',
    id::text,
    jsonb_build_object(
        'email', email,
        'new_role', role,
        'reason', 'Correção crítica de confusão de papéis'
    ),
    now()
FROM profiles 
WHERE email IN ('edeventosproducoes@gmail.com', 'master@doutorizze.com.br', 'mauricio_dias06@hotmail');