-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true) 
ON CONFLICT (id) DO NOTHING;

-- Create policies for site assets
CREATE POLICY "Site assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can upload site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update site assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete site assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');