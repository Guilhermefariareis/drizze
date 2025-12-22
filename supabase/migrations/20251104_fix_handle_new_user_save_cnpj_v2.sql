-- Corrige handle_new_user: usa apenas colunas existentes em public.clinics
-- Remove colunas inexistentes (state, zip_code) e corrige tipo de address (jsonb)

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

  -- Se o usuário é uma clínica, criar registros automáticos
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'clinic' THEN
    clinic_id_var := gen_random_uuid();

    -- Limpar CNPJ
    IF NEW.raw_user_meta_data ->> 'cnpj' IS NOT NULL THEN
      cnpj_clean := regexp_replace(NEW.raw_user_meta_data ->> 'cnpj', '\\D', '', 'g');
    ELSE
      cnpj_clean := NULL;
    END IF;

    -- Inserir na tabela clinics usando apenas colunas existentes e tipos corretos
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

    -- Criar registro na tabela clinic_profiles
    INSERT INTO public.clinic_profiles (
      clinic_id,
      description,
      opening_hours,
      specialties,
      payment_methods
    ) VALUES (
      clinic_id_var,
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_description', 'Clínica odontológica especializada'),
      COALESCE((NEW.raw_user_meta_data ->> 'opening_hours')::jsonb, '{}'::jsonb),
      CASE
        WHEN NEW.raw_user_meta_data ->> 'clinic_specialty' IS NOT NULL
        THEN ARRAY[NEW.raw_user_meta_data ->> 'clinic_specialty']
        ELSE ARRAY['Odontologia Geral']
      END,
      ARRAY['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX']
    );

    -- Dados sensíveis (criptografado)
    IF cnpj_clean IS NOT NULL OR NEW.raw_user_meta_data ->> 'license_number' IS NOT NULL THEN
      INSERT INTO public.clinic_sensitive_data (
        clinic_id,
        cnpj_encrypted,
        license_number_encrypted
      ) VALUES