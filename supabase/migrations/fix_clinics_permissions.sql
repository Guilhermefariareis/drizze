-- Fix clinics table permissions for patient credit request functionality
-- This migration ensures that anonymous users can read clinics data

-- Grant basic permissions to anon and authenticated roles
GRANT SELECT ON public.clinics TO anon;
GRANT SELECT, UPDATE ON public.clinics TO authenticated;

-- Create policy to allow anonymous read access to clinics
DROP POLICY IF EXISTS "Public can view clinics" ON public.clinics;

CREATE POLICY "Public can view clinics" 
ON public.clinics 
FOR SELECT 
TO anon 
USING (true);

-- Create policy for authenticated users to view clinics
DROP POLICY IF EXISTS "Authenticated can view clinics" ON public.clinics;

CREATE POLICY "Authenticated can view clinics" 
ON public.clinics 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy for authenticated users to update their own clinics
DROP POLICY IF EXISTS "Users can update their own clinics" ON public.clinics;

CREATE POLICY "Users can update their own clinics" 
ON public.clinics 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id OR auth.uid() = master_user_id)
WITH CHECK (auth.uid() = owner_id OR auth.uid() = master_user_id);

-- Verify permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'clinics' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;