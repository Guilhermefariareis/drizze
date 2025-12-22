-- Verificar e corrigir políticas RLS para horarios_funcionamento

-- Primeiro, vamos ver as políticas existentes
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'horarios_funcionamento';

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "horarios_funcionamento_select_policy" ON horarios_funcionamento;
DROP POLICY IF EXISTS "horarios_funcionamento_insert_policy" ON horarios_funcionamento;
DROP POLICY IF EXISTS "horarios_funcionamento_update_policy" ON horarios_funcionamento;
DROP POLICY IF EXISTS "horarios_funcionamento_delete_policy" ON horarios_funcionamento;

-- Criar políticas RLS mais permissivas para authenticated users
-- Política para SELECT: usuários autenticados podem ver horários de suas clínicas
CREATE POLICY "horarios_funcionamento_select_policy" ON horarios_funcionamento
    FOR SELECT
    TO authenticated
    USING (true); -- Permitir ver todos os horários por enquanto

-- Política para INSERT: usuários autenticados podem inserir horários
CREATE POLICY "horarios_funcionamento_insert_policy" ON horarios_funcionamento
    FOR INSERT
    TO authenticated
    WITH CHECK (true); -- Permitir inserir qualquer horário por enquanto

-- Política para UPDATE: usuários autenticados podem atualizar horários
CREATE POLICY "horarios_funcionamento_update_policy" ON horarios_funcionamento
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE: usuários autenticados podem deletar horários
CREATE POLICY "horarios_funcionamento_delete_policy" ON horarios_funcionamento
    FOR DELETE
    TO authenticated
    USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Conceder permissões básicas
GRANT SELECT ON horarios_funcionamento TO anon;
GRANT ALL PRIVILEGES ON horarios_funcionamento TO authenticated;

-- Verificar as políticas criadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'horarios_funcionamento'
ORDER BY policyname;

-- Verificar permissões da tabela
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'horarios_funcionamento' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;