-- Conceder permissões para as novas tabelas do sistema de agendamento
-- Tabelas: pacientes, servicos

-- Permissões para tabela pacientes
GRANT SELECT, INSERT, UPDATE ON pacientes TO authenticated;
GRANT SELECT ON pacientes TO anon;

-- Permissões para tabela servicos
GRANT SELECT, INSERT, UPDATE, DELETE ON servicos TO authenticated;
GRANT SELECT ON servicos TO anon;

-- Permissões para sequências (se houver)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Comentários sobre as permissões
COMMENT ON TABLE pacientes IS 'Permissões: authenticated (SELECT, INSERT, UPDATE), anon (SELECT)';
COMMENT ON TABLE servicos IS 'Permissões: authenticated (SELECT, INSERT, UPDATE, DELETE), anon (SELECT)';