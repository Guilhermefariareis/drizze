-- Corrigir permissões da tabela agendamentos para permitir acesso do role anon

-- Primeiro, vamos verificar as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de agendamentos para anon" ON agendamentos;
DROP POLICY IF EXISTS "Permitir leitura de agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "anon_select_agendamentos" ON agendamentos;

-- Criar uma política que permite ao role anon ler todos os agendamentos
CREATE POLICY "anon_can_read_agendamentos" ON agendamentos
    FOR SELECT
    TO anon
    USING (true);

-- Garantir que o role anon tenha permissão de SELECT na tabela
GRANT SELECT ON agendamentos TO anon;

-- Também garantir permissões para authenticated users
CREATE POLICY "authenticated_can_manage_agendamentos" ON agendamentos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

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
ORDER BY table_name, grantee;