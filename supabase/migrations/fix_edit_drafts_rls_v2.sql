-- Fix RLS policies for edit_drafts table - Version 2 ATUALIZADA
-- This migration creates more permissive RLS policies for clinic users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clinics can view their own drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can insert their own drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can update their own drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can delete their own drafts" ON edit_drafts;

-- Create more permissive policies for authenticated clinic users
-- Policy for SELECT (viewing drafts) - Allow all clinic users to view all drafts
CREATE POLICY "Authenticated clinics can view all drafts" ON edit_drafts
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Policy for INSERT (creating new drafts) - Allow all clinic users to create drafts
CREATE POLICY "Authenticated clinics can insert drafts" ON edit_drafts
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Policy for UPDATE (modifying existing drafts) - Allow all clinic users to update drafts
CREATE POLICY "Authenticated clinics can update drafts" ON edit_drafts
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Policy for DELETE (removing drafts) - Allow all clinic users to delete drafts
CREATE POLICY "Authenticated clinics can delete drafts" ON edit_drafts
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Update table comment to reflect the fix
COMMENT ON TABLE edit_drafts IS 'Draft edits for credit requests before final submission - RLS fixed for all clinic users';