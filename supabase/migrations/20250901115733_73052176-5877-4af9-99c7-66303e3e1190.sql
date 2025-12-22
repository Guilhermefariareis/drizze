-- Fix RLS policy for site_configurations table to use proper admin check
DROP POLICY IF EXISTS "Only admins can manage site configurations" ON public.site_configurations;

CREATE POLICY "Only admins can manage site configurations" 
ON public.site_configurations 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());