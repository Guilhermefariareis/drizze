-- Migração para desabilitar confirmação de email obrigatória
-- Esta migração permite que usuários façam login sem confirmar email

-- Atualizar todos os usuários existentes para marcar email como confirmado
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Criar função para automaticamente confirmar email de novos usuários
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Automaticamente confirmar email para novos usuários
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para auto-confirmar email de novos usuários
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user_email();

-- Comentário explicativo
COMMENT ON FUNCTION public.auto_confirm_user_email() IS 'Função que automaticamente confirma o email de novos usuários para simplificar o fluxo de cadastro';