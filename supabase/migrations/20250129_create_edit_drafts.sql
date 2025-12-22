-- Migration: Create edit_drafts table
-- Created: 2025-01-29
-- Purpose: Store draft edits for credit requests before final submission

-- Create edit_drafts table for managing draft edits
CREATE TABLE edit_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID REFERENCES credit_requests(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id),
    draft_amount DECIMAL(10,2),
    draft_installments INTEGER,
    draft_rate DECIMAL(5,2),
    draft_notes TEXT,
    draft_conditions TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
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

-- Create indexes for performance
CREATE INDEX idx_edit_drafts_request_id ON edit_drafts(credit_request_id);
CREATE INDEX idx_edit_drafts_clinic_id ON edit_drafts(clinic_id);
CREATE INDEX idx_edit_drafts_is_active ON edit_drafts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_edit_drafts_saved_at ON edit_drafts(saved_at DESC);

-- Create unique constraint to ensure only one active draft per credit request
CREATE UNIQUE INDEX idx_edit_drafts_unique_active 
ON edit_drafts(credit_request_id) 
WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE edit_drafts ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_edit_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_edit_drafts_updated_at
    BEFORE UPDATE ON edit_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_edit_drafts_updated_at();

-- Create function to deactivate old drafts when creating new ones
CREATE OR REPLACE FUNCTION deactivate_old_drafts()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate any existing active drafts for this credit request
    UPDATE edit_drafts 
    SET is_active = FALSE, updated_at = NOW()
    WHERE credit_request_id = NEW.credit_request_id 
    AND is_active = TRUE 
    AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to deactivate old drafts
CREATE TRIGGER trigger_deactivate_old_drafts
    AFTER INSERT ON edit_drafts
    FOR EACH ROW
    EXECUTE FUNCTION deactivate_old_drafts();

-- Create function to clean up old inactive drafts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_drafts()
RETURNS void AS $$
BEGIN
    DELETE FROM edit_drafts 
    WHERE is_active = FALSE 
    AND updated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;