-- Migration: Add credit editing fields and tables
-- Description: Adds new fields to credit_requests table and creates supporting tables for clinic value editing functionality

-- Add new fields to credit_requests table
ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS clinic_approved_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS clinic_installments INTEGER CHECK (clinic_installments > 0 AND clinic_installments <= 60),
ADD COLUMN IF NOT EXISTS clinic_interest_rate NUMERIC(5,2) DEFAULT 2.5 CHECK (clinic_interest_rate >= 0 AND clinic_interest_rate <= 100),
ADD COLUMN IF NOT EXISTS special_conditions TEXT,
ADD COLUMN IF NOT EXISTS edited_by_clinic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clinic_edit_date TIMESTAMPTZ;

-- Add comments to new fields
COMMENT ON COLUMN credit_requests.clinic_approved_amount IS 'Amount approved by clinic after editing';
COMMENT ON COLUMN credit_requests.clinic_installments IS 'Number of installments set by clinic';
COMMENT ON COLUMN credit_requests.clinic_interest_rate IS 'Interest rate set by clinic (monthly %)';
COMMENT ON COLUMN credit_requests.special_conditions IS 'Special conditions set by clinic';
COMMENT ON COLUMN credit_requests.edited_by_clinic IS 'Flag indicating if values were edited by clinic';
COMMENT ON COLUMN credit_requests.clinic_edit_date IS 'Timestamp when clinic last edited the request';

-- Create credit_request_history table for audit trail
CREATE TABLE IF NOT EXISTS credit_request_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID REFERENCES credit_requests(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to history table
COMMENT ON TABLE credit_request_history IS 'Audit trail for all changes made to credit requests';
COMMENT ON COLUMN credit_request_history.credit_request_id IS 'Reference to the credit request that was changed';
COMMENT ON COLUMN credit_request_history.field_name IS 'Name of the field that was changed';
COMMENT ON COLUMN credit_request_history.old_value IS 'Previous value before change';
COMMENT ON COLUMN credit_request_history.new_value IS 'New value after change';
COMMENT ON COLUMN credit_request_history.changed_by IS 'User who made the change';
COMMENT ON COLUMN credit_request_history.changed_at IS 'Timestamp when change was made';
COMMENT ON COLUMN credit_request_history.change_reason IS 'Optional reason for the change';

-- Create edit_drafts table for temporary edits
CREATE TABLE IF NOT EXISTS edit_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID REFERENCES credit_requests(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    draft_amount NUMERIC(10,2),
    draft_installments INTEGER CHECK (draft_installments > 0 AND draft_installments <= 60),
    draft_rate NUMERIC(5,2) CHECK (draft_rate >= 0 AND draft_rate <= 100),
    draft_notes TEXT,
    draft_conditions TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to drafts table
COMMENT ON TABLE edit_drafts IS 'Draft edits for credit requests before final submission';
COMMENT ON COLUMN edit_drafts.credit_request_id IS 'Reference to the credit request being edited';
COMMENT ON COLUMN edit_drafts.clinic_id IS 'Reference to the clinic making the edit';
COMMENT ON COLUMN edit_drafts.draft_amount IS 'Draft amount value';
COMMENT ON COLUMN edit_drafts.draft_installments IS 'Draft number of installments';
COMMENT ON COLUMN edit_drafts.draft_rate IS 'Draft interest rate (monthly %)';
COMMENT ON COLUMN edit_drafts.draft_notes IS 'Draft clinic notes';
COMMENT ON COLUMN edit_drafts.draft_conditions IS 'Draft special conditions';
COMMENT ON COLUMN edit_drafts.saved_at IS 'When the draft was last saved';
COMMENT ON COLUMN edit_drafts.is_active IS 'Whether this draft is currently active';

-- Enable RLS on new tables
ALTER TABLE credit_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_request_history
-- Allow clinics to view history of their own credit requests
CREATE POLICY "Clinics can view their credit request history" ON credit_request_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            JOIN profiles p ON p.id = auth.uid()
            WHERE cr.id = credit_request_history.credit_request_id
            AND cr.clinic_id IN (
                SELECT clinic_id FROM clinic_professionals 
                WHERE user_id = p.id AND is_active = true
            )
        )
    );

