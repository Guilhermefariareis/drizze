-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Public read access for site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access for site assets" ON storage.objects;  
DROP POLICY IF EXISTS "Admin update access for site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for site assets" ON storage.objects;

-- Recriar políticas para site assets com verificação melhorada
CREATE POLICY "Public read access for site assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

-- Permitir que admins façam upload de arquivos
CREATE POLICY "Admin upload access for site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'site-assets' 
  AND (
    -- Verificar se é admin via função
    is_admin_user() 
    OR 
    -- Verificar se é admin via profiles 
    auth.uid() IN (
      SELECT user_id FROM profiles 
      WHERE role = 'admin'
    )
  )
);

-- Permitir que admins atualizem arquivos
CREATE POLICY "Admin update access for site assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'site-assets' 
  AND (
    is_admin_user() 
    OR 
    auth.uid() IN (
      SELECT user_id FROM profiles 
      WHERE role = 'admin'
    )
  )
);

-- Permitir que admins deletem arquivos  
CREATE POLICY "Admin delete access for site assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'site-assets' 
  AND (
    is_admin_user() 
    OR 
    auth.uid() IN (
      SELECT user_id FROM profiles 
      WHERE role = 'admin'
    )
  )
);