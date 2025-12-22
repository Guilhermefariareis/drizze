-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Política para permitir upload de imagens para usuários autenticados
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Política para permitir visualização pública das imagens
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Authenticated users can update profile images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');

-- Política para permitir deletar para usuários autenticados
CREATE POLICY "Authenticated users can delete profile images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profile-images');

-- Garantir que o bucket seja público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-images';