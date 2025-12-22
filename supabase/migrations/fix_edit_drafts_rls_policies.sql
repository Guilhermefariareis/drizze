-- Fix edit_drafts RLS policies to allow clinics to save drafts
-- This migration addresses the "new row violates row-level security policy" error

-- Drop existing policies for edit_drafts
DROP POLICY IF EXISTS "Clinics can manage their own edit drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can view their own edit drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can insert edit drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can update their own edit drafts" ON edit_drafts;

-- Create more permissive policies for edit_drafts
-- Policy 1: Allow clinics to insert drafts for their credit requests
CREATE POLICY "Clinics can insert edit drafts" ON edit_drafts
    FOR INSERT 
    WITH CHECK (
        clinic_id IN (
            SELECT c.id 
            FROM clinics c 
            WHERE c.owner_id = auth.uid() OR c.master_user_id = auth.uid()
        )
    );

-- Policy 2: Allow clinics to view their own drafts
CREATE POLICY "Clinics can view their own edit drafts" ON edit_drafts
    FOR SELECT 
    USING (
        clinic_id IN (
            SELECT c.id 
            FROM clinics c 
            WHERE c.owner_id = auth.uid() OR c.master_user_id = auth.uid()
        )
    );

-- Policy 3: Allow clinics to update their own drafts
CREATE POLICY "Clinics can update their own edit drafts" ON edit_drafts
    FOR UPDATE 
    USING (
        clinic_id IN (
            SELECT c.id 
            FROM clinics c 
            WHERE c.owner_id = auth.uid() OR c.master_user_id = auth.uid()
        )
    )
    WITH CHECK (
        clinic_id IN (
            SELECT c.id 
            FROM clinics c 
            WHERE c.owner_id = auth.uid() OR c.master_user_id = auth.uid()
        )
    );

-- Policy 4: Allow clinics to delete their own drafts
CREATE POLICY "Clinics can delete their own edit drafts" ON edit_drafts
    FOR DELETE 
    USING (
        clinic_id IN (
            SELECT c.id 
            FROM clinics c 
            WHERE c.owner_id = auth.uid() OR c.master_user_id = auth.uid()
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON edit_drafts TO authenticated;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'edit_drafts'
ORDER BY policyname;