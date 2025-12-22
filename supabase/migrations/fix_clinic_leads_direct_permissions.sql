-- Remove todas as políticas RLS da tabela clinic_leads
DROP POLICY IF EXISTS "Admins can view all clinic leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admins can manage clinic leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_admin_access" ON public.clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_select_policy" ON public.clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_insert_policy" ON public.clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_update_policy" ON public.clinic_leads;
DROP POLICY IF EXISTS "clinic_leads_delete_policy" ON public.clinic_leads;

-- Desabilitar RLS temporariamente para clinic_leads
ALTER TABLE public.clinic_leads DISABLE ROW LEVEL SECURITY;

-- Dar permissões diretas aos roles
GRANT ALL PRIVILEGES ON public.clinic_leads TO anon;
GRANT ALL PRIVILEGES ON public.clinic_leads TO authenticated;
GRANT ALL PRIVILEGES ON public.clinic_leads TO service_role;

-- Reabilitar RLS
ALTER TABLE public.clinic_leads ENABLE ROW LEVEL SECURITY;

-- Criar política simples que permite tudo para usuários autenticados
CREATE POLICY "clinic_leads_allow_all_authenticated" 
ON public.clinic_leads 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Criar política simples que permite leitura para anon
CREATE POLICY "clinic_leads_allow_read_anon" 
ON public.clinic_leads 
FOR SELECT 
TO anon 
USING (true);

-- Verificar se a tabela existe e tem dados
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinic_leads' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabela clinic_leads existe e tem % registros', (SELECT COUNT(*) FROM public.clinic_leads);
    ELSE
        RAISE NOTICE 'Tabela clinic_leads não existe!';
    END IF;
END $$;