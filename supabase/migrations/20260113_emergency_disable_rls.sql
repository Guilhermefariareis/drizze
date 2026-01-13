-- ============================================================================== 
-- EMERGENCY ROLLBACK: DISABLE RLS TO RESTORE SITE ACCESS
-- ==============================================================================

-- Disabling Row Level Security will allow all authenticated and anonymous users
-- to access the profiles table without policy restrictions.
-- This immediately fixes "Infinite Recursion" and "Permission Denied" errors.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Note: This is a temporary measure to get the site running. 
-- We will implement secure non-recursive policies in the next step.
