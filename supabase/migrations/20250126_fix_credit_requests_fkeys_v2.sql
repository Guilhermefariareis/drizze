-- Fix credit_requests foreign keys that cause permission denied errors
-- This migration removes foreign key constraints that reference profiles table

-- Remove foreign key constraint that references profiles (which might link to auth.users)
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_patient_id_fkey;

-- Keep only the clinic_id foreign key (this one is safe)
-- The clinic_id foreign key should remain as it references the clinics table

-- Drop and recreate RLS policies for credit_requests to ensure they work correctly
DROP POLICY IF EXISTS "credit_requests_select_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_insert_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_update_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_delete_policy" ON credit_requests;

-- Create new RLS policies that are more specific and don't cause permission issues
CREATE POLICY "credit_requests_select_policy" ON credit_requests
FOR SELECT USING (
  clinic_id IN (
    SELECT id FROM clinics 
    WHERE master_user_id = auth.uid() OR owner_id = auth.uid()
  )
);

CREATE POLICY "credit_requests_insert_policy" ON credit_requests
FOR INSERT WITH CHECK (
  clinic_id IN (
    SELECT id FROM clinics 
    WHERE master_user_id = auth.uid() OR owner_id = auth.uid()
  )
);

CREATE POLICY "credit_requests_update_policy" ON credit_requests
FOR UPDATE USING (
  clinic_id IN (
    SELECT id FROM clinics 
    WHERE master_user_id = auth.uid() OR owner_id = auth.uid()
  )
);

CREATE POLICY "credit_requests_delete_policy" ON credit_requests
FOR DELETE USING (
  clinic_id IN (
    SELECT id FROM clinics 
    WHERE master_user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- Ensure RLS is enabled
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- Add comment to track this fix
COMMENT ON TABLE credit_requests IS 'Tabela de solicitações de crédito com foreign key patient_id removida em 2025-01-26';