-- ============================================================================== 
-- CORREÇÃO IMEDIATA E DEFINITIVA PARA: infinite recursion detected in policy for relation "profiles"
-- DATA: 2026-01-13
-- ==============================================================================

-- 1. Desabilitar RLS temporariamente para evitar bloqueios durante a limpeza
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas da tabela profiles para garantir um estado limpo
DROP POLICY IF EXISTS "admin_can_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "clinics_can_view_patient_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "anon_can_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_can_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "public_profiles_access" ON profiles;
DROP POLICY IF EXISTS "service_role_access" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Criar função auxiliar para checar se é admin SEM consultart a tabela profiles
-- Esta função olha apenas os metadados do usuário ou claims do JWT
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'role') IN ('admin', 'master') 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (raw_user_meta_data->>'role' IN ('admin', 'master'))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar as políticas usando lógica NÃO-RECURSIVA

-- 4.1. Visualização (SELECT)
-- Usuário vê seu próprio perfil
CREATE POLICY "fix_users_view_own" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Admin vê tudo (usando a função segura)
CREATE POLICY "fix_admin_view_all" ON profiles
FOR SELECT USING (is_admin_safe());

-- Clínicas podem ver perfis de pacientes que têm solicitações com elas
-- IMPORTANTE: Não consultar 'profiles' aqui para validar se é clínica, usar auth metadata ou tabela clinics
CREATE POLICY "fix_clinics_view_patients" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM credit_requests cr
    WHERE cr.patient_id = profiles.id
    AND cr.clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid() OR master_user_id = auth.uid()
    )
  )
);

-- 4.2. Inserção (INSERT)
-- Usuário insere seu próprio perfil (cadastro)
CREATE POLICY "fix_users_insert_own" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anônimo pode inserir (para fluxo de signup se necessário, caso insiram profiles antes de criar user)
-- Geralmente auth.uid() é null, então cuidado. Signup triggers geralmente usam security definer.
-- Deixaremos insert para authenticated só para garantir.
-- Se seu app cria profile no signup, precisa dessa:
CREATE POLICY "fix_anon_insert_signup" ON profiles
FOR INSERT TO anon WITH CHECK (true);

-- 4.3. Atualização (UPDATE)
-- Usuário atualiza seu próprio perfil
CREATE POLICY "fix_users_update_own" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Admin atualiza qualquer perfil
CREATE POLICY "fix_admin_update_all" ON profiles
FOR UPDATE USING (is_admin_safe());

-- 5. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Garantir permissões simples
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT ON profiles TO anon;

-- Verificação final
SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'profiles';
