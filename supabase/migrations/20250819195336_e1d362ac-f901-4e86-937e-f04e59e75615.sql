-- Adicionar colunas faltantes na tabela clinics
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS owner_id uuid,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS agenda_link_url text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS website text;

-- Adicionar foreign key para payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS clinic_id uuid;

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
CREATE OR REPLACE FUNCTION public.update_clinic_rating()
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

-- Políticas RLS para a tabela clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics: public read" 
ON public.clinics FOR SELECT 
USING (true);

CREATE POLICY "Clinics: owner modify" 
ON public.clinics FOR ALL 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());