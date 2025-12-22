-- Criar tabela para armazenar ofertas de crédito dos bancos
CREATE TABLE IF NOT EXISTS public.credit_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credit_request_id UUID NOT NULL REFERENCES public.credit_requests(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    approved_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    installments INTEGER NOT NULL,
    conditions TEXT,
    monthly_payment DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas para status e análise na tabela credit_requests
ALTER TABLE public.credit_requests 
ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(20) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'approved', 'rejected', 'in_analysis', 'contracted', 'disbursed')),
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS analyzed_by UUID REFERENCES auth.users(id);

-- Habilitar RLS na tabela credit_offers
ALTER TABLE public.credit_offers ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todas as ofertas
CREATE POLICY "Admins can view all credit offers" ON public.credit_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para admins gerenciarem ofertas
CREATE POLICY "Admins can manage credit offers" ON public.credit_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para clínicas verem suas próprias ofertas
CREATE POLICY "Clinics can view their credit offers" ON public.credit_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.credit_requests cr
            JOIN public.profiles p ON p.id = cr.clinic_id
            WHERE cr.id = credit_offers.credit_request_id
            AND p.id = auth.uid()
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_offers_request_id ON public.credit_offers(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_offers_bank_name ON public.credit_offers(bank_name);
CREATE INDEX IF NOT EXISTS idx_credit_requests_analysis_status ON public.credit_requests(analysis_status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_credit_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_offers_updated_at_trigger
    BEFORE UPDATE ON public.credit_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_offers_updated_at();