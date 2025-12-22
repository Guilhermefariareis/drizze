-- Temporariamente desabilitar RLS na tabela chat_sessions para debug
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;

-- Garantir permissões completas
GRANT ALL PRIVILEGES ON chat_sessions TO anon;
GRANT ALL PRIVILEGES ON chat_sessions TO authenticated;
GRANT ALL PRIVILEGES ON chat_sessions TO public;

-- Verificar o status do RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'chat_sessions';