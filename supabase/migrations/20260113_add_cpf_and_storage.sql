-- Add CPF column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cpf') THEN
        ALTER TABLE public.profiles ADD COLUMN cpf TEXT;
    END IF;
END $$;

-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage.objects if not enabled (usually is)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies for Avatars
-- 1. Everyone can view avatars
DROP POLICY IF EXISTS "Public Access to Avatars" ON storage.objects;
CREATE POLICY "Public Access to Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 2. Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

-- 3. Users can update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid() = owner
  );
