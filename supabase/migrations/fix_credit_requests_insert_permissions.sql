-- Corrigir permissões de inserção para a tabela credit_requests

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'credit_requests'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões de inserção para usuários autenticados
GRANT INSERT ON credit_requests TO authenticated;
GRANT UPDATE ON credit_requests TO authenticated;
GRANT DELETE ON credit_requests TO authenticated;

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'credit_requests';

-- Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'credit_requests';

-- Criar política para permitir inserção por usuários autenticados
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
CREATE POLICY "Users can insert their own credit requests" 
ON credit_requests FOR INSERT 
TO authenticated 
WITH CHECK (patient_id = auth.uid());

-- Criar política para permitir visualização das próprias solicitações
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
CREATE POLICY "Users can view their own credit requests" 
ON credit_requests FOR SELECT 
TO authenticated 
USING (patient_id = auth.uid());

-- Criar política para clínicas visualizarem solicitações relacionadas
DROP POLICY IF EXISTS "Clinics can view related credit requests" ON credit_requests;
CREATE POLICY "Clinics can view related credit requests" 
ON credit_requests FOR SELECT 
TO authenticated 
USING (
  clinic_id IN (
    SELECT c.id 
    FROM clinics c 
    JOIN clinic_professionals cp ON c.id = cp.clinic_id 
    WHERE cp.user_id = auth.uid()
  )
);

-- Criar política para clínicas atualizarem solicitações relacionadas
DROP POLICY IF EXISTS "Clinics can update related credit requests" ON credit_requests;
CREATE POLICY "Clinics can update related credit requests" 
ON credit_requests FOR UPDATE 
TO authenticated 
USING (
  clinic_id IN (
    SELECT c.id 
    FROM clinics c 
    JOIN clinic_professionals cp ON c.id = cp.clinic_id 
    WHERE cp.user_id = auth.uid()
  )
);

-- Verificar permissões finais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'credit_requests'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;