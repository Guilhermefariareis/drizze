-- Migration: Create credit_request_history table
-- Created: 2025-01-29
-- Purpose: Track all changes made to credit requests for audit purposes

-- Create credit_request_history table for audit trail
CREATE TABLE credit_request_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID REFERENCES credit_requests(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE credit_request_history IS 'Audit trail for all changes made to credit requests';
COMMENT ON COLUMN credit_request_history.credit_request_id IS 'Reference to the credit request that was changed';
COMMENT ON COLUMN credit_request_history.field_name IS 'Name of the field that was changed';
COMMENT ON COLUMN credit_request_history.old_value IS 'Previous value before change';
COMMENT ON COLUMN credit_request_history.new_value IS 'New value after change';
COMMENT ON COLUMN credit_request_history.changed_by IS 'User who made the change';
COMMENT ON COLUMN credit_request_history.changed_at IS 'Timestamp when change was made';
COMMENT ON COLUMN credit_request_history.change_reason IS 'Optional reason for the change';

-- Create indexes for performance
CREATE INDEX idx_credit_history_request_id ON credit_request_history(credit_request_id);
CREATE INDEX idx_credit_history_changed_at ON credit_request_history(changed_at DESC);
CREATE INDEX idx_credit_history_changed_by ON credit_request_history(changed_by);
CREATE INDEX idx_credit_history_field_name ON credit_request_history(field_name);

-- Enable RLS
ALTER TABLE credit_request_history ENABLE ROW LEVEL SECURITY;

-- Create function to automatically log changes
CREATE OR REPLACE FUNCTION log_credit_request_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if there are actual changes
    IF TG_OP = 'UPDATE' THEN
        -- Log clinic_approved_amount changes
        IF OLD.clinic_approved_amount IS DISTINCT FROM NEW.clinic_approved_amount THEN
            INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by, change_reason)
            VALUES (NEW.id, 'clinic_approved_amount', OLD.clinic_approved_amount::TEXT, NEW.clinic_approved_amount::TEXT, auth.uid(), 'Clinic edited approved amount');
        END IF;
        
        -- Log clinic_installments changes
        IF OLD.clinic_installments IS DISTINCT FROM NEW.clinic_installments THEN
            INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by, change_reason)
            VALUES (NEW.id, 'clinic_installments', OLD.clinic_installments::TEXT, NEW.clinic_installments::TEXT, auth.uid(), 'Clinic edited installments');
        END IF;
        
        -- Log clinic_interest_rate changes
        IF OLD.clinic_interest_rate IS DISTINCT FROM NEW.clinic_interest_rate THEN
            INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by, change_reason)
            VALUES (NEW.id, 'clinic_interest_rate', OLD.clinic_interest_rate::TEXT, NEW.clinic_interest_rate::TEXT, auth.uid(), 'Clinic edited interest rate');
        END IF;
        
        -- Log clinic_notes changes
        IF OLD.clinic_notes IS DISTINCT FROM NEW.clinic_notes THEN
            INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by, change_reason)
            VALUES (NEW.id, 'clinic_notes', OLD.clinic_notes, NEW.clinic_notes, auth.uid(), 'Clinic edited notes');
        END IF;
        
        -- Log special_conditions changes
        IF OLD.special_conditions IS DISTINCT FROM NEW.special_conditions THEN
            INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by, change_reason)
            VALUES (NEW.id, 'special_conditions', OLD.special_conditions, NEW.special_conditions, auth.uid(), 'Clinic edited special conditions');
        END IF;
        
        -- Log status changes
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO credit_request_history (credit_request_id, field_name, old_value, new_value, changed_by, change_reason)
            VALUES (NEW.id, 'status', OLD.status, NEW.status, auth.uid(), 'Status changed');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log changes
CREATE TRIGGER trigger_log_credit_request_changes
    AFTER UPDATE ON credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_credit_request_change();