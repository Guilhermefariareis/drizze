-- Adicionar campos faltantes na tabela clinic_leads para compatibilizar com o formulário
ALTER TABLE clinic_leads 
ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255),
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20),
ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255),
ADD COLUMN IF NOT EXISTS uf VARCHAR(2),
ADD COLUMN IF NOT EXISTS numero_cadeiras INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS cro_responsavel VARCHAR(50),
ADD COLUMN IF NOT EXISTS instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS site VARCHAR(255),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(255),
ADD COLUMN IF NOT EXISTS orcamentos_mes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticket_medio VARCHAR(50),
ADD COLUMN IF NOT EXISTS faturamento VARCHAR(50),
ADD COLUMN IF NOT EXISTS local_clinica VARCHAR(255),
ADD COLUMN IF NOT EXISTS oferece_credito_hoje VARCHAR(50),
ADD COLUMN IF NOT EXISTS percentual_orcamentos_perdidos VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferencia_repasse VARCHAR(255),
ADD COLUMN IF NOT EXISTS trajeto_pago VARCHAR(50),
ADD COLUMN IF NOT EXISTS possui_contador VARCHAR(50),
ADD COLUMN IF NOT EXISTS nome_responsavel VARCHAR(255),
ADD COLUMN IF NOT EXISTS cargo VARCHAR(255),
ADD COLUMN IF NOT EXISTS aceita_lgpd BOOLEAN DEFAULT false;

-- Remover campos antigos que não são mais usados
ALTER TABLE clinic_leads 
DROP COLUMN IF EXISTS nome,
DROP COLUMN IF EXISTS telefone,
DROP COLUMN IF EXISTS nome_clinica,
DROP COLUMN IF EXISTS especialidade,
DROP COLUMN IF EXISTS mensagem;

-- Criar índices para os novos campos importantes
CREATE INDEX IF NOT EXISTS idx_clinic_leads_cnpj ON clinic_leads(cnpj);
CREATE INDEX IF NOT EXISTS idx_clinic_leads_uf ON clinic_leads(uf);
CREATE INDEX IF NOT EXISTS idx_clinic_leads_razao_social ON clinic_leads(razao_social);

-- Atualizar as políticas RLS para usar os novos campos
DROP POLICY IF EXISTS "Permitir inserção de leads" ON clinic_leads;
DROP POLICY IF EXISTS "Admins podem ver todos os leads" ON clinic_leads;
DROP POLICY IF EXISTS "Admins podem atualizar leads" ON clinic_leads;

-- Recriar políticas
CREATE POLICY "Permitir inserção de leads" ON clinic_leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os leads" ON clinic_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar leads" ON clinic_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Garantir permissões
GRANT SELECT, INSERT ON clinic_leads TO anon;
GRANT ALL PRIVILEGES ON clinic_leads TO authenticated;