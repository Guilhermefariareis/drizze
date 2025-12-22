-- Conceder permissões para as tabelas do sistema de agendamento
-- Garantir que os roles anon e authenticated tenham acesso adequado

-- Permissões para tabela agendamentos
GRANT SELECT, INSERT, UPDATE ON agendamentos TO authenticated;
GRANT SELECT ON agendamentos TO anon;

-- Permissões para tabela horarios_funcionamento
GRANT SELECT ON horarios_funcionamento TO authenticated;
GRANT SELECT ON horarios_funcionamento TO anon;

-- Permissões para tabela agendamento_notificacoes
GRANT SELECT, INSERT, UPDATE ON agendamento_notificacoes TO authenticated;
GRANT SELECT ON agendamento_notificacoes TO anon;

-- Permissões para tabela horarios_bloqueados
GRANT SELECT ON horarios_bloqueados TO authenticated;
GRANT SELECT ON horarios_bloqueados TO anon;

-- Permissões para sequências (se houver)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Comentário sobre as permissões
COMMENT ON TABLE agendamentos IS 'Permissões: authenticated (SELECT, INSERT, UPDATE), anon (SELECT)';
COMMENT ON TABLE horarios_funcionamento IS 'Permissões: authenticated (SELECT), anon (SELECT)';
COMMENT ON TABLE agendamento_notificacoes IS 'Permissões: authenticated (SELECT, INSERT, UPDATE), anon (SELECT)';
COMMENT ON TABLE horarios_bloqueados IS 'Permissões: authenticated (SELECT), anon (SELECT)';