-- Adicionar colunas faltantes na tabela clinics
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS agenda_link_url text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS website text;

-- Adicionar foreign key para appointments -> payments (corrigir relacionamento)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES public.clinics(id);

-- Adicionar foreign key para loan_requests -> clinics
ALTER TABLE public.loan_requests 
ADD CONSTRAINT IF NOT EXISTS fk_loan_requests_clinic 
FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);

-- Atualizar owner_id baseado nos dados existentes
UPDATE public.clinics 
SET owner_id = (
  SELECT user_id 
  FROM public.profiles 
  WHERE role = 'clinic' 
  AND full_name = clinics.name 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- Função para atualizar rating das clínicas
CREATE OR REPLACE FUNCTION update_clinic_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE public.clinics 
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE clinic_id = NEW.clinic_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE clinic_id = NEW.clinic_id)
  WHERE id = NEW.clinic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar rating automaticamente
DROP TRIGGER IF EXISTS update_clinic_rating_trigger ON public.reviews;
CREATE TRIGGER update_clinic_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_clinic_rating();

-- Políticas RLS para a tabela clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinics: public read" ON public.clinics;
CREATE POLICY "Clinics: public read" 
ON public.clinics FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Clinics: owner modify" ON public.clinics;
CREATE POLICY "Clinics: owner modify" 
ON public.clinics FOR ALL 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());