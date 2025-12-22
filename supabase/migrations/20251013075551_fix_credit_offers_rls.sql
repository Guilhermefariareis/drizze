-- Correção FINAL das políticas RLS para tabela credit_offers
-- Esta migração resolve o erro "new row violates row-level security policy for table credit_offers"
-- Corrige a verificação da estrutura da tabela profiles (user_id vs id)

-- Primeiro, remover todas as políticas existentes para credit_offers
DROP POLICY IF EXISTS "Admins can insert credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can view all credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can update credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can delete credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can manage credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Clinics can view their credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Patients can view their credit offers" ON credit_offers;

-- Política para permitir que administradores insiram ofertas
-- CORREÇÃO: usar profiles.user_id = auth.uid() (não profiles.id = auth.uid())
CREATE POLICY "Admins can insert credit offers" ON credit_offers
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para permitir que administradores visualizem todas as ofertas
CREATE POLICY "Admins can view all credit offers" ON credit_offers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para permitir que administradores atualizem ofertas
CREATE POLICY "Admins can update credit offers" ON credit_offers
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para permitir que administradores deletem ofertas
CREATE POLICY "Admins can delete credit offers" ON credit_offers
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para permitir que clínicas visualizem ofertas de suas solicitações
CREATE POLICY "Clinics can view their credit offers" ON credit_offers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE cr.id = credit_offers.credit_request_id
            AND cr.clinic_id = p.id
            AND p.role = 'clinic'
        )
    );

-- Política para permitir que pacientes visualizem ofertas de suas solicitações
CREATE POLICY "Patients can view their credit offers" ON credit_offers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE cr.id = credit_offers.credit_request_id
            AND cr.patient_id = p.id
            AND p.role = 'patient'
        )
    );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT, INSERT, UPDATE, DELETE ON credit_offers TO authenticated;
GRANT SELECT ON credit_offers TO anon;

-- Garantir que RLS está habilitado
ALTER TABLE credit_offers ENABLE ROW LEVEL SECURITY;

-- Comentário para documentar a correção
COMMENT ON TABLE credit_offers IS 'Tabela de ofertas de crédito - RLS corrigido com estrutura correta da tabela profiles em ' || NOW()