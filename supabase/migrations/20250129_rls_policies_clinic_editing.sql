-- Migration: RLS Policies for clinic editing functionality
-- Created: 2025-01-29
-- Purpose: Implement Row Level Security policies for new tables and features

-- =====================================================
-- RLS POLICIES FOR CREDIT_REQUEST_HISTORY TABLE
-- =====================================================

-- Policy for clinics to view history of their own credit requests
CREATE POLICY "Clinics can view history of their requests" ON credit_request_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            JOIN clinics c ON c.id = cr.clinic_id
            WHERE cr.id = credit_request_id
            AND c.master_user_id = auth.uid()
        )
    );

-- Policy for patients to view history of their own credit requests
CREATE POLICY "Patients can view history of their requests" ON credit_request_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            WHERE cr.id = credit_request_id
            AND cr.patient_id = auth.uid()
        )
    );

-- Policy for admins to view all history (assuming admin role exists)
CREATE POLICY "Admins can view all history" ON credit_request_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- Policy for system to insert history records (via triggers)
CREATE POLICY "System can insert history records" ON credit_request_history
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR EDIT_DRAFTS TABLE
-- =====================================================

-- Policy for clinics to manage their own drafts
CREATE POLICY "Clinics can manage their drafts" ON edit_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = clinic_id
            AND c.master_user_id = auth.uid()
        )
    );

-- Policy for clinics to create drafts for their credit requests
CREATE POLICY "Clinics can create drafts for their requests" ON edit_drafts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            JOIN clinics c ON c.id = cr.clinic_id
            WHERE cr.id = credit_request_id
            AND c.master_user_id = auth.uid()
            AND c.id = clinic_id
        )
    );

-- =====================================================
-- ENHANCED POLICIES FOR CREDIT_REQUESTS TABLE
-- =====================================================

-- Update existing policy to allow clinics to update their editing fields
-- First, let's check if we need to drop existing policies and recreate them
-- This policy allows clinics to update the new editing fields

CREATE POLICY "Clinics can update editing fields" ON credit_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = clinic_id
            AND c.master_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = clinic_id
            AND c.master_user_id = auth.uid()
        )
    );

-- =====================================================
-- GRANT PERMISSIONS TO ROLES
-- =====================================================

-- Grant permissions for credit_request_history table
GRANT SELECT ON credit_request_history TO authenticated;
GRANT INSERT ON credit_request_history TO authenticated;

-- Grant permissions for edit_drafts table
GRANT ALL PRIVILEGES ON edit_drafts TO authenticated;

-- Ensure authenticated users can access the new fields in credit_requests
GRANT SELECT, UPDATE ON credit_requests TO authenticated;

-- =====================================================
-- FUNCTIONS FOR PERMISSION CHECKING
-- =====================================================

-- Function to check if user can edit a specific credit request
CREATE OR REPLACE FUNCTION can_edit_credit_request(request_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is the clinic owner and request is in editable status
    RETURN EXISTS (
        SELECT 1 FROM credit_requests cr
        JOIN clinics c ON c.id = cr.clinic_id
        WHERE cr.id = request_id
        AND c.master_user_id = auth.uid()
        AND cr.status IN ('Pendente', 'Em Análise')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view credit request history
CREATE OR REPLACE FUNCTION can_view_credit_history(request_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is clinic owner, patient, or admin
    RETURN EXISTS (
        -- Clinic owner
        SELECT 1 FROM credit_requests cr
        JOIN clinics c ON c.id = cr.clinic_id
        WHERE cr.id = request_id
        AND c.master_user_id = auth.uid()
    ) OR EXISTS (
        -- Patient
        SELECT 1 FROM credit_requests cr
        WHERE cr.id = request_id
        AND cr.patient_id = auth.uid()
    ) OR EXISTS (
        -- Admin
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate edit values
CREATE OR REPLACE FUNCTION validate_edit_values(
    amount DECIMAL(10,2),
    installments INTEGER,
    rate DECIMAL(5,2)
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate amount range
    IF amount < 100 OR amount > 50000 THEN
        RAISE EXCEPTION 'Amount must be between R$ 100.00 and R$ 50,000.00';
    END IF;
    
    -- Validate installments range
    IF installments < 1 OR installments > 60 THEN
        RAISE EXCEPTION 'Installments must be between 1 and 60';
    END IF;
    
    -- Validate interest rate range
    IF rate < 0 OR rate > 15 THEN
        RAISE EXCEPTION 'Interest rate must be between 0% and 15% per month';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO VALIDATE EDITS
-- =====================================================

-- Create trigger function to validate edits before saving
CREATE OR REPLACE FUNCTION validate_credit_request_edit()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if clinic editing fields are being updated
    IF NEW.clinic_approved_amount IS NOT NULL OR 
       NEW.clinic_installments IS NOT NULL OR 
       NEW.clinic_interest_rate IS NOT NULL THEN
        
        -- Validate the values
        PERFORM validate_edit_values(
            COALESCE(NEW.clinic_approved_amount, NEW.requested_amount),
            COALESCE(NEW.clinic_installments, NEW.installments),
            COALESCE(NEW.clinic_interest_rate, 2.5)
        );
        
        -- Set edited_by_clinic flag and timestamp
        NEW.edited_by_clinic = TRUE;
        NEW.clinic_edit_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER trigger_validate_credit_request_edit
    BEFORE UPDATE ON credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION validate_credit_request_edit();