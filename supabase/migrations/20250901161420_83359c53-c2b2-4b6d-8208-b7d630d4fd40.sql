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

-- Trigger para updated_at
CREATE TRIGGER update_clinic_professionals_updated_at
  BEFORE UPDATE ON public.clinic_professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar tabela para tickets de suporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'financial', 'general', 'integration', 'billing')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  
  -- User info
  created_by UUID NOT NULL REFERENCES auth.users(id),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Admin handling
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ NULL,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  attachments TEXT[] DEFAULT '{}',
  
  -- Timestamps  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for support tickets
CREATE POLICY "Users can view own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (is_admin_user());

-- Trigger para updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar tabela para mensagens dos tickets
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support messages
CREATE POLICY "Users can view messages from own tickets" 
ON public.support_messages 
FOR SELECT 
USING (
  ticket_id IN (
    SELECT t.id FROM public.support_tickets t 
    WHERE t.created_by = auth.uid()
  ) AND NOT is_internal
);

CREATE POLICY "Users can create messages in own tickets" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (
  ticket_id IN (
    SELECT t.id FROM public.support_tickets t 
    WHERE t.created_by = auth.uid()
  ) AND user_id = auth.uid() AND NOT is_internal
);

CREATE POLICY "Admins can manage all messages" 
ON public.support_messages 
FOR ALL 
USING (is_admin_user());

-- Trigger para updated_at nas mensagens
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();