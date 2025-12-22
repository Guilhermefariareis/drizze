-- Create bucket for site assets (logos, images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true);

-- Create RLS policies for site assets bucket
CREATE POLICY "Public read access for site assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

-- Allow admins to upload site assets
CREATE POLICY "Admin upload access for site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'site-assets' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update site assets
CREATE POLICY "Admin update access for site assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'site-assets' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete site assets
CREATE POLICY "Admin delete access for site assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'site-assets' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);