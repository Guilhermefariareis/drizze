-- Corrigir campos numéricos para evitar overflow e criar bucket de storage

-- 1. Alterar campos numéricos para usar precisão adequada
ALTER TABLE clinic_leads 
ALTER COLUMN ticket_medio TYPE NUMERIC(10,2);

ALTER TABLE clinic_leads 
ALTER COLUMN faturamento_mensal TYPE NUMERIC(12,2);

ALTER TABLE clinic_leads 
ALTER COLUMN valor_credito TYPE NUMERIC(10,2);

-- 2. Criar bucket para documentos das clínicas no Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-documents',
  'clinic-documents', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- 3. Configurar políticas de acesso para o bucket
CREATE POLICY "Allow public uploads to clinic-documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'clinic-documents');

CREATE POLICY "Allow public access to clinic-documents" ON storage.objects
FOR SELECT USING (bucket_id = 'clinic-documents');

-- 4. Comentários explicativos
COMMENT ON COLUMN clinic_leads.ticket_medio IS 'Ticket médio dos procedimentos - NUMERIC(10,2) para valores até 99.999.999,99';
COMMENT ON COLUMN clinic_leads.faturamento_mensal IS 'Faturamento mensal da clínica - NUMERIC(12,2) para valores até 9.999.999.999,99';
COMMENT ON COLUMN clinic_leads.valor_credito IS 'Valor do crédito disponível - NUMERIC(10,2) para valores até 99.999.999,99';