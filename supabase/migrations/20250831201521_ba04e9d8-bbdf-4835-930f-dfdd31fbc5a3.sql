-- Habilitar RLS na tabela clinicorp_credentials se não estiver habilitado
ALTER TABLE public.clinicorp_credentials ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam suas próprias credenciais
CREATE POLICY "Users can view their own clinicorp credentials"
ON public.clinicorp_credentials
FOR SELECT
USING (user_id = auth.uid());

-- Política para permitir que usuários insiram suas próprias credenciais  
CREATE POLICY "Users can insert their own clinicorp credentials"
ON public.clinicorp_credentials
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Política para permitir que usuários atualizem suas próprias credenciais
CREATE POLICY "Users can update their own clinicorp credentials"
ON public.clinicorp_credentials
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para permitir que usuários deletem suas próprias credenciais
CREATE POLICY "Users can delete their own clinicorp credentials"
ON public.clinicorp_credentials
FOR DELETE
USING (user_id = auth.uid());

-- Política para admins gerenciarem todas as credenciais
CREATE POLICY "Admins can manage all clinicorp credentials"
ON public.clinicorp_credentials
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());