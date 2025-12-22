-- Create loan_requests table (principal table do sistema)
CREATE TABLE IF NOT EXISTS public.loan_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  treatment_description TEXT NOT NULL,
  requested_amount DECIMAL(10,2) NOT NULL,
  installments INTEGER NOT NULL,
  
  -- Status flow: pending_clinic → approved_clinic → pending_admin → sent_parcelamais → approved/rejected
  status TEXT NOT NULL DEFAULT 'pending_clinic' CHECK (status IN ('pending_clinic', 'approved_clinic', 'rejected_clinic', 'pending_admin', 'sent_parcelamais', 'approved', 'rejected')),
  
  -- Clinic analysis
  clinic_notes TEXT,
  clinic_approved_at TIMESTAMP WITH TIME ZONE,
  clinic_approved_by UUID,
  
  -- Admin analysis  
  admin_notes TEXT,
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  admin_approved_by UUID,
  
  -- ParceilaMais integration
  parcelamais_request_id TEXT,
  parcelamais_response JSONB,
  parcelamais_sent_at TIMESTAMP WITH TIME ZONE,
  parcelamais_approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view their own loan requests" 
ON public.loan_requests FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create loan requests" 
ON public.loan_requests FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinic owners can view their clinic requests" 
ON public.loan_requests FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = loan_requests.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Clinic owners can update their clinic requests" 
ON public.loan_requests FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = loan_requests.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all loan requests" 
ON public.loan_requests FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Add trigger for updated_at
CREATE TRIGGER update_loan_requests_updated_at
  BEFORE UPDATE ON public.loan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create treatments table (what the patient needs)
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  estimated_cost_min DECIMAL(10,2),
  estimated_cost_max DECIMAL(10,2),
  typical_installments INTEGER DEFAULT 12,
  specialty_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for treatments (public read)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view treatments" 
ON public.treatments FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage treatments" 
ON public.treatments FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Insert common dental treatments
INSERT INTO public.treatments (name, description, estimated_cost_min, estimated_cost_max, typical_installments) VALUES
('Implante Dentário', 'Implante unitário com coroa', 2500.00, 4500.00, 18),
('Aparelho Ortodôntico', 'Tratamento ortodôntico completo', 3000.00, 8000.00, 24),
('Prótese Total', 'Dentadura completa superior/inferior', 1500.00, 3500.00, 12),
('Clareamento Dental', 'Clareamento profissional', 800.00, 1500.00, 6),
('Tratamento de Canal', 'Endodontia completa', 600.00, 1200.00, 8),
('Cirurgia de Siso', 'Extração de sisos (4 dentes)', 800.00, 1600.00, 6),
('Facetas de Porcelana', 'Facetas estéticas (6-10 dentes)', 4000.00, 12000.00, 24),
('Harmonização Facial', 'Procedimentos estéticos faciais', 2000.00, 6000.00, 12);