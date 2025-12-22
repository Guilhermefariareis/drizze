-- Remover todas as políticas existentes da tabela chat_sessions
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to insert chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow users to view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow users to update their own chat sessions" ON chat_sessions;

-- Criar políticas mais simples e permissivas
-- Permitir que qualquer usuário (anônimo ou autenticado) possa inserir
CREATE POLICY "Enable insert for all users" ON chat_sessions
  FOR INSERT
  WITH CHECK (true);

-- Permitir que qualquer usuário possa visualizar
CREATE POLICY "Enable select for all users" ON chat_sessions
  FOR SELECT
  USING (true);

-- Permitir que qualquer usuário possa atualizar
CREATE POLICY "Enable update for all users" ON chat_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Garantir permissões básicas
GRANT ALL ON chat_sessions TO anon;
GRANT ALL ON chat_sessions TO authenticated;

-- Verificar as políticas criadas
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'chat_sessions';