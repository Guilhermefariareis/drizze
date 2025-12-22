-- Adicionar políticas RLS para a tabela chat_sessions

-- Permitir que usuários anônimos e autenticados possam inserir sessões de chat
CREATE POLICY "Allow anonymous and authenticated users to insert chat sessions" ON chat_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir que usuários anônimos e autenticados possam visualizar suas próprias sessões
CREATE POLICY "Allow users to view their own chat sessions" ON chat_sessions
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Para usuários autenticados, verificar se é o dono da sessão
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Para usuários anônimos, permitir acesso a sessões sem user_id
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Permitir que usuários possam atualizar suas próprias sessões
CREATE POLICY "Allow users to update their own chat sessions" ON chat_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (
    -- Para usuários autenticados, verificar se é o dono da sessão
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Para usuários anônimos, permitir acesso a sessões sem user_id
    (auth.uid() IS NULL AND user_id IS NULL)
  )
  WITH CHECK (
    -- Para usuários autenticados, verificar se é o dono da sessão
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Para usuários anônimos, permitir acesso a sessões sem user_id
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Garantir que as permissões básicas estejam configuradas
GRANT SELECT, INSERT, UPDATE ON chat_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_sessions TO authenticated;

-- Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'chat_sessions';