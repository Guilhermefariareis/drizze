-- Adiciona campos de endereço do paciente à tabela credit_requests
-- Todos os campos são opcionais (NULL) e possuem comentários explicativos

ALTER TABLE public.credit_requests
  ADD COLUMN IF NOT EXISTS patient_address_cep VARCHAR(8),
  ADD COLUMN IF NOT EXISTS patient_address_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS patient_address_state VARCHAR(2),
  ADD COLUMN IF NOT EXISTS patient_address_neighborhood VARCHAR(100),
  ADD COLUMN IF NOT EXISTS patient_address_street VARCHAR(200),
  ADD COLUMN IF NOT EXISTS patient_address_number VARCHAR(10);

-- Comentários explicativos dos campos
COMMENT ON COLUMN public.credit_requests.patient_address_cep IS 'CEP do endereço do paciente (somente números)';
COMMENT ON COLUMN public.credit_requests.patient_address_city IS 'Cidade do endereço do paciente';
COMMENT ON COLUMN public.credit_requests.patient_address_state IS 'UF do endereço do paciente (ex.: SP, RJ)';
COMMENT ON COLUMN public.credit_requests.patient_address_neighborhood IS 'Bairro do endereço do paciente';
COMMENT ON COLUMN public.credit_requests.patient_address_street IS 'Logradouro do endereço do paciente';
COMMENT ON COLUMN public.credit_requests.patient_address_number IS 'Número do endereço do paciente';