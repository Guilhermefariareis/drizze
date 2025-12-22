ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clinics_public_read_anon ON public.clinics;
DROP POLICY IF EXISTS clinics_public_read_auth ON public.clinics;
CREATE POLICY clinics_public_read_anon ON public.clinics FOR SELECT TO anon USING ((is_active IS TRUE) OR (active IS TRUE) OR (status = 'active') OR (is_active IS NULL AND active IS NULL AND status IS NULL));
CREATE POLICY clinics_public_read_auth ON public.clinics FOR SELECT TO authenticated USING ((is_active IS TRUE) OR (active IS TRUE) OR (status = 'active') OR (is_active IS NULL AND active IS NULL AND status IS NULL));