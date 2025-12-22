-- Criar bucket para logos e assets do site
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Políticas para o bucket site-assets
CREATE POLICY "Anyone can view site assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'site-assets' AND get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can update site assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-assets' AND get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can delete site assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-assets' AND get_user_role(auth.uid()) = 'admin'::user_role);

-- Tabela para tickets de suporte
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'feature_request')),
  admin_response TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = support_tickets.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Clinics can view their tickets" 
ON public.support_tickets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = support_tickets.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Clinics can update their open tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (
  status IN ('open', 'in_progress') 
  AND EXISTS (
    SELECT 1 FROM clinics 
    WHERE clinics.id = support_tickets.clinic_id 
    AND clinics.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Trigger para updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar configuração de logo
INSERT INTO public.site_configurations (config_key, config_value, description) VALUES
('site_logo', '"/doutorizze-uploads/e4e59e9c-6806-48a8-be4c-476ac461beb9.png"', 'Logo do site - URL da imagem');

-- Atualizar configuração do simulador de empréstimo para ser mais flexível
UPDATE public.site_configurations 
SET config_value = '{"monthly_rate": 0.025, "min_installments": 6, "max_installments": 48, "available_installments": [6, 12, 18, 24, 36, 48]}'
WHERE config_key = 'loan_simulator_rate';

UPDATE public.site_configurations 
SET description = 'Configurações do simulador de empréstimo'
WHERE config_key = 'loan_simulator_rate';