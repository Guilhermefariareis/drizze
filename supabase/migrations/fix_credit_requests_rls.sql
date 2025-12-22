-- Corrigir políticas RLS para credit_requests
-- Permitir que pacientes autenticados possam inserir suas próprias solicitações

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;

-- Política para inserção: usuários autenticados podem inserir solicitações onde patient_id = auth.uid()
CREATE POLICY "Users can insert their own credit requests" ON credit_requests
    FOR INSERT 
    WITH CHECK (auth.uid() = patient_id);

-- Política para visualização: usuários podem ver suas próprias solicitações
CREATE POLICY "Users can view their own credit requests" ON credit_requests
    FOR SELECT 
    USING (auth.uid() = patient_id);

-- Política para clínicas: podem ver solicitações para sua clínica
CREATE POLICY "Clinics can view requests for their clinic" ON credit_requests
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM clinics 
            WHERE clinics.id = credit_requests.clinic_id 
            AND clinics.master_user_id = auth.uid()
        )
    );

-- Política para admins: podem ver todas as solicitações
CREATE POLICY "Admins can view all credit requests" ON credit_requests
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para atualização: admins e clínicas podem atualizar
CREATE POLICY "Admins and clinics can update credit requests" ON credit_requests
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM clinics 
            WHERE clinics.id = credit_requests.clinic_id 
            AND clinics.master_user_id = auth.uid()
        )
    );

-- Verificar se RLS está habilitado
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;