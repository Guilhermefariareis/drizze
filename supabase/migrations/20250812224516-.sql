-- Add public fields to store external scheduling links per clinic
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS agenda_link_url text, -- full URL like https://agenda.link/felipemello
  ADD COLUMN IF NOT EXISTS agenda_online_slug text; -- slug like felipemello
