-- Conceder permissões para a tabela chat_messages
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO authenticated;

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'chat_messages'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;