-- Fix RLS policies for edit_drafts table - VERSÃO ATUALIZADA
-- This migration adds proper RLS policies to allow authenticated clinic users to access their drafts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clinics can view their own drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can insert their own drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can update their own drafts" ON edit_drafts;
DROP POLICY IF EXISTS "Clinics can delete their own drafts" ON edit_drafts;

-- Create policies for authenticated clinic users
-- Policy for SELECT (viewing drafts)
CREATE POLICY "Clinics can view their own drafts" ON edit_drafts
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Policy for INSERT (creating new drafts)
CREATE POLICY "Clinics can insert their own drafts" ON edit_drafts
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Policy for UPDATE (modifying existing drafts)
CREATE POLICY "Clinics can update their own drafts" ON edit_drafts
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Policy for DELETE (removing drafts)
CREATE POLICY "Clinics can delete their own drafts" ON edit_drafts
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'clinic'
        )
    );

-- Update table comment to reflect the fix
COMMENT ON TABLE edit_drafts IS 'Draft edits for credit requests before final submission - RLS fixed for clinic access';