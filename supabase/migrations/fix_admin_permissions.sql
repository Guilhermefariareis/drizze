-- Fix admin permissions and add missing functions
-- This migration addresses the permission errors in AdminLoginPage and AdminCredentialing

-- 1. Create is_admin function for easier admin checking
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- 2. Grant permissions to anon and authenticated roles for users table (auth.users)
-- Note: The auth.users table is managed by Supabase Auth, but we need to grant read permissions
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;

-- 3. Add admin policies for profiles table
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
CREATE POLICY "Admin full access to profiles"
ON public.profiles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Add admin policies for clinic_leads table
DROP POLICY IF EXISTS "Admin can view all clinic leads" ON public.clinic_leads;
CREATE POLICY "Admin can view all clinic leads"
ON public.clinic_leads
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all clinic leads" ON public.clinic_leads;
CREATE POLICY "Admin can manage all clinic leads"
ON public.clinic_leads
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Ensure admin has access to all necessary tables
-- Grant permissions to authenticated role for all admin-accessible tables
GRANT ALL PRIVILEGES ON public.profiles TO authenticated;
GRANT ALL PRIVILEGES ON public.clinic_leads TO authenticated;
GRANT ALL PRIVILEGES ON public.clinics TO authenticated;
GRANT ALL PRIVILEGES ON public.appointments TO authenticated;
GRANT ALL PRIVILEGES ON public.reviews TO authenticated;
GRANT ALL PRIVILEGES ON public.notifications TO authenticated;
GRANT ALL PRIVILEGES ON public.messages TO authenticated;
GRANT ALL PRIVILEGES ON public.payments TO authenticated;

-- 6. Create a helper function to check if current user can access admin features
CREATE OR REPLACE FUNCTION public.can_access_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE public.is_admin(auth.uid())
  END;
$$;

-- 7. Add a policy to allow admins to read from auth.users indirectly through profiles
-- This helps with the AdminCredentialing query that joins users and profiles
DROP POLICY IF EXISTS "Admin can access user data via profiles" ON public.profiles;
CREATE POLICY "Admin can access user data via profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_admin() OR auth.uid() = user_id
);

-- 8. Ensure the master admin user exists and has proper permissions
INSERT INTO public.profiles (user_id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data ->> 'full_name', 'Master Admin'),
  'admin'::user_role,
  now(),
  now()
FROM auth.users 
WHERE email = 'master@doutorizze.com.br'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin'::user_role,
  updated_at = now();

-- 9. Add comment for documentation
COMMENT ON FUNCTION public.is_admin IS 'Check if a user has admin role. Defaults to current authenticated user.';
COMMENT ON FUNCTION public.can_access_admin IS 'Check if current user can access admin features.';