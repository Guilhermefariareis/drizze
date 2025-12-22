-- Adicionar campo de comissão para as clínicas
ALTER TABLE public.clinics 
ADD COLUMN commission_percentage NUMERIC(4,2) DEFAULT 3.5;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.clinics.commission_percentage IS 'Porcentagem de comissão que a clínica paga pela plataforma (ex: 2.5 = 2.5%)';

-- Atualizar algumas clínicas existentes com diferentes comissões para demonstração
UPDATE public.clinics 
SET commission_percentage = 2.5 
WHERE name ILIKE '%excellence%' OR name ILIKE '%premium%';

UPDATE public.clinics 
SET commission_percentage = 2.8 
WHERE name ILIKE '%care%' OR name ILIKE '%centro%';

UPDATE public.clinics 
SET commission_percentage = 3.0 
WHERE commission_percentage = 3.5;