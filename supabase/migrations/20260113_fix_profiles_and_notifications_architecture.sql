-- 1. Fix handle_new_user function to be robust and use current schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use full_name and handle role mapping
  -- We include both id and user_id, and account_type as required by types.ts
  INSERT INTO public.profiles (id, user_id, email, full_name, role, account_type)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'role' = 'master' THEN 'admin'::public.user_role
      WHEN NEW.raw_user_meta_data ->> 'role' = 'clinic' THEN 'clinic'::public.user_role
      ELSE 'patient'::public.user_role
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'account_type', NEW.raw_user_meta_data ->> 'role', 'patient')
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    account_type = EXCLUDED.account_type,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill profiles for existing auth users who don't have one
INSERT INTO public.profiles (id, user_id, email, full_name, role, account_type)
SELECT 
    id, 
    id,
    email, 
    COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', split_part(email, '@', 1)),
    CASE 
      WHEN raw_user_meta_data ->> 'role' = 'master' THEN 'admin'::public.user_role
      WHEN raw_user_meta_data ->> 'role' = 'clinic' THEN 'clinic'::public.user_role
      ELSE 'patient'::public.user_role
    END,
    COALESCE(raw_user_meta_data ->> 'account_type', raw_user_meta_data ->> 'role', 'patient')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Fix notifications table foreign key constraint
-- First, find the constraint name if it exists and drop it
DO $$
DECLARE
    const_name TEXT;
BEGIN
    SELECT conname INTO const_name
    FROM pg_constraint 
    WHERE conrelid = 'public.notifications'::regclass 
    AND contype = 'f'
    AND confrelid = 'public.profiles'::regclass; -- Constraint pointing to profiles

    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT ' || const_name;
    END IF;
    
    -- Also drop any fk pointing to auth.users if we want to be sure it's clean
    SELECT conname INTO const_name
    FROM pg_constraint 
    WHERE conrelid = 'public.notifications'::regclass 
    AND contype = 'f'
    AND confrelid = 'auth.users'::regclass;

    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT ' || const_name;
    END IF;
END $$;

-- Add correct FK constraint pointing to auth.users(id)
ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Enable Realtime (ensure it's done)
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
