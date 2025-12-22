-- Criar enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('patient', 'clinic', 'admin');

-- Criar enum para status de solicitação
CREATE TYPE public.loan_status AS ENUM ('pending', 'clinic_approved', 'admin_review', 'submitted_to_bank', 'approved', 'rejected', 'cancelled');

-- Criar enum para tipos de documento
CREATE TYPE public.document_type AS ENUM ('rg', 'cpf', 'comprovante_renda', 'comprovante_endereco', 'selfie', 'outros');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    cpf TEXT,
    birth_date DATE,
    user_type user_type NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de clínicas
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    razao_social TEXT,
    parcela_mais_id TEXT,
    phone TEXT,
    email TEXT,
    address_cep TEXT,
    address_uf TEXT,
    address_city TEXT,
    address_neighborhood TEXT,
    address_street TEXT,
    address_number TEXT,
    bank_account TEXT,
    bank_agency TEXT,
    bank_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de solicitações de empréstimo
CREATE TABLE public.loan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    amount_requested DECIMAL(12,2) NOT NULL,
    monthly_income DECIMAL(12,2),
    procedure_description TEXT,
    status loan_status DEFAULT 'pending',
    parcela_mais_proposal_id TEXT,
    parcela_mais_response JSONB,
    approved_amount DECIMAL(12,2),
    interest_rate DECIMAL(5,2),
    installments INTEGER,
    payment_link TEXT,
    approval_link TEXT,
    rejection_reason TEXT,
    clinic_approved_at TIMESTAMP WITH TIME ZONE,
    admin_reviewed_at TIMESTAMP WITH TIME ZONE,
    bank_response_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de documentos
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_request_id UUID REFERENCES public.loan_requests(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    loan_request_id UUID REFERENCES public.loan_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para armazenar tokens da API Parcela Mais
CREATE TABLE public.api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL DEFAULT 'parcela_mais',
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de histórico de status
CREATE TABLE public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_request_id UUID REFERENCES public.loan_requests(id) ON DELETE CASCADE,
    from_status loan_status,
    to_status loan_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Políticas RLS para clinics
CREATE POLICY "Clínicas podem ver seus próprios dados" ON public.clinics
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Clínicas podem atualizar seus próprios dados" ON public.clinics
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Admins podem ver todas as clínicas" ON public.clinics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Políticas RLS para loan_requests
CREATE POLICY "Pacientes podem ver suas próprias solicitações" ON public.loan_requests
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Pacientes podem criar solicitações" ON public.loan_requests
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Clínicas podem ver solicitações para elas" ON public.loan_requests
    FOR SELECT USING (
        clinic_id IN (
            SELECT id FROM public.clinics WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Clínicas podem aprovar solicitações" ON public.loan_requests
    FOR UPDATE USING (
        clinic_id IN (
            SELECT id FROM public.clinics WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem ver todas as solicitações" ON public.loan_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Políticas RLS para documents
CREATE POLICY "Usuários podem ver documentos de suas solicitações" ON public.documents
    FOR SELECT USING (
        loan_request_id IN (
            SELECT id FROM public.loan_requests 
            WHERE patient_id = auth.uid() 
            OR clinic_id IN (
                SELECT id FROM public.clinics WHERE profile_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Usuários podem fazer upload de documentos" ON public.documents
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Políticas RLS para notifications
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem marcar suas notificações como lidas" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas RLS para api_tokens (apenas admins)
CREATE POLICY "Apenas admins podem gerenciar tokens" ON public.api_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Políticas RLS para status_history
CREATE POLICY "Usuários podem ver histórico de suas solicitações" ON public.status_history
    FOR SELECT USING (
        loan_request_id IN (
            SELECT id FROM public.loan_requests 
            WHERE patient_id = auth.uid() 
            OR clinic_id IN (
                SELECT id FROM public.clinics WHERE profile_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON public.clinics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_requests_updated_at
    BEFORE UPDATE ON public.loan_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar notificação quando status muda
CREATE OR REPLACE FUNCTION public.create_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    CASE NEW.status
        WHEN 'clinic_approved' THEN
            notification_title := 'Solicitação Aprovada pela Clínica';
            notification_message := 'Sua solicitação de empréstimo foi aprovada pela clínica e enviada para análise administrativa.';
        WHEN 'admin_review' THEN
            notification_title := 'Em Análise Administrativa';
            notification_message := 'Sua solicitação está sendo analisada pela equipe administrativa.';
        WHEN 'submitted_to_bank' THEN
            notification_title := 'Enviado para o Banco';
            notification_message := 'Sua solicitação foi enviada para análise do banco parceiro.';
        WHEN 'approved' THEN
            notification_title := 'Empréstimo Aprovado!';
            notification_message := 'Parabéns! Seu empréstimo foi aprovado pelo banco.';
        WHEN 'rejected' THEN
            notification_title := 'Solicitação Negada';
            notification_message := 'Infelizmente sua solicitação de empréstimo foi negada.';
        ELSE
            RETURN NEW;
    END CASE;

    INSERT INTO public.notifications (user_id, title, message, loan_request_id)
    VALUES (NEW.patient_id, notification_title, notification_message, NEW.id);

    INSERT INTO public.status_history (loan_request_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificações automáticas
CREATE TRIGGER on_loan_status_change
    AFTER UPDATE OF status ON public.loan_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.create_status_notification();