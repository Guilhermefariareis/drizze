-- Migration: Add clinic editing fields to credit_requests table
-- Created: 2025-01-29
-- Purpose: Enable clinics to edit credit request values before sending to admin

-- Add new fields to credit_requests table for clinic editing functionality
-- Note: clinic_notes already exists, so we skip it
ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS clinic_approved_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS clinic_installments INTEGER,
ADD COLUMN IF NOT EXISTS clinic_interest_rate DECIMAL(5,2) DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS special_conditions TEXT,
ADD COLUMN IF NOT EXISTS edited_by_clinic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clinic_edit_date TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN credit_requests.clinic_approved_amount IS 'Amount approved by clinic after editing';
COMMENT ON COLUMN credit_requests.clinic_installments IS 'Number of installments set by clinic';
COMMENT ON COLUMN credit_requests.clinic_interest_rate IS 'Interest rate set by clinic (monthly %)';
COMMENT ON COLUMN credit_requests.clinic_notes IS 'Notes added by clinic during editing';
COMMENT ON COLUMN credit_requests.special_conditions IS 'Special conditions set by clinic';
COMMENT ON COLUMN credit_requests.edited_by_clinic IS 'Flag indicating if values were edited by clinic';
COMMENT ON COLUMN credit_requests.clinic_edit_date IS 'Timestamp when clinic last edited the request';

-- Create index for performance on edited_by_clinic flag
CREATE INDEX idx_credit_requests_edited_by_clinic ON credit_requests(edited_by_clinic) WHERE edited_by_clinic = TRUE;

-- Create index for clinic_edit_date for sorting and filtering
CREATE INDEX idx_credit_requests_clinic_edit_date ON credit_requests(clinic_edit_date DESC) WHERE clinic_edit_date IS NOT NULL;