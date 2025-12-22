-- Adicionar campos editáveis para informações dinâmicas das clínicas
-- Para evitar dados falsos e permitir que cada clínica edite suas próprias informações

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS years_in_market INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS patients_served INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS experience_description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recommendation_percentage DECIMAL(5,2) DEFAULT NULL;

-- Comentários para documentar os campos
COMMENT ON COLUMN public.clinics.years_in_market IS 'Número de anos que a clínica está no mercado (editável pela clínica)';
COMMENT ON COLUMN public.clinics.patients_served IS 'Número total de pacientes atendidos (editável pela clínica)';
COMMENT ON COLUMN public.clinics.experience_description IS 'Descrição da experiência e tradição da clínica (editável pela clínica)';
COMMENT ON COLUMN public.clinics.recommendation_percentage IS 'Porcentagem de recomendação calculada automaticamente baseada nas avaliações';

-- Função para calcular porcentagem de recomendação baseada nas avaliações
CREATE OR REPLACE FUNCTION public.calculate_recommendation_percentage(clinic_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_reviews_count INTEGER;
    positive_reviews_count INTEGER;
    recommendation_pct DECIMAL(5,2);
BEGIN
    -- Contar total de avaliações
    SELECT COUNT(*) INTO total_reviews_count
    FROM public.reviews 
    WHERE clinic_id = clinic_uuid;
    
    -- Se não há avaliações, retornar NULL
    IF total_reviews_count = 0 THEN
        RETURN NULL;
    END IF;
    
    -- Contar avaliações positivas (4 e 5 estrelas)
    SELECT COUNT(*) INTO positive_reviews_count
    FROM public.reviews 
    WHERE clinic_id = clinic_uuid AND rating >= 4;
    
    -- Calcular porcentagem
    recommendation_pct := (positive_reviews_count::DECIMAL / total_reviews_count::DECIMAL) * 100;
    
    RETURN ROUND(recommendation_pct, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar automaticamente a porcentagem de recomendação
CREATE OR REPLACE FUNCTION public.update_clinic_recommendation()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar a porcentagem de recomendação da clínica
    UPDATE public.clinics 
    SET recommendation_percentage = public.calculate_recommendation_percentage(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.clinic_id
            ELSE NEW.clinic_id
        END
    )
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.clinic_id
        ELSE NEW.clinic_id
    END;
    
    RETURN CASE 
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar porcentagem de recomendação automaticamente
DROP TRIGGER IF EXISTS update_clinic_recommendation_trigger ON public.reviews;
CREATE TRIGGER update_clinic_recommendation_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_clinic_recommendation();

-- Atualizar porcentagens existentes para clínicas que já têm avaliações
UPDATE public.clinics 
SET recommendation_percentage = public.calculate_recommendation_percentage(id)
WHERE id IN (SELECT DISTINCT clinic_id FROM public.reviews);