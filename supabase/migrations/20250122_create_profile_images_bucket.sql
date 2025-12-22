-- Criar bucket para imagens de perfil de usuários e clínicas
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para leitura pública das imagens de perfil
CREATE POLICY "Public read access for profile images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-images');

-- Política para upload de imagens de perfil (usuários autenticados)
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (
    -- Usuários podem fazer upload de suas próprias imagens de avatar
    (name LIKE auth.uid()::text || '-avatar-%')
    OR
    -- Usuários podem fazer upload de logos de clínicas que possuem
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE (master_user_id = auth.uid() OR owner_id = auth.uid())
      AND name LIKE clinics.id::text || '-logo-%'
    )
  )
);

-- Política para atualização de imagens de perfil
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (
    -- Usuários podem atualizar suas próprias imagens de avatar
    (name LIKE auth.uid()::text || '-avatar-%')
    OR
    -- Usuários podem atualizar logos de clínicas que possuem
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE (master_user_id = auth.uid() OR owner_id = auth.uid())
      AND name LIKE clinics.id::text || '-logo-%'
    )
  )
);

-- Política para deletar imagens de perfil
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (
    -- Usuários podem deletar suas próprias imagens de avatar
    (name LIKE auth.uid()::text || '-avatar-%')
    OR
    -- Usuários podem deletar logos de clínicas que possuem
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE (master_user_id = auth.uid() OR owner_id = auth.uid())
      AND name LIKE clinics.id::text || '-logo-%'
    )
  )
);