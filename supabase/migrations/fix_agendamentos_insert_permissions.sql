-- Adicionar permissões de INSERT para agendamentos

-- Garantir que o role anon tenha permissão de INSERT na tabela agendamentos
GRANT INSERT ON agendamentos TO anon;

-- Criar política que permite ao role anon inserir agendamentos
DROP POLICY IF EXISTS "anon_can_insert_agendamentos" ON agendamentos;
CREATE POLICY "anon_can_insert_agendamentos" ON agendamentos
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Garantir que authenticated users também tenham todas as permissões
GRANT ALL PRIVILEGES ON agendamentos TO authenticated;

-- Verificar se as permissões foram aplicadas corretamente
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'agendamentos'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name