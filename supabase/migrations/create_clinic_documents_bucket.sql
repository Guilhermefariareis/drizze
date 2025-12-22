-- Criar bucket para documentos das clínicas
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-documents', 'clinic-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS no storage.objects se não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow public uploads to clinic-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to clinic-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to clinic-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from clinic-documents" ON storage.objects;

-- Política para permitir upload de documentos
CREATE POLICY "Allow public uploads to clinic-documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'clinic-documents');

-- Política para permitir visualização pública dos documentos
CREATE POLICY "Allow public access to clinic-documents" ON storage.objects
FOR SELECT USING (bucket_id = 'clinic-documents');

-- Política para permitir atualização dos documentos
CREATE POLICY "Allow public updates to clinic-documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'clinic-documents');

-- Política para permitir exclusão dos documentos
CREATE POLICY "Allow public deletes from clinic-documents" ON storage.objects
FOR DELETE USING (bucket_id = 'clinic-documents');