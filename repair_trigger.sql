-- SQL Script to repair the handle_new_user trigger and function
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/irrtjredcrwucrnagune/sql)

-- 1. Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Recreate the function with the CORRECT schema mapping
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        user_type
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.raw_user_meta_data ->> 'role' = 'master' THEN 'admin'::public.user_type
            WHEN NEW.raw_user_meta_data ->> 'role' = 'clinic' THEN 'clinic'::public.user_type
            ELSE 'patient'::public.user_type
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        user_type = EXCLUDED.user_type;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Audit check: Ensure all users have a profile (Data already backfilled by AI)
-- SELECT count(*) FROM profiles;
