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