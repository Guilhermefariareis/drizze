-- SQL Script to set admin@admin.com as Administrator
-- Run this in the Supabase SQL Editor

-- 1. Ensure the profile exists and has the correct role
INSERT INTO profiles (id, user_id, email, full_name, role, account_type, is_active)
SELECT 
    gen_random_uuid(), -- Temp ID if doesn't exist (will be updated on login if needed)
    null,             -- Will be linked upon first login/auth
    'admin@admin.com',
    'Administrador Geral',
    'admin',
    'clinica',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'admin@admin.com'
);

-- 2. Update existing profile if it already exists
UPDATE profiles 
SET role = 'admin', 
    account_type = 'clinica',
    is_active = true
WHERE email = 'admin@admin.com';

-- 3. (Optional) Log the change
INSERT INTO audit_logs (action, table_name, changes, created_at)
VALUES (
    'PROMOTE_ADMIN',
    'profiles',
    jsonb_build_object('email', 'admin@admin.com', 'new_role', 'admin'),
    now()
);

-- Note: Ensure the user 'admin@admin.com' is also registered in Authentication > Users.
