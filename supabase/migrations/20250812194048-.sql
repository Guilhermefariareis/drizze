-- Add optional online_slug for Clinicorp online agenda code/slug
ALTER TABLE public.clinic_integrations
ADD COLUMN IF NOT EXISTS online_slug TEXT;