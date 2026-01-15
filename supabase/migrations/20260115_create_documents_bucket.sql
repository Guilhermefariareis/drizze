-- Create 'documents' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage.objects if not enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies for Documents
-- 1. Everyone can view documents (if needed, or restrict to owners/admins)
DROP POLICY IF EXISTS "Public Access to Documents" ON storage.objects;
CREATE POLICY "Public Access to Documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- 2. Authenticated users can upload to 'documents'
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- 3. Users can update their own documents
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND 
    auth.uid() = owner
  );

-- 4. Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid() = owner
  );
