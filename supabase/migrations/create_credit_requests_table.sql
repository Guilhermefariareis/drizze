-- Criar tabela para solicitações de crédito odontológico
CREATE TABLE IF NOT EXISTS credit_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Dados da solicitação
  requested_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  installments INTEGER NOT NULL DEFAULT 12,
  interest_rate DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'clinic_analysis', 'admin_review', 'approved', 'rejected', 'under_review')),
  treatment_description TEXT NOT NULL,
  
  -- Comentários e análises
  clinic_comments TEXT,
  admin_comments TEXT,
  payment_conditions JSONB,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_credit_requests_patient_id ON credit_requests(patient_id);
CREATE INDEX idx_credit_requests_clinic_id ON credit_requests(clinic_id);
CREATE INDEX idx_credit_requests_status ON credit_requests(status);
CREATE INDEX idx_credit_requests_created_at ON credit_requests(created_at);

-- RLS (Row Level Security)
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- Política para pacientes: podem ver apenas suas próprias solicitações
CREATE POLICY "Patients can view own credit requests" ON credit_requests
  FOR SELECT USING (auth.uid() = patient_id);

-- Política para pacientes: podem criar suas próprias solicitações
CREATE POLICY "Patients can create own credit requests" ON credit_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Política para clínicas: podem ver solicitações direcionadas a elas
CREATE POLICY "Clinics can view their credit requests" ON credit_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE clinics.id = credit_requests.clinic_id 
      AND clinics.user_id = auth.uid()
    )
  );

-- Política para clínicas: podem atualizar status e observações das suas solicitações
CREATE POLICY "Clinics can update their credit requests" ON credit_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE clinics.id = credit_requests.clinic_id 
      AND clinics.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_credit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_credit_requests_updated_at_trigger
  BEFORE UPDATE ON credit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_requests_updated_at();

-- Conceder permissões para roles anon e authenticated
GRANT SELECT, INSERT ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;