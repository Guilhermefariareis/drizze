-- Atualizar função handle_new_user para persistir CNPJ em public.clinics
-- Garante que o CNPJ presente nos metadados do usuário seja salvo em clinics.cnpj

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
AS $function$
DECLARE
  clinic_id_var uuid;
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
    -- Gerar ID para a clínica
    clinic_id_var := gen_random_uuid();
    
    -- Criar registro na tabela clinics
    INSERT INTO public.clinics (
      id,
      owner_id,
      name,
      description,
      address,
      city,
      state,
      zip_code,
      phone,
      email,
      is_active
    ) VALUES (
      clinic_id_var,
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_name', 'Nova Clínica'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_description', 'Clínica odontológica'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_address', 'Endereço não informado'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_city', 'Cidade não informada'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_state', 'Estado não informado'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_zip_code', '00000-000'),
      COALESCE(NEW.raw_user_meta_data ->> 'clinic_phone', 'Telefone não informado'),
      NEW.email,
      true
    );

    -- Se houver CNPJ nos metadados, salvar também em clinics.cnpj
    IF NEW.raw_user_meta_data ->> 'cnpj' IS NOT NULL THEN
      UPDATE public.clinics
      SET cnpj = regexp_replace(NEW.raw_user_meta_data ->> 'cnpj', '\\D', '', 'g')
      WHERE id = clinic_id_var;
    END IF;

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

    -- Se houver dados sensíveis, criar registro na tabela clinic_sensitive_data
    IF NEW.raw_user_meta_data ->> 'cnpj' IS NOT NULL OR 
       NEW.raw_user_meta_data ->> 'license_number' IS NOT NULL THEN
      INSERT INTO public.clinic_sensitive_data (
        clinic_id,
        cnpj_encrypted,
        license_number_encrypted
      ) VALUES (
        clinic_id_var,
        CASE 
          WHEN NEW.raw_user_meta_data ->> 'cnpj' IS NOT NULL 
          THEN encrypt_sensitive_data(NEW.raw_user_meta_data ->> 'cnpj')
          ELSE NULL
        END,
        CASE 
          WHEN NEW.raw_user_meta_data ->> 'license_number' IS NOT NULL