-- Remove problematic foreign key that causes permission denied errors
-- The patient_id foreign key references profiles table which causes auth issues

-- Remove the foreign key constraint that references profiles table
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_patient_id_fkey;

-- Drop all existing RLS policies for credit_requests
DROP POLICY IF EXISTS "credit_requests_select_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_insert_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_update_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_delete_policy" ON credit_requests;

-- Create simple and effective RLS policies
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