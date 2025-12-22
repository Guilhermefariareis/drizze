-- Adicionar todos os campos faltantes na tabela clinic_leads
-- Baseado nos campos coletados no MultiStepContactForm

-- Adicionar campos da Etapa 1 (Dados da Clínica)
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS razao_social VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS cnpj VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS cro_responsavel VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS carteirinha_cro_url VARCHAR; -- URL da imagem da carteirinha
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS instagram VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS site VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS uf VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS bairro VARCHAR;

-- Adicionar campos da Etapa 2 (Perfil da Clínica)
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS numero_cadeiras INTEGER;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS orcamentos_mes INTEGER;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS ticket_medio DECIMAL(10,2);
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS faturamento_mensal DECIMAL(12,2);
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS local_clinica VARCHAR;

-- Adicionar campos da Etapa 3 (Crédito e Outros Serviços)
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS tem_credito BOOLEAN DEFAULT false;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS valor_credito DECIMAL(12,2);
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS banco_credito VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS tem_outros_servicos BOOLEAN DEFAULT false;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS outros_servicos TEXT;

-- Adicionar campos da Etapa 4 (Dados de Contato) - alguns já existem
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS cargo VARCHAR;
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS como_conheceu VARCHAR;

-- Adicionar campos para especialidades (array de strings)
ALTER TABLE clinic_leads ADD COLUMN IF NOT EXISTS especialidades TEXT[]; -- Array de especialidades

-- Comentários para documentação
COMMENT ON COLUMN clinic_leads.razao_social IS 'Razão social da clínica';
COMMENT ON COLUMN clinic_leads.cnpj IS 'CNPJ da clínica';
COMMENT ON COLUMN clinic_leads.nome_fantasia IS 'Nome fantasia da clínica';
COMMENT ON COLUMN clinic_leads.cro_responsavel IS 'CRO do responsável técnico';
COMMENT ON COLUMN clinic_leads.carteirinha_cro_url IS 'URL da imagem da carteirinha CRO';
COMMENT ON COLUMN clinic_leads.numero_cadeiras IS 'Número de cadeiras odontológicas';
COMMENT ON COLUMN clinic_leads.orcamentos_mes IS 'Número de orçamentos por mês';
COMMENT ON COLUMN clinic_leads.ticket_medio IS 'Ticket médio dos procedimentos';
COMMENT ON COLUMN clinic_leads.faturamento_mensal IS 'Faturamento mensal da clínica';
COMMENT ON COLUMN clinic_leads.local_clinica IS 'Localização da clínica (centro, bairro, etc.)';
COMMENT ON COLUMN clinic_leads.tem_credito IS 'Se a clínica possui crédito';
COMMENT ON COLUMN clinic_leads.valor_credito IS 'Valor do crédito disponível';
COMMENT ON COLUMN clinic_leads.banco_credito IS 'Banco onde possui crédito';
COMMENT ON COLUMN clinic_leads.tem_outros_servicos IS 'Se utiliza outros serviços';
COMMENT ON COLUMN clinic_leads.outros_servicos IS 'Descrição dos outros serviços';
COMMENT ON COLUMN clinic_leads.cargo IS 'Cargo do responsável pelo contato';
COMMENT ON COLUMN clinic_leads.como_conheceu IS 'Como conheceu a Doutorizze';
COMMENT ON COLUMN clinic_leads.especialidades IS 'Array de especialidades da clínica';

-- Atualizar dados existentes extraindo informações do campo mensagem
-- (Isso será feito manualmente ou com script específico se necessário)

-- Garantir permissões para os novos campos
GRANT SELECT, INSERT, UPDATE ON clinic_leads TO anon;
GRANT SELECT, INSERT, UPDATE ON clinic_leads TO authenticated;