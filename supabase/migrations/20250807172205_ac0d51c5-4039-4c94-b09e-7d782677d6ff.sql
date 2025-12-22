-- Remove políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinics can view patient profiles" ON public.profiles;

-- Remover políticas duplicadas
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Criar função segura para verificar roles sem recursão
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Política para admins usando a função segura
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN false
    WHEN public.get_user_role(auth.uid()) = 'admin' THEN true
    ELSE auth.uid() = user_id
  END
);

-- Política para clínicas visualizarem pacientes
CREATE POLICY "Clinics can view patient profiles" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN false
    WHEN public.get_user_role(auth.uid()) = 'clinic' AND role = 'patient' THEN true
    ELSE auth.uid() = user_id
  END
);

-- Inserir um perfil de admin para o usuário master se não existir
INSERT INTO public.profiles (user_id, email, full_name, role, created_at, updated_at)
SELECT 
  '4c407554-e384-4a0c-a591-f56a6109b6a6'::uuid,
  'master@doutorizze.com.br',
  'Admin Master',
  'admin'::user_role,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = '4c407554-e384-4a0c-a591-f56a6109b6a6'
);

-- Garantir que a função de criação de perfil também funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role),
    now(),
    now()
  );
  RETURN NEW;
END;
$$;