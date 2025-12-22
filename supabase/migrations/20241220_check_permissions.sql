-- Verificar permissões atuais das tabelas do chat
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('chat_conversations', 'chat_messages', 'faq_items') 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Garantir permissões para as tabelas do chat
GRANT SELECT, INSERT, UPDATE ON chat_conversations TO authenticated;
GRANT SELECT ON chat_conversations TO anon;

GRANT SELECT, INSERT ON chat_messages TO authenticated;
GRANT SELECT ON chat_messages TO anon;

GRANT SELECT ON faq_items TO authenticated;
GRANT SELECT ON faq_items TO anon;

-- Verificar se as políticas RLS estão ativas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('chat_conversations', 'chat_messages', 'faq_items');

-- Criar políticas RLS se não existirem
DO $$
BEGIN
  -- Políticas para chat_conversations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can view own conversations') THEN
    CREATE POLICY "Users can view own conversations" ON chat_conversations 
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can create conversations') THEN
    CREATE POLICY "Users can create conversations" ON chat_conversations 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can update own conversations') THEN
    CREATE POLICY "Users can update own conversations" ON chat_conversations 
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  
  -- Políticas para chat_messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view messages from accessible conversations') THEN
    CREATE POLICY "Users can view messages from accessible conversations" ON chat_messages 
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM chat_conversations 
        WHERE id = conversation_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
      )
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can create messages in accessible conversations') THEN
    CREATE POLICY "Users can create messages in accessible conversations" ON chat_messages 
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM chat_conversations 
        WHERE id = conversation_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
      )
    );
  END IF;
  
  -- Políticas para faq_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faq_items' AND policyname = 'Anyone can view active FAQ items') THEN
    CREATE POLICY "Anyone can view active FAQ items" ON faq_items 
    FOR SELECT USING (is_active = true);
  END IF;
END $$;