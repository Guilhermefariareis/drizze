-- Atualizar função para tratar diferentes tipos de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
  RETURN NEW;
END;
$$;

-- Criar tabela para dados sensíveis criptografados
CREATE TABLE IF NOT EXISTS public.user_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf_encrypted TEXT,
  rg_encrypted TEXT,
  birth_date_encrypted TEXT,
  address_encrypted TEXT,
  medical_history_encrypted TEXT,
  emergency_contact_encrypted TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  data_processing_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_consent_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para dados sensíveis
CREATE POLICY "Users can view their own sensitive data"
  ON public.user_sensitive_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensitive data"
  ON public.user_sensitive_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sensitive data"
  ON public.user_sensitive_data
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sensitive data"
  ON public.user_sensitive_data
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Criar tabela para dados específicos de clínicas
CREATE TABLE IF NOT EXISTS public.clinic_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  cnpj_encrypted TEXT,
  license_number_encrypted TEXT,
  tax_info_encrypted TEXT,
  bank_info_encrypted TEXT,
  insurance_info_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clinic_id)
);

-- Habilitar RLS para dados de clínicas
ALTER TABLE public.clinic_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Políticas para dados de clínicas
CREATE POLICY "Clinic owners can manage their sensitive data"
  ON public.clinic_sensitive_data
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE clinics.id = clinic_sensitive_data.clinic_id 
    AND clinics.owner_id = auth.uid()
  ));

CREATE POLICY "Admins can view all clinic sensitive data"
  ON public.clinic_sensitive_data
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Criar tabela de auditoria para LGPD
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  purpose TEXT,
  legal_basis TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Habilitar RLS para logs de auditoria
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para logs de auditoria
CREATE POLICY "Users can view their own access logs"
  ON public.data_access_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all access logs"
  ON public.data_access_logs
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Criar função para registrar acesso a dados sensíveis
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

-- Criar tabela para consentimentos LGPD
CREATE TABLE IF NOT EXISTS public.lgpd_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('privacy_policy', 'terms_of_service', 'data_processing', 'marketing', 'cookies')),
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  consent_version TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para consentimentos
ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;

-- Políticas para consentimentos
CREATE POLICY "Users can view their own consents"
  ON public.lgpd_consents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.lgpd_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON public.lgpd_consents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
  ON public.lgpd_consents
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Trigger para atualizar timestamp
CREATE TRIGGER update_user_sensitive_data_updated_at
  BEFORE UPDATE ON public.user_sensitive_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_sensitive_data_updated_at
  BEFORE UPDATE ON public.clinic_sensitive_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para criptografia (básica - deve ser melhorada com chaves reais)
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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
AS $$
BEGIN
  -- Esta é uma implementação básica. Em produção, use pgcrypto adequadamente
  RETURN '[DADOS CRIPTOGRAFADOS]';
END;
$$;