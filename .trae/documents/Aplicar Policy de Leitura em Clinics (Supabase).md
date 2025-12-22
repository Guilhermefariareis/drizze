## Objetivo

Permitir que o formulário “Simulação de Parcelas” leia clínicas no ambiente de desenvolvimento, sem exigir login, eliminando respostas vazias e erros no carregamento.

## Ações no Supabase

1. Identificar o projeto do ambiente local (instância: `irrtjredcrwucrnagune`) e abrir o SQL Editor.
2. Ativar RLS na tabela `public.clinics`:

   * `ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;`
3. Criar policies de SELECT para leitura anônima/usuários logados, cobrindo variações de schema:

   * `CREATE POLICY clinics_public_read_anon ON public.clinics FOR SELECT TO anon USING ((is_active IS TRUE) OR (active IS TRUE) OR (status = 'active') OR (is_active IS NULL AND active IS NULL AND status IS NULL));`

   * `CREATE POLICY clinics_public_read_auth ON public.clinics FOR SELECT TO authenticated USING ((is_active IS TRUE) OR (active IS TRUE) OR (status = 'active') OR (is_active IS NULL AND active IS NULL AND status IS NULL));`
4. (Opcional) Se existir uma policy anterior conflitando, remover e recriar apenas a de leitura.

## Verificação Local

1. Reiniciar o servidor de desenvolvimento e fazer hard refresh na home.
2. Validar no formulário:

   * Dropdown “Selecione a Clínica” lista clínicas da região.

   * Campo de busca por nome/cidade sugere clínicas.
3. Checar Network: a chamada a `clinics` retorna registros e não inclui `state` no `select`.

## Observações

* As policies concedem apenas SELECT; não afetam INSERT/UPDATE/DELETE.

* Não farei deploy; atuaremos apenas no projeto Supabase do ambiente local e validaremos no

