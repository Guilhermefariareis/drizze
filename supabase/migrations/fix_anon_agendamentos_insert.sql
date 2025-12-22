-- Permitir que usuários anônimos criem agendamentos
-- Esta política é necessária para que o frontend funcione corretamente

-- Política para permitir que usuários anônimos criem agendamentos
CREATE POLICY "anon_can_insert_agendamentos" ON agendamentos
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Verificar se a política foi aplicada
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'agendamentos' AND policyname = 'anon_can_insert_agendamentos';