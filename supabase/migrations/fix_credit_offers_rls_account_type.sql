-- Correção das políticas RLS para tabela credit_offers - Considerando account_type
-- Esta migração resolve problemas de inconsistência entre role e account_type

-- Primeiro, remover todas as políticas existentes para credit_offers
DROP POLICY IF EXISTS "Admins can insert credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can view all credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can update credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Admins can delete credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Clinics can view their credit offers" ON credit_offers;
DROP POLICY IF EXISTS "Patients can view their credit offers" ON credit_offers;

-- Política para permitir que administradores insiram ofertas
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

-- Política CORRIGIDA para permitir que clínicas visualizem ofertas
-- Considera tanto role='clinic' quanto account_type='clinica' com role='admin'
CREATE POLICY "Clinics can view their credit offers" ON credit_offers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_requests cr
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE cr.id = credit_offers.credit_request_id
            AND (
                -- Caso 1: Role clinic normal
                (cr.clinic_id = p.id AND p.role = 'clinic')
                OR
                -- Caso 2: Admin com account_type clinica (caso do edeventosproducoes@gmail.com)
                (p.role = 'admin' AND p.account_type = 'clinica')
                OR
                -- Caso 3: Admin geral pode ver tudo
                (p.role = 'admin' AND p.account_type IS NULL)
            )
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
            AND (p.role = 'patient' OR p.account_type = 'paciente')
        )
    );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT, INSERT, UPDATE, DELETE ON credit_offers TO authenticated;
GRANT SELECT ON credit_offers TO anon;

-- Comentário para documentar a correção
COMMENT ON TABLE credit_offers IS 'Tabela de ofertas de crédito - RLS corrigido para account_type em ' || NOW();