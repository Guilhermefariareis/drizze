-- Final unification for profiles table to resolve id vs user_id and name vs full_name conflicts

-- 1. Ensure columns exist and have correct types/defaults
DO $$
BEGIN
    -- Ensure user_id exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Ensure full_name exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    -- Ensure role exists and uses the correct enum
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'patient';
    END IF;

    -- Ensure account_type exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'account_type') THEN
        ALTER TABLE public.profiles ADD COLUMN account_type TEXT DEFAULT 'patient';
    END IF;

    -- Ensure name is nullable if it exists (since we use full_name now)
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;
    END IF;

    -- Ensure id has a default and is NOT NULL
    ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE public.profiles ALTER COLUMN id SET NOT NULL;
END $$;

-- 2. Synchronize existing data
UPDATE public.profiles 
SET 
    user_id = COALESCE(user_id, id),
    full_name = COALESCE(full_name, name),
    role = COALESCE(role, 'patient'::public.user_role),
    account_type = COALESCE(account_type, role::text, 'patient')
WHERE user_id IS NULL OR full_name IS NULL OR role IS NULL;

-- 3. Update handle_new_user trigger to be bulletproof
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        user_id, 
        email, 
        full_name, 
        role, 
        account_type,
        updated_at
    )
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
        COALESCE(NEW.raw_user_meta_data ->> 'account_type', NEW.raw_user_meta_data ->> 'role', 'patient'),
        NOW()
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

-- 4. Ensure notifications FK points to auth.users(id) for robustness
DO $$
DECLARE
    const_name TEXT;
BEGIN
    SELECT conname INTO const_name
    FROM pg_constraint 
    WHERE conrelid = 'public.notifications'::regclass 
    AND contype = 'f'
    AND confrelid = 'public.profiles'::regclass;

    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT ' || const_name;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.notifications'::regclass 
        AND conname = 'fk_notifications_user'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;
