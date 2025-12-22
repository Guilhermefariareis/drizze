-- Ajuste de trigger: grava CNPJ em clinics e evita falhas de cadastro
-- Trata conflitos de unicidade em cnpj/email sem abortar signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  clinic_id_var uuid;
  cnpj_clean text;
  inserted boolean;
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

  -- Se o usuário é uma clínica, criar/associar registro em clinics
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'clinic' THEN
    clinic_id_var := gen_random_uuid();

    -- Limpar CNPJ
    IF NEW.raw_user_meta_data ->> 'cnpj' IS NOT NULL THEN
      cnpj_clean := regexp_replace(NEW.raw_user_meta_data ->> 'cnpj', '\\D', '', 'g');
    ELSE
      cnpj_clean := NULL;
    END IF;

    inserted := false;

    -- Tentativa principal: inserir com conflito silencioso em cnpj
    BEGIN
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
      ) ON CONFLICT (cnpj) DO NOTHING;
      GET DIAGNOSTICS inserted = ROW_COUNT;
    EXCEPTION WHEN unique_violation THEN
      -- Conflito por email ou outra unique: segue fluxo buscando registro
      inserted := false;
    END;

    -- Se não inseriu, buscar clínica existente por cnpj ou email
    IF NOT inserted THEN
      SELECT id INTO clinic_id_var
      FROM public.clinics
      WHERE (cnpj IS NOT NULL AND cnpj = cnpj_clean) OR email = NEW.email
      LIMIT 1;

      -- Se ainda não encontrou, tentar inserir com conflito silencioso por email
      IF clinic_id_var IS NULL THEN
        BEGIN
          clinic_id_var := gen_random_uuid();
          INSERT INTO public.clinics (
            id, owner_id, name, description, city, phone, email, is_active, cnpj, address
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
          ) ON CONFLICT (email) DO NOTHING;
          GET DIAGNOSTICS inserted = ROW_COUNT;
        EXCEPTION WHEN unique_violation THEN
          inserted := false;
        END;

        IF NOT inserted THEN
          SELECT id INTO clinic_id_var FROM public.clinics WHERE email = NEW.email LIMIT 1;
        END IF;
      END IF;
    END IF;

    -- Inserir dados auxiliares apenas se tiver clinic_id
    IF clinic_id_var IS NOT NULL THEN
      -- Perfil da clínica (se tabela existir), evitar duplicidade
      IF to_regclass('public.clinic_profiles') IS NOT NULL THEN
        INSERT INTO public.clinic_profiles (clinic_id, description)
        VALUES (
          clinic_id_var,
          COALESCE(NEW.raw_user_meta_data ->> 'clinic_description', 'Clínica odontológica especializada')
        ) ON CONFLICT (clinic_id) DO NOTHING;
      END IF;

      -- Dados sensíveis (se tabela existir), upsert por clinic