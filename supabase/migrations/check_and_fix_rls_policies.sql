-- Verificar políticas RLS existentes na tabela chat_messages
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chat_messages';

-- Remover todas as políticas RLS restritivas da tabela chat_messages
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete_policy" ON chat_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chat_messages;
DROP POLICY IF EXISTS "Enable update for users based on email" ON chat_messages;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON chat_messages;

-- Criar políticas RLS mais permissivas
CREATE POLICY "Allow all operations for anon and authenticated" ON chat_messages
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Verificar se as políticas foram aplicadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chat_messages';