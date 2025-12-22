-- Apenas inserir um perfil de admin para o usuário master se não existir
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