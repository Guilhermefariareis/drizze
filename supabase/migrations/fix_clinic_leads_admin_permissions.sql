-- Fix clinic_leads table permissions for admin access
-- This migration addresses the permission errors in AdminCredentialing

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Admins podem ver todos os leads" ON clinic_leads;
DROP POLICY IF EXISTS "Admins podem atualizar leads" ON clinic_leads;

-- Create new policies using the reliable is_admin function
CREATE POLICY "Admins can view all clinic leads" ON clinic_leads
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update clinic leads" ON clinic_leads
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete clinic leads" ON clinic_leads
  FOR DELETE
  USING (public.is_admin());

-- Ensure proper permissions are granted
GRANT SELECT, INSERT ON clinic_leads TO anon;
GRANT ALL PRIVILEGES ON clinic_leads TO authenticated;

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'clinic_leads';