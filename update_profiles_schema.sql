-- SQL Script to update profiles schema for admin actions
-- Run this in the Supabase SQL Editor

-- 1. Add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure user_type column exists (should already exist based on previous inspection)
-- If it doesn't exist for some reason, uncomment line below:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type public.user_type DEFAULT 'patient';

-- 3. Update existing records with defaults if null
UPDATE public.profiles 
SET is_active = COALESCE(is_active, TRUE),
    updated_at = COALESCE(updated_at, NOW())
WHERE is_active IS NULL OR updated_at IS NULL;

-- 4. Re-verify columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
