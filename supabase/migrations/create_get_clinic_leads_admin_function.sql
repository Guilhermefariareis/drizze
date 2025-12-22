-- Criar função RPC para buscar clinic_leads sem problemas de RLS
CREATE OR REPLACE FUNCTION get_clinic_leads_admin()
RETURNS TABLE (
  id bigint,
  nome text,
  nome_clinica text,
  email text,
  telefone text,
  cidade text,
  especialidade text,
  created_at timestamptz
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Retornar todos os dados da tabela clinic_leads
  RETURN QUERY
  SELECT 
    cl.id,
    cl.nome,
    cl.nome_clinica,
    cl.email,
    cl.telefone,
    cl.cidade,
    cl.especialidade,
    cl.created_at
  FROM public.clinic_leads cl
  ORDER BY cl.created_at DESC;
END;
$$;

-- Dar permissão para executar a função
GRANT EXECUTE ON FUNCTION get_clinic_leads_admin() TO anon;
GRANT EXECUTE ON FUNCTION get_clinic_leads_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_clinic_leads_admin() TO service_role;

-- Comentário explicativo
COMMENT ON FUNCTION get_clinic_leads_admin() IS 'Função para buscar todos os clinic_leads para administradores, evitando problemas de RLS';