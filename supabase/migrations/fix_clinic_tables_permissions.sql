-- Fix permissions for clinic_profiles and clinic_services tables
-- These tables need proper GRANT permissions for anon and authenticated roles

-- Grant permissions for clinic_profiles
GRANT SELECT ON public.clinic_profiles TO anon;
GRANT ALL PRIVILEGES ON public.clinic_profiles TO authenticated;

-- Grant permissions for clinic_services  
GRANT SELECT ON public.clinic_services TO anon;
GRANT ALL PRIVILEGES ON public.clinic_services TO authenticated;

-- Verify current permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('clinic_profiles', 'clinic_services', 'notificacoes') 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;