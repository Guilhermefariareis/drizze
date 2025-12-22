-- Update credit_requests status constraint to include new status values
-- This migration updates the status field to support the new workflow:
-- pending -> clinic_approved/clinic_rejected -> admin_analyzing -> admin_approved/admin_rejected

-- First, drop the existing constraint
ALTER TABLE credit_requests 
DROP CONSTRAINT IF EXISTS credit_requests_status_check;

-- Add the new constraint with all required status values
ALTER TABLE credit_requests 
ADD CONSTRAINT credit_requests_status_check 
CHECK (status::text = ANY (ARRAY[
  'pending'::character varying,
  'clinic_approved'::character varying,
  'clinic_rejected'::character varying,
  'admin_analyzing'::character varying,
  'admin_approved'::character varying,
  'admin_rejected'::character varying,
  'approved'::character varying,
  'rejected'::character varying,
  'cancelled'::character varying
]::text[]));

-- Add comments to document the status workflow
COMMENT ON COLUMN credit_requests.status IS 'Status workflow: pending -> clinic_approved/clinic_rejected -> admin_analyzing -> admin_approved/admin_rejected';

-- Add columns for tracking clinic and admin actions
ALTER TABLE credit_requests 
ADD COLUMN IF NOT EXISTS clinic_comments TEXT,
ADD COLUMN IF NOT EXISTS admin_comments TEXT;

COMMENT ON COLUMN credit_requests.clinic_comments IS 'Comments added by clinic when approving/rejecting';
COMMENT ON COLUMN credit_requests.admin_comments IS 'Comments added by admin when analyzing/approving/rejecting';