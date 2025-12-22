CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir/atualizar perfil de forma resiliente (evita quebrar signup)
  INSERT INTO public.profiles (id, user_id, email, full_name, role)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE
      WHEN NEW.email = 'master@doutorizze.com.br' THEN 'admin'::user_role
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'clinic' THEN 'clinic'::user_role
      ELSE 'patient'::user_role
    END
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;

EXCEPTION
  WHEN unique_violation THEN
    -- Se houve conflito por email único, atualiza registro existente por email
    UPDATE public.profiles p
    SET user_id = NEW.id,
        full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        role = CASE
          WHEN NEW.email = 'master@doutorizze.com.br' THEN 'admin'::user_role
          WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'clinic' THEN 'clinic'::user_role
          ELSE 'patient'::user_role
        END,
        updated_at = now()
    WHERE p.email = NEW.email;

    RETURN NEW;
  WHEN OTHERS THEN
    -- Qualquer outra condição não deve impedir criação do usuário
    RETURN NEW;
END;
$$;