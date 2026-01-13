-- Disable RLS on agendamentos table to fix visibility issues
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;

-- Also ensure that if we re-enable, we have a permissive policy for testing
DROP POLICY IF EXISTS "Pacientes podem ver seus próprios agendamentos" ON agendamentos;
CREATE POLICY "Pacientes podem ver seus próprios agendamentos" ON agendamentos
    FOR SELECT USING (paciente_id = auth.uid());
