-- Criar tabela para gestão de profissionais das clínicas
CREATE TABLE IF NOT EXISTS public.clinic_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'dentist' CHECK (role IN ('dentist', 'assistant', 'receptionist', 'manager')),
  permissions JSONB DEFAULT '{"access_agenda": true, "access_patients": false, "access_financial": false, "access_reports": false, "access_advanced_services": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(clinic_id, user_id)
);

-- Enable RLS
ALTER TABLE public.clinic_professionals ENABLE ROW LEVEL SECURITY;

-- Policies for clinic professionals
CREATE POLICY "Master users can manage clinic professionals" 
ON public.clinic_professionals 
FOR ALL 
USING (
  clinic_id IN (
    SELECT c.id FROM public.clinics c 
    WHERE c.master_user_id = auth.uid() OR c.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own clinic professional record" 
ON public.clinic_professionals 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all clinic professionals" 
ON public.clinic_professionals 
FOR ALL 
USING (is_admin_user());