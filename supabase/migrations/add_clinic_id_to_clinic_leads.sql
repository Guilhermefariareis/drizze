-- Add clinic_id to clinic_leads and permissive RLS policies for authenticated users

-- Add column clinic_id
ALTER TABLE public.clinic_leads ADD COLUMN IF NOT EXISTS clinic_id UUID;

-- Add foreign key constraint to clinics(id) if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clinic_leads_clinic_id_fkey'
  ) THEN
    ALTER TABLE public.clinic_leads
      ADD CONSTRAINT clinic_leads_clinic_id_fkey
      FOREIGN KEY (clinic_id)
      REFERENCES public.clinics(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index for clinic_id
CREATE INDEX IF NOT EXISTS idx_clinic_leads_clinic_id ON public.clinic_leads(clinic_id);

-- Policies: allow authenticated users to select/update/insert rows with clinic_id set
DROP POLICY IF EXISTS "Authenticated can select clinic leads with clinic_id" ON public.clinic_leads;
CREATE POLICY "Authenticated can select clinic leads with clinic_id"
  ON public.clinic_leads
  FOR SELECT
  TO authenticated
  USING (clinic_id IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can update clinic leads with clinic_id" ON public.clinic_leads;
CREATE POLICY "Authenticated can update clinic leads with clinic_id"
  ON public.clinic_leads
  FOR UPDATE
  TO authenticated
  USING (clinic_id IS NOT NULL)
  WITH CHECK (clinic_id IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can insert clinic leads with clinic_id" ON public.clinic_leads;
CREATE POLICY "Authenticated can insert clinic leads with clinic_id"
  ON public.clinic_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id IS NOT NULL);