-- Allow admins to view all history
CREATE POLICY "Admins can view all credit request history" ON credit_request_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow system to insert history records
CREATE POLICY "System can insert history records" ON credit_request_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for edit_drafts
-- Allow clinics to manage their own drafts
CREATE POLICY "Clinics can manage their own drafts" ON edit_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND edit_drafts.clinic_id IN (
                SELECT clinic_id FROM clinic_professionals 
                WHERE user_id = p.id AND is_active = true
            )
        )
    );

-- Allow admins to view all drafts
CREATE POLICY "Admins can view all drafts" ON edit_drafts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Update existing RLS policies for credit_requests to allow clinic editing
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Clinics can update their credit requests" ON credit_requests;

-- Create new policy for clinic updates
CREATE POLICY "Clinics can update their credit requests" ON credit_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND credit_requests.clinic_id IN (
                SELECT clinic_id FROM clinic_professionals 
                WHERE user_id = p.id AND is_active = true
            )
        )
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON credit_request_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON edit_drafts TO authenticated;

-- Grant permissions to anon users (read-only for public data)
GRANT SELECT ON credit_request_history TO anon;
GRANT SELECT ON edit_drafts TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_request_history_request_id ON credit_request_history(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_request_history_changed_by ON credit_request_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_credit_request_history_changed_at ON credit_request_history(changed_at);

CREATE INDEX IF NOT EXISTS idx_edit_drafts_credit_request_id ON edit_drafts(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_edit_drafts_clinic_id ON edit_drafts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_edit_drafts_is_active ON edit_drafts(is_active);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for edit_drafts
CREATE TRIGGER update_edit_drafts_updated_at 
    BEFORE UPDATE ON edit_drafts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to log credit request changes
CREATE OR REPLACE FUNCTION log_credit_request_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log amount changes
    IF OLD.requested_amount IS DISTINCT FROM NEW.requested_amount THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'requested_amount', OLD.requested_amount::text, NEW.requested_amount::text, auth.uid());
    END IF;
    
    -- Log installments changes
    IF OLD.installments IS DISTINCT FROM NEW.installments THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'installments', OLD.installments::text, NEW.installments::text, auth.uid());
    END IF;
    
    -- Log clinic approved amount changes
    IF OLD.clinic_approved_amount IS DISTINCT FROM NEW.clinic_approved_amount THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'clinic_approved_amount', OLD.clinic_approved_amount::text, NEW.clinic_approved_amount::text, auth.uid());
    END IF;
    
    -- Log clinic installments changes
    IF OLD.clinic_installments IS DISTINCT FROM NEW.clinic_installments THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'clinic_installments', OLD.clinic_installments::text, NEW.clinic_installments::text, auth.uid());
    END IF;
    
    -- Log clinic interest rate changes
    IF OLD.clinic_interest_rate IS DISTINCT FROM NEW.clinic_interest_rate THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'clinic_interest_rate', OLD.clinic_interest_rate::text, NEW.clinic_interest_rate::text, auth.uid());
    END IF;
    
    -- Log special conditions changes
    IF OLD.special_conditions IS DISTINCT FROM NEW.special_conditions THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'special_conditions', OLD.special_conditions, NEW.special_conditions, auth.uid());
    END IF;
    
    -- Log clinic notes changes
    IF OLD.clinic_notes IS DISTINCT FROM NEW.clinic_notes THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'clinic_notes', OLD.clinic_notes, NEW.clinic_notes, auth.uid());
    END IF;
    
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'status', OLD.status, NEW.status, auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for credit_requests changes
CREATE TRIGGER log_credit_request_changes_trigger
    AFTER UPDATE ON credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_credit_request_changes();