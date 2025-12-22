-- Adiciona campo de data de nascimento do paciente à tabela credit_requests
-- Campo opcional (NULL) com comentário explicativo

BEGIN;

ALTER TABLE public.credit_requests
  ADD COLUMN IF NOT EXISTS patient_birth_date DATE;

COMMENT ON COLUMN public.credit_requests.patient_birth_date IS 'Data de nascimento do paciente (YYYY-MM-DD)';

COMMIT;