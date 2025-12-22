-- Corrigir avisos de segurança adicionando search_path nas funções

-- Função para verificar roles com search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Função para atualizar updated_at com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Função para criar perfil automaticamente com search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para atualizar rating das clínicas com search_path
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
$$ LANGUAGE plpgsql SET search_path = public;