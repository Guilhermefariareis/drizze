-- Criar tabela de notificações para clínicas
CREATE TABLE public.clinic_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  loan_request_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'success', 'error', 'warning', 'info'
  is_read BOOLEAN NOT NULL DEFAULT false,
  admin_response_data JSONB,
  parcelamais_response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clinics can view their notifications" 
ON public.clinic_notifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_notifications.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all notifications" 
ON public.clinic_notifications 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Clinics can update read status" 
ON public.clinic_notifications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_notifications.clinic_id 
  AND clinics.owner_id = auth.uid()
));

-- Add trigger for timestamps
CREATE TRIGGER update_clinic_notifications_updated_at
BEFORE UPDATE ON public.clinic_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add more detailed status tracking to loan_requests
ALTER TABLE public.loan_requests 
ADD COLUMN IF NOT EXISTS final_decision_details JSONB,
ADD COLUMN IF NOT EXISTS admin_decision_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parcelamais_final_status TEXT,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE;