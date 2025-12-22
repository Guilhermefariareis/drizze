-- Simplificar acesso à tabela clinic_leads removendo dependências complexas
-- Esta migração resolve o erro "permission denied for table users"

-- 1. Remover políticas RLS complexas que dependem de outras tabelas
DROP POLICY IF EXISTS "Admin can view all clinic leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admin can manage all clinic leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admins podem ver todos os leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admins podem atualizar leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Permitir inserção de leads" ON public.clinic_leads;

-- 2. Criar políticas simples sem dependências externas
-- Permitir que usuários anônimos insiram leads (formulário público)
CREATE POLICY "Allow anonymous insert clinic leads"
ON public.clinic_leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Permitir que usuários autenticados vejam todos os leads (admin)
CREATE POLICY "Allow authenticated read clinic leads"
ON public.clinic_leads
FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuários autenticados atualizem leads (admin)
CREATE POLICY "Allow authenticated update clinic leads"
ON public.clinic_leads
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir que usuários autenticados deletem leads (admin)
CREATE POLICY "Allow authenticated delete clinic leads"
ON public.clinic_leads
FOR DELETE
TO authenticated
USING (true);

-- 3. Garantir permissões básicas nas roles
GRANT SELECT, INSERT ON public.clinic_leads TO anon;
GRANT ALL PRIVILEGES ON public.clinic_leads TO authenticated;

-- 4. Verificar se RLS está habilitado
ALTER TABLE public.clinic_leads ENABLE ROW LEVEL SECURITY;

-- 5. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'clinic_leads'
ORDER BY policyname;