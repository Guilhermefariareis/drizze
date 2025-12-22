-- Migration: Add missing fields to credit_requests table
-- Description: Adds fields needed for the credit interface
-- Created: 2025-01-30

-- Add missing fields to credit_requests table
DO $$
BEGIN
    -- Add proposal_number field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_requests' AND column_name = 'proposal_number') THEN
        ALTER TABLE credit_requests ADD COLUMN proposal_number VARCHAR(50);
    END IF;

    -- Add monthly_payment field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_requests' AND column_name = 'monthly_payment') THEN
        ALTER TABLE credit_requests ADD COLUMN monthly_payment DECIMAL(10,2);
    END IF;

    -- Add total_amount field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_requests' AND column_name = 'total_amount') THEN
        ALTER TABLE credit_requests ADD COLUMN total_amount DECIMAL(10,2);
    END IF;

    -- Add fidc_name field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_requests' AND column_name = 'fidc_name') THEN
        ALTER TABLE credit_requests ADD COLUMN fidc_name VARCHAR(100);
    END IF;
END $$;

-- Add comments to the new fields
COMMENT ON COLUMN credit_requests.proposal_number IS 'Numero unico da proposta de credito';
COMMENT ON COLUMN credit_requests.monthly_payment IS 'Valor da parcela mensal calculada';
COMMENT ON COLUMN credit_requests.total_amount IS 'Valor total a ser pago';
COMMENT ON COLUMN credit_requests.fidc_name IS 'Nome do FIDC';

-- Create unique index for proposal_number if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_requests_proposal_number 
ON credit_requests(proposal_number);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_requests_fidc_name ON credit_requests(fidc_name);
CREATE INDEX IF NOT EXISTS idx_credit_requests_monthly_payment ON credit_requests(monthly_payment);
CREATE INDEX IF NOT EXISTS idx_credit_requests_total_amount ON credit_requests(total_amount);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;