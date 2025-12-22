-- Verificar e corrigir permissões RLS para tabela credit_requests

-- 1. Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'credit_requests'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 2. Garantir permissões básicas para roles
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

-- 3. Remover políticas RLS existentes para recriar
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can update their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can update requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins can update all credit requests" ON credit_requests;

-- 4. Criar políticas RLS mais permissivas para teste
-- Política para usuários autenticados poderem inserir solicitações
CREATE POLICY "Authenticated users can insert credit requests" ON credit_requests
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Política para usuários autenticados poderem visualizar suas próprias solicitações
CREATE POLICY "Users can view their own credit requests" ON credit_requests
    FOR SELECT TO authenticated
    USING (patient_id = auth.uid());

-- Política para clínicas visualizarem solicitações direcionadas a elas
CREATE POLICY "Clinics can view requests for their clinic" ON credit_requests
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

-- Política para usuários autenticados atualizarem suas próprias solicitações
CREATE POLICY "Users can update their own credit requests" ON credit_requests
    FOR UPDATE TO authenticated
    USING (patient_id = auth.uid());

-- Política para clínicas atualizarem solicitações direcionadas a elas
CREATE POLICY "Clinics can update requests for their clinic" ON credit_requests
    FOR UPDATE TO authenticated
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

-- 5. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'credit_requests';

-- 6. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'credit_requests';

-- 7. Inserir dados de teste para validação
INSERT INTO credit_requests (
    patient_id,
    clinic_id,
    requested_amount,
    treatment_description,
    status
) VALUES 
(
    (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
    (SELECT id FROM clinics WHERE email = 'edeventosproducoes@gmail.com'),
    5000.00,
    'Implante dentário - teste de validação do sistema',
    'pending'
),
(
    (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
    (SELECT id FROM clinics WHERE email = 'edeventosproducoes@gmail.com'),
    3500.00,
    'Tratamento ortodôntico - teste de validação do sistema',
    'clinic_analysis'
),
(
    (SELECT id FROM profiles WHERE email = 'mauricio_dias06@hotmail.com'),
    (SELECT id FROM clinics WHERE email = 'edeventosproducoes@gmail.com'),
    2000.00,
    'Limpeza e clareamento - teste de validação do sistema',
    'approved'
);

-- 8. Verificar dados inseridos
SELECT 
    cr.id,
    p.email as patient_email,
    c.name as clinic_name,
    cr.requested_amount,
    cr.treatment_description,
    cr.status,
    cr.created_at
FROM credit_requests cr
JOIN profiles p ON cr.patient_id = p.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE p.email = 'mauricio_dias06@hotmail.com'
ORDER BY cr.created_at DESC;