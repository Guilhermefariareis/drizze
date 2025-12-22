-- Fix clinic_leads permissions definitively
-- Remove all complex RLS policies and grant direct permissions

-- 1. Drop all existing policies that might reference users table
DROP POLICY IF EXISTS "Admin can view all clinic leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admin can manage all clinic leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admins podem ver todos os leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admins podem atualizar leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Permitir inserção de leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "Admin full access to clinic_leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "anon_can_read_clinic_leads" ON public.clinic_leads;
DROP POLICY IF EXISTS "authenticated_can_manage_clinic_leads" ON public.clinic_leads;

-- 2. Disable RLS temporarily to ensure clean state
ALTER TABLE public.clinic_leads DISABLE ROW LEVEL SECURITY;

-- 3. Grant direct permissions to roles
GRANT ALL PRIVILEGES ON public.clinic_leads TO anon;
GRANT ALL PRIVILEGES ON public.clinic_leads TO authenticated;

-- 4. Re-enable RLS
ALTER TABLE public.clinic_leads ENABLE ROW LEVEL SECURITY;

-- 5. Create simple policies that don't depend on other tables
CREATE POLICY "anon_full_access_clinic_leads"
ON public.clinic_leads
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_full_access_clinic_leads"
ON public.clinic_leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Ensure sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Add comment for documentation
COMMENT ON TABLE public.clinic_leads IS 'Clinic leads table with simplified permissions - no dependencies on users table';