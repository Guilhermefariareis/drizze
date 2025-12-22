-- Script para configurar políticas RLS corretas para a tabela credit_requests
-- Políticas seguras e bem definidas desde o início

-- Política para pacientes: podem visualizar e inserir suas próprias solicitações
CREATE POLICY "Patients can view their own credit requests" ON credit_requests
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        patient_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'patient'
        )
    );

CREATE POLICY "Patients can insert their own credit requests" ON credit_requests
    FOR INSERT WITH CHECK (
        patient_id = auth.uid() OR 
        patient_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'patient'
        )
    );

-- Política para clínicas: podem visualizar e atualizar solicitações direcionadas a elas
CREATE POLICY "Clinics can view requests directed to them" ON credit_requests
    FOR SELECT USING (
        clinic_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'clinic'
        )
    );

CREATE POLICY "Clinics can update requests directed to them" ON credit_requests
    FOR UPDATE USING (
        clinic_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'clinic'
        )
    );

-- Política para administradores: podem visualizar, atualizar e deletar todas as solicitações
CREATE POLICY "Admins can manage all credit requests" ON credit_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'master')
        )
    );

-- Conceder permissões básicas para os roles
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'credit_requests'
ORDER BY policyname;