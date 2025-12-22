-- Criar tabela para armazenar leads de clínicas
CREATE TABLE IF NOT EXISTS clinic_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  nome_clinica VARCHAR(255) NOT NULL,
  especialidade VARCHAR(255) NOT NULL,
  cidade VARCHAR(255) NOT NULL,
  mensagem TEXT,
  status VARCHAR(50) DEFAULT 'novo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clinic_leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos leads (público)
CREATE POLICY "Permitir inserção de leads" ON clinic_leads
  FOR INSERT
  WITH CHECK (true);

-- Política para admins visualizarem todos os leads
CREATE POLICY "Admins podem ver todos os leads" ON clinic_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política para admins atualizarem leads
CREATE POLICY "Admins podem atualizar leads" ON clinic_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Conceder permissões básicas
GRANT SELECT, INSERT ON clinic_leads TO anon;
GRANT ALL PRIVILEGES ON clinic_leads TO authenticated;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clinic_leads_email ON clinic_leads(email);
CREATE INDEX IF NOT EXISTS idx_clinic_leads_status ON clinic_leads(status);
CREATE INDEX IF NOT EXISTS idx_clinic_leads_created_at ON clinic_leads(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_clinic_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_clinic_leads_updated_at
  BEFORE UPDATE ON clinic_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_clinic_leads_updated_at();