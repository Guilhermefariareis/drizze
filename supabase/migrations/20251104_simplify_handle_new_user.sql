-- Simplificar handle_new_user: inserir apenas em public.profiles e public.clinics
-- Evita inserções em tabelas ausentes e reduz complexidade

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  clinic_id_var uuid;
  cnpj_clean text;
BEGIN
  -- Inserir perfil básico
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE
      WHEN NEW.email = 'master@doutorizze.com.br' THEN 'admin'::user_role
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'clinic' THEN 'clinic'::user_role
      ELSE 'patient'::user_role
    END
  );

  -- Se o usuário é uma clínica, criar registro essencial
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'clinic' THEN
    clinic_id_var := gen_random_uuid();

    -- Limpar CNPJ (apenas dígitos)
    IF NEW.raw_user_meta_data ->> 'cnpj' IS NOT NULL THEN
      cnpj_clean := regexp_replace(NEW.raw_user_meta_data ->> 'cnpj', '\\D', '', 'g');
    ELSE
      cnpj_clean := NULL;
    END IF;

    -- Inserir na tabela clinics (apenas colunas existentes)
    INSERT INTO public.clinics (
      id,
      owner_id,
      name,
      description,
      city,
      phone,
      email,
      is_active,
      cnpj,
      address
    ) VALUES (
      clinic_id_var,
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_name', 'Nova Clínica'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_description', 'Clínica odontológica'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_city', NULL),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_phone', NULL),
      NEW.email,
      true,
      cnpj_clean,
      '{}'::jsonb
    );

    -- Opcional: criar perfil da clínica só se a tabela existir
    IF to_regclass('public.clinic_profiles') IS NOT NULL THEN
      INSERT INTO public.clinic_profiles (clinic_id, description)
      VALUES (
        clinic_id_var,
        COALESCE(