-- Restaurar campos básicos na tabela clinic_leads que foram removidos incorretamente
-- O formulário e o admin dependem destes campos

ALTER TABLE clinic_leads 
ADD COLUMN IF NOT EXISTS nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS nome_clinica VARCHAR(255),
ADD COLUMN IF NOT EXISTS especialidade VARCHAR(255),
ADD COLUMN IF NOT EXISTS mensagem TEXT;

-- Criar índices para os campos básicos
CREATE INDEX IF NOT EXISTS idx_clinic_leads_nome ON clinic_leads(nome);
CREATE INDEX IF NOT EXISTS idx_clinic_leads_nome_clinica ON clinic_leads(nome_clinica);
CREATE INDEX IF NOT EXISTS idx_clinic_leads_especialidade ON clinic_leads(especialidade);

-- Atualizar as políticas RLS para não depender da tabela auth.users
DROP POLICY IF EXISTS "Permitir inserção de leads" ON clinic_leads;
DROP POLICY IF EXISTS "Admins podem ver todos os leads" ON clinic_leads;
DROP POLICY IF EXISTS "Admins podem atualizar leads" ON clinic_leads;

-- Recriar políticas mais simples
CREATE POLICY "Permitir inserção de leads" ON clinic_leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de leads" ON clinic_leads
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir atualização de leads" ON clinic_leads
  FOR UPDATE
  USING (true);

-- Garantir permissões básicas
GRANT SELECT, INSERT ON clinic_leads TO anon;
GRANT ALL PRIVILEGES ON clinic_leads TO authenticated;

-- Verificar se RLS está habilitado
ALTER TABLE clinic_leads ENABLE ROW LEVEL SECURITY;