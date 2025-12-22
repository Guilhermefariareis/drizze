-- Adicionar usuário admin master@doutorizze.com.br
-- Como o usuário precisa se registrar via Supabase Auth primeiro, 
-- vamos criar uma função que será executada quando ele se registrar

-- Inserir ou atualizar o perfil como admin para o email master@doutorizze.com.br
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data ->> 'full_name', 'Master Admin'),
  'admin'::user_role
FROM auth.users 
WHERE email = 'master@doutorizze.com.br'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin'::user_role,
  updated_at = now();

-- Atualizar a função handle_new_user para detectar o email admin automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'master@doutorizze.com.br' THEN 'admin'::user_role
      ELSE 'patient'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;