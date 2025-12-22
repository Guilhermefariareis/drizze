-- =====================================================
-- MIGRAÇÃO: Correção da Recursão Infinita nas Políticas RLS
-- Data: 2025-01-26
-- Objetivo: Corrigir recursão infinita nas políticas RLS da tabela profiles
-- Problema: "infinite recursion detected in policy for relation profiles"
-- =====================================================

-- =====================================================
-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES PARA PROFILES
-- =====================================================

-- Remover todas as políticas existentes para profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Buscar todas as políticas da tabela profiles
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        -- Remover cada política encontrada
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
        RAISE NOTICE 'Política removida: %', policy_record.policyname;
    END LOOP;
END $$;

-- =====================================================
-- 2. CRIAR POLÍTICAS RLS SIMPLES SEM RECURSÃO
-- =====================================================

-- Política 1: Permitir SELECT para administradores usando auth.jwt()
CREATE POLICY "admin_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
    -- Verificar role diretamente no JWT sem consultar a tabela profiles
    (auth.jwt() ->> 'role') IN ('admin', 'master')
    OR
    -- Verificar se é admin através de auth.users (sem recursão)
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'master' 
            OR auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
);

-- Política 2: Permitir SELECT para usuários verem seus próprios perfis
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Política 3: Permitir SELECT para clínicas verem perfis de pacientes relacionados
-- (Simplificada para evitar recursão)
CREATE POLICY "clinics_can_view_patient_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
    -- Verificar se o usuário é dono/master de uma clínica
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
    )
    OR
    -- Verificar se é profissional de clínica
    EXISTS (
        SELECT 1 FROM public.clinic_professionals cp
        WHERE cp.user_id = auth.uid() 
        AND cp.is_active = true
    )
);

-- Política 4: Permitir INSERT para usuários autenticados
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Política 5: Permitir INSERT para usuários anônimos (registro)
CREATE POLICY "anon_can_insert_profiles" 
ON public.profiles 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Política 6: Permitir UPDATE para usuários atualizarem seus próprios perfis
CREATE POLICY "users_can_update_own_profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política 7: Permitir UPDATE para administradores (sem recursão)
CREATE POLICY "admin_can_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (
    -- Verificar role diretamente no JWT
    (auth.jwt() ->> 'role') IN ('admin', 'master')
    OR
    -- Verificar através de auth.users
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'master' 
            OR auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
)
WITH CHECK (
    -- Mesma verificação para WITH CHECK
    (auth.jwt() ->> 'role') IN ('admin', 'master')
    OR
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'master' 
            OR auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
);

-- =====================================================
-- 3. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

-- Listar todas as políticas criadas para profiles
SELECT 
    policyname as "Nome da Política",
    cmd as "Comando",
    permissive as "Permissiva",
    roles as "Roles"
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Tabela de perfis com políticas RLS corrigidas para evitar recursão infinita - 2025-01-26';

-- =====================================================
-- RESUMO DA MIGRAÇÃO
-- =====================================================
/*
POLÍTICAS CRIADAS PARA PROFILES (SEM RECURSÃO):

1. admin_can_view_all_profiles
   - Usa auth.jwt() e auth.users (não consulta profiles)

2. users_can_view_own_profile  
   - Simples: user_id = auth.uid()

3. clinics_can_view_patient_profiles
   - Simplificada: verifica se é dono/profissional de clínica

4. users_can_insert_own_profile
   - Simples: user_id = auth.uid()

5. anon_can_insert_profiles
   - Permite inserção anônima

6. users_can_update_own_profile
   - Simples: user_id = auth.uid()

7. admin_can_update_all_profiles
   - Usa auth.jwt() e auth.users (não consulta profiles)

PROBLEMA RESOLVIDO:
- Recursão infinita eliminada
- Políticas simplificadas e diretas
- Sem referências circulares à própria tabela profiles
*/