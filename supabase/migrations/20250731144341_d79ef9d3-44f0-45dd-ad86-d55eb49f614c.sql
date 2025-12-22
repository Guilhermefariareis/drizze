-- Corrigir funções com search_path inseguro
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Esta é uma implementação básica. Em produção, use pgcrypto com chaves adequadas
  RETURN encode(digest(data_text, 'sha256'), 'hex');
END;
$$;

-- Função para descriptografar (básica)
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Esta é uma implementação básica. Em produção, use pgcrypto adequadamente
  RETURN '[DADOS CRIPTOGRAFADOS]';
END;
$$;

-- Corrigir função de log de acesso
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_user_id UUID,
  p_table_name TEXT,
  p_action_type TEXT,
  p_purpose TEXT DEFAULT 'Business operation',
  p_legal_basis TEXT DEFAULT 'Legitimate interest'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.data_access_logs (
    user_id,
    accessed_by,
    table_name,
    action_type,
    purpose,
    legal_basis
  )
  VALUES (
    p_user_id,
    auth.uid(),
    p_table_name,
    p_action_type,
    p_purpose,
    p_legal_basis
  );
END;
$$;