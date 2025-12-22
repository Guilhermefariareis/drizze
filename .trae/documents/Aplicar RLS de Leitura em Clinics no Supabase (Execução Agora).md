## Objetivo
Habilitar leitura segura da tabela `public.clinics` no ambiente de desenvolvimento, para que o formulário “Simulação de Parcelas” liste clínicas da região sem exigir login.

## Passos de Execução (Supabase)
1. Abrir o projeto Supabase usado no dev (instância: `irrtjredcrwucrnagune`) e acessar o **SQL Editor**.
2. Executar o bloco SQL abaixo (policies apenas de SELECT, não afetam escrita):

```
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clinics_public_read_anon ON public.clinics;
DROP POLICY IF EXISTS clinics_public_read_auth ON public.clinics;

CREATE POLICY clinics_public_read_anon ON public.clinics
FOR SELECT TO anon
USING (
  (is_active IS TRUE) OR (active IS TRUE) OR (status = 'active')
  OR (is_active IS NULL AND active IS NULL AND status IS NULL)
);

CREATE POLICY clinics_public_read_auth ON public.clinics
FOR SELECT TO authenticated
USING (
  (is_active IS TRUE) OR (active IS TRUE) OR (status = 'active')
  OR (is_active IS NULL AND active IS NULL AND status IS NULL)
);
```

3. Verificar rapidamente no **Table Editor** ou rodando:
```
SELECT id, name, city, latitude, longitude FROM public.clinics ORDER BY name LIMIT 10;
```
Deve retornar linhas sem erro 42703.

## Validação Local
1. Reiniciar o servidor dev e fazer **hard refresh** (Ctrl+Shift+R) na home.
2. No formulário “Simulação de Parcelas”:
- Dropdown “Selecione a Clínica” deve listar clínicas da região.
- Campo de busca por nome/cidade deve sugerir clínicas.
- Network para `clinics` deve usar `select=id,name,city,latitude,longitude` (sem `state`).

## Reversão (se necessário)
- Para remover policies:
```
DROP POLICY IF EXISTS clinics_public_read_anon ON public.clinics;
DROP POLICY IF EXISTS clinics_public_read_auth ON public.clinics;
```
- Opcional: `ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;`

## Observações
- Não farei deploy do site; apenas policies no banco do dev.
- A policy cobre variações de schema (`is_active`, `active`, `status`) e permite leitura mesmo onde esses campos não existem.
