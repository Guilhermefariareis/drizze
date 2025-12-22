-- Criar função para sincronizar perfis automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, role, account_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    'patient',
    'paciente',
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentário explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 'Função que cria automaticamente um perfil na tabela profiles quando um usuário é criado em auth.users';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger que executa handle_new_user() após inserção de novo usuário';

-- Verificar se o trigger foi criado
SELECT 
    'Trigger criado com sucesso:' as status,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';