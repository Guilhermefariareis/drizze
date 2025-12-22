-- Garantir permissões para a tabela horarios_funcionamento

-- Conceder permissões para o role authenticated
GRANT ALL PRIVILEGES ON horarios_funcionamento TO authenticated;

-- Conceder permissões para o role anon (se necessário)
GRANT SELECT ON horarios_funcionamento TO anon;

-- Verificar se as políticas RLS estão configuradas corretamente
-- Política para permitir que usuários autenticados vejam apenas horários de sua clínica
DROP POLICY IF EXISTS "Users can view horarios from their clinic" ON horarios_funcionamento;
CREATE POLICY "Users can view horarios from their clinic" ON horarios_funcionamento
    FOR SELECT USING (
        clinica_id = (auth.jwt() ->> 'clinica_id')::uuid OR
        clinica_id = auth.uid()
    );

-- Política para permitir que usuários autenticados insiram horários para sua clínica
DROP POLICY IF EXISTS "Users can insert horarios for their clinic" ON horarios_funcionamento;
CREATE POLICY "Users can insert horarios for their clinic" ON horarios_funcionamento
    FOR INSERT WITH CHECK (
        clinica_id = (auth.jwt() ->> 'clinica_id')::uuid OR
        clinica_id = auth.uid()
    );

-- Política para permitir que usuários autenticados atualizem horários de sua clínica
DROP POLICY IF EXISTS "Users can update horarios from their clinic" ON horarios_funcionamento;
CREATE POLICY "Users can update horarios from their clinic" ON horarios_funcionamento
    FOR UPDATE USING (
        clinica_id = (auth.jwt() ->> 'clinica_id')::uuid OR
        clinica_id = auth.uid()
    );

-- Política para permitir que usuários autenticados deletem horários de sua clínica
DROP POLICY IF EXISTS "Users can delete horarios from their clinic" ON horarios_funcionamento;
CREATE POLICY "Users can delete horarios from their clinic" ON horarios_funcionamento
    FOR DELETE USING (
        clinica_id = (auth.jwt() ->> 'clinica_id')::uuid OR
        clinica_id = auth.uid()
    );

-- Verificar se RLS está habilitado
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;