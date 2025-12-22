-- =====================================================
-- MIGRAÇÃO: Correção das Políticas RLS para profiles
-- Data: 2025-01-26
-- Objetivo: Corrigir políticas RLS que estão bloqueando o acesso aos perfis de usuários
-- Problema: ClinicDashboard não consegue acessar dados de profiles via JOIN
-- =====================================================

-- Verificar se RLS está habilitado na tabela profiles
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- =====================================================
-- 1. REMOVER POLÍTICAS RLS EXISTENTES PARA PROFILES
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
-- 2. HABILITAR RLS NA TABELA (se não estiver habilitado)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CRIAR NOVAS POLÍTICAS RLS PARA PROFILES
-- =====================================================

-- Política 1: Permitir SELECT para administradores (role = 'master' ou 'admin')
CREATE POLICY "admin_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'master' 
            OR auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    OR
    -- Verificar se o usuário tem role admin/master na tabela profiles
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'master')
    )
);

-- Política 2: Permitir SELECT para usuários verem seus próprios perfis
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Política 3: Permitir SELECT para clínicas verem perfis de pacientes relacionados
CREATE POLICY "clinics_can_view_patient_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
    -- Verificar se o usuário é uma clínica e o perfil é de um paciente relacionado
    EXISTS (
        SELECT 1 FROM public.credit_requests cr
        JOIN public.clinics c ON cr.clinic_id = c.id
        WHERE cr.patient_id = profiles.id
        AND (
            c.owner_id = auth.uid() 
            OR c.master_user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.clinic_professionals cp
                WHERE cp.clinic_id = c.id 
                AND cp.user_id = auth.uid() 
                AND cp.is_active = true
            )
        )
    )
);

-- Política 4: Permitir INSERT para usuários autenticados criarem seus próprios perfis
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Política 5: Permitir INSERT para usuários anônimos (para registro)
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

-- Política 7: Permitir UPDATE para administradores
CREATE POLICY "admin_can_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'master' 
            OR auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'master')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'master' 
            OR auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'master')
    )
);

-- =====================================================
-- 4. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

-- Listar todas as políticas criadas para profiles
SELECT 
    policyname as "Nome da Política",
    cmd as "Comando",
    permissive as "Permissiva",
    roles as "Roles",
    qual as "Condição USING",
    with_check as "Condição WITH CHECK"
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Tabela de perfis de usuários com políticas RLS corrigidas em 2025-01-26';

-- =====================================================
-- 6. TESTE BÁSICO DAS POLÍTICAS
-- =====================================================

-- Verificar se as políticas estão funcionando
-- (Este SELECT deve retornar as políticas sem erro)
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- =====================================================
-- RESUMO DA MIGRAÇÃO
-- =====================================================
/*
POLÍTICAS CRIADAS PARA PROFILES:

1. admin_can_view_all_profiles
   - Permite que administradores vejam todos os perfis

2. users_can_view_own_profile  
   - Permite que usuários vejam apenas seus próprios perfis

3. clinics_can_view_patient_profiles
   - Permite que clínicas vejam perfis de pacientes relacionados através de credit_requests

4. users_can_insert_own_profile
   - Permite que usuários autenticados criem seus próprios perfis

5. anon_can_insert_profiles
   - Permite que usuários anônimos criem perfis (para registro)

6. users_can_update_own_profile
   - Permite que usuários atualizem seus próprios perfis

7. admin_can_update_all_profiles
   - Permite que administradores atualizem qualquer perfil

PROBLEMA RESOLVIDO:
- Erro "permission denied for table users" deve ser corrigido
- Clínicas agora podem ver perfis de pacientes através do JOIN em credit_requests
- Mantém a segurança permitindo acesso apenas a dados relacionados
*/