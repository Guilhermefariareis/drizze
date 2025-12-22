-- Migração para criar o sistema completo de solicitação de crédito
-- Baseado na documentação técnica do fluxo de crédito

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de pacientes (estendendo o sistema existente)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    monthly_income DECIMAL(10,2),
    employment_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clínicas
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários das clínicas
CREATE TABLE IF NOT EXISTS clinic_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'analyst',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, clinic_id)
);

-- Tabela de papéis de usuário
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'clinic', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Tabela principal de solicitações de crédito
CREATE TABLE credit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    requested_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    installments INTEGER NOT NULL,
    interest_rate DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'clinic_analysis', 'admin_review', 'approved', 'rejected', 'under_review')),
    treatment_description TEXT NOT NULL,
    clinic_comments TEXT,
    admin_comments TEXT,
    payment_conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos anexados
CREATE TABLE credit_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID NOT NULL REFERENCES credit_requests(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('cpf', 'income_proof', 'address_proof', 'photo', 'other')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de análises (clínica e administrativa)
CREATE TABLE credit_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID NOT NULL REFERENCES credit_requests(id) ON DELETE CASCADE,
    analyzer_id UUID NOT NULL REFERENCES auth.users(id),
    analyzer_type VARCHAR(20) NOT NULL CHECK (analyzer_type IN ('clinic', 'admin')),
    recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('approve', 'reject', 'review', 'request_docs')),
    comments TEXT,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credit_request_id UUID REFERENCES credit_requests(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_credit_requests_patient_id ON credit_requests(patient_id);
CREATE INDEX idx_credit_requests_clinic_id ON credit_requests(clinic_id);
CREATE INDEX idx_credit_requests_status ON credit_requests(status);
CREATE INDEX idx_credit_requests_created_at ON credit_requests(created_at DESC);

CREATE INDEX idx_credit_documents_request_id ON credit_documents(credit_request_id);
CREATE INDEX idx_credit_documents_type ON credit_documents(document_type);

CREATE INDEX idx_credit_analysis_request_id ON credit_analysis(credit_request_id);
CREATE INDEX idx_credit_analysis_analyzer ON credit_analysis(analyzer_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);

CREATE INDEX idx_clinic_users_user_id ON clinic_users(user_id);
CREATE INDEX idx_clinic_users_clinic_id ON clinic_users(clinic_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática
CREATE TRIGGER update_credit_requests_updated_at
    BEFORE UPDATE ON credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para credit_requests
CREATE POLICY "Patients can view own credit requests" ON credit_requests
    FOR SELECT USING (patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
    ));

CREATE POLICY "Patients can create credit requests" ON credit_requests
    FOR INSERT WITH CHECK (patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
    ));

CREATE POLICY "Clinics can view assigned credit requests" ON credit_requests
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Clinics can update assigned credit requests" ON credit_requests
    FOR UPDATE USING (clinic_id IN (
        SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all credit requests" ON credit_requests
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Políticas de segurança para credit_documents
CREATE POLICY "Users can view documents of their credit requests" ON credit_documents
    FOR SELECT USING (credit_request_id IN (
        SELECT cr.id FROM credit_requests cr
        LEFT JOIN patients p ON cr.patient_id = p.id
        LEFT JOIN clinic_users cu ON cr.clinic_id = cu.clinic_id
        WHERE p.user_id = auth.uid() OR cu.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    ));

CREATE POLICY "Patients can upload documents" ON credit_documents
    FOR INSERT WITH CHECK (credit_request_id IN (
        SELECT cr.id FROM credit_requests cr
        JOIN patients p ON cr.patient_id = p.id
        WHERE p.user_id = auth.uid()
    ));

-- Políticas de segurança para credit_analysis
CREATE POLICY "Users can view analysis of their credit requests" ON credit_analysis
    FOR SELECT USING (credit_request_id IN (
        SELECT cr.id FROM credit_requests cr
        LEFT JOIN patients p ON cr.patient_id = p.id
        LEFT JOIN clinic_users cu ON cr.clinic_id = cu.clinic_id
        WHERE p.user_id = auth.uid() OR cu.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    ));

CREATE POLICY "Clinics and admins can create analysis" ON credit_analysis
    FOR INSERT WITH CHECK (
        analyzer_id = auth.uid() AND (
            EXISTS (SELECT 1 FROM clinic_users WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
        )
    );

-- Políticas de segurança para notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas de segurança para patients
CREATE POLICY "Users can view own patient profile" ON patients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own patient profile" ON patients
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create own patient profile" ON patients
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clinics and admins can view patient profiles" ON patients
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM clinic_users WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Políticas de segurança para clinics
CREATE POLICY "Clinic users can view own clinic" ON clinics
    FOR SELECT USING (id IN (
        SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all clinics" ON clinics
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Políticas de segurança para clinic_users
CREATE POLICY "Users can view own clinic associations" ON clinic_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage clinic users" ON clinic_users
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Políticas de segurança para user_roles
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Dados iniciais para tipos de documento
INSERT INTO credit_documents (id, credit_request_id, document_type, file_url, file_name, verified)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'cpf',
    'placeholder',
    'placeholder',
    false
WHERE FALSE; -- Esta inserção não será executada, serve apenas como exemplo

-- Comentários nas tabelas
COMMENT ON TABLE credit_requests IS 'Tabela principal de solicitações de crédito';
COMMENT ON TABLE credit_documents IS 'Documentos anexados às solicitações de crédito';
COMMENT ON TABLE credit_analysis IS 'Análises realizadas pelas clínicas e administradores';
COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';
COMMENT ON TABLE patients IS 'Perfis de pacientes do sistema';
COMMENT ON TABLE clinics IS 'Clínicas cadastradas no sistema';
COMMENT ON TABLE clinic_users IS 'Associação entre usuários e clínicas';
COMMENT ON TABLE user_roles IS 'Papéis dos usuários no sistema';

-- Função para criar notificação automática
CREATE OR REPLACE FUNCTION create_credit_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar paciente sobre mudança de status
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO notifications (user_id, credit_request_id, type, title, message)
        SELECT 
            p.user_id,
            NEW.id,
            'status_change',
            'Status da Solicitação Atualizado',
            CASE NEW.status
                WHEN 'clinic_analysis' THEN 'Sua solicitação está sendo analisada pela clínica.'
                WHEN 'admin_review' THEN 'Sua solicitação foi encaminhada para análise administrativa.'
                WHEN 'approved' THEN 'Parabéns! Sua solicitação de crédito foi aprovada.'
                WHEN 'rejected' THEN 'Infelizmente sua solicitação foi rejeitada.'
                WHEN 'under_review' THEN 'Sua solicitação está em análise adicional.'
                ELSE 'Status da sua solicitação foi atualizado.'
            END
        FROM patients p
        WHERE p.id = NEW.patient_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificações automáticas
CREATE TRIGGER credit_request_notification_trigger
    AFTER UPDATE ON credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_credit_notification();