-- Corrigir política RLS da tabela credit_offers
-- O problema é que a política atual está tentando fazer um JOIN incorreto

-- Remover a política existente
DROP POLICY IF EXISTS "Clinics can view their credit offers" ON public.credit_offers;

-- Criar nova política corrigida
-- A clínica pode ver ofertas se o credit_request_id corresponde a uma solicitação da sua clínica
CREATE POLICY "Clinics can view their credit offers" ON public.credit_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.credit_requests cr
            JOIN public.clinics c ON c.id = cr.clinic_id
            WHERE cr.id = credit_offers.credit_request_id
            AND (c.master_user_id = auth.uid() OR c.owner_id = auth.uid())
        )
    );

-- Verificar se a política foi criada corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'credit_offers' 
AND schemaname = 'public';