-- Corrigir funções com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.create_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    CASE NEW.status
        WHEN 'clinic_approved' THEN
            notification_title := 'Solicitação Aprovada pela Clínica';
            notification_message := 'Sua solicitação de empréstimo foi aprovada pela clínica e enviada para análise administrativa.';
        WHEN 'admin_review' THEN
            notification_title := 'Em Análise Administrativa';
            notification_message := 'Sua solicitação está sendo analisada pela equipe administrativa.';
        WHEN 'submitted_to_bank' THEN
            notification_title := 'Enviado para o Banco';
            notification_message := 'Sua solicitação foi enviada para análise do banco parceiro.';
        WHEN 'approved' THEN
            notification_title := 'Empréstimo Aprovado!';
            notification_message := 'Parabéns! Seu empréstimo foi aprovado pelo banco.';
        WHEN 'rejected' THEN
            notification_title := 'Solicitação Negada';
            notification_message := 'Infelizmente sua solicitação de empréstimo foi negada.';
        ELSE
            RETURN NEW;
    END CASE;

    INSERT INTO public.notifications (user_id, title, message, loan_request_id)
    VALUES (NEW.patient_id, notification_title, notification_message, NEW.id);

    INSERT INTO public.status_history (loan_request_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Corrigir a função handle_new_user existente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient')::public.user_type
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Corrigir outras funções existentes
CREATE OR REPLACE FUNCTION public.update_clinic_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clinics
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE clinic_id = NEW.clinic_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE clinic_id = NEW.clinic_id)
  WHERE id = NEW.clinic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_clinic_rating_function()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar a classificação média da clínica
    UPDATE public.clinics
    SET rating = (
        SELECT AVG(rating)
        FROM public.reviews
        WHERE clinic_id = NEW.clinic_id
    )
    WHERE id = NEW.clinic_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';