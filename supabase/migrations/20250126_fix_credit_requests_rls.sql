-- =====================================================
-- MIGRAÇÃO: Correção das Políticas RLS para credit_requests
-- Data: 2025-01-26
-- Objetivo: Corrigir políticas RLS que estão bloqueando o acesso às solicitações de crédito
-- =====================================================

-- Verificar se RLS está habilitado na tabela
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'credit_requests';

-- =====================================================
-- 1. REMOVER POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Remover todas as políticas existentes para credit_requests
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Buscar todas as políticas da tabela credit_requests
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'credit_requests' 
        AND schemaname = 'public'
    LOOP
        -- Remover cada política encontrada
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.credit_requests', policy_record.policyname);
        RAISE NOTICE 'Política removida: %', policy_record.policyname;
    END LOOP;
END $$;

-- =====================================================
-- 2. HABILITAR RLS NA TABELA (se não estiver habilitado)
-- =====================================================

ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CRIAR NOVAS POLÍTICAS RLS
-- =====================================================

-- Política 1: Permitir SELECT para administradores (role = 'master' ou 'admin')
CREATE POLICY "admin_can_view_all_credit_requests" 
ON public.credit_requests 
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
);

-- Política 2: Permitir SELECT para clínicas verem suas próprias solicitações
CREATE POLICY "clinic_can_view_own_credit_requests" 
ON public.credit_requests 
FOR SELECT 
TO authenticated 
USING (
    -- Verificar se o usuário está associado à clínica através de clinic_professionals
    EXISTS (
        SELECT 1 FROM public.clinic_professionals cp
        WHERE cp.user_id = auth.uid() 
        AND cp.clinic_id = credit_requests.clinic_id
        AND cp.is_active = true
    )
    OR
    -- Verificar se o usuário é dono da clínica (owner_id)
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE c.id = credit_requests.clinic_id 
        AND c.owner_id = auth.uid()
    )
    OR
    -- Verificar se o usuário é master da clínica (master_user_id)
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE c.id = credit_requests.clinic_id 
        AND c.master_user_id = auth.uid()
    )
);

-- Política 3: Permitir SELECT para pacientes verem suas próprias solicitações
CREATE POLICY "patient_can_view_own_credit_requests" 
ON public.credit_requests 
FOR SELECT 
TO authenticated 
USING (
    -- Verificar se o usuário é o paciente da solicitação através da tabela patients
    EXISTS (
        SELECT 1 FROM public.patients p
        JOIN public.profiles pr ON p.profile_id = pr.id
        WHERE p.id = credit_requests.patient_id 
        AND pr.user_id = auth.uid()
    )
    OR
    -- Verificar por email se não houver patient_id mas houver patient_email
    EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid() 
        AND u.email = credit_requests.patient_email
    )
    OR
    -- Verificar se o patient_id corresponde diretamente ao auth.uid() (caso seja UUID do usuário)
    credit_requests.patient_id = auth.uid()
);

-- Política 4: Permitir INSERT para usuários autenticados
CREATE POLICY "authenticated_can_insert_credit_requests" 
ON public.credit_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política 5: Permitir INSERT para usuários anônimos (para formulário público)
CREATE POLICY "anon_can_insert_credit_requests" 
ON public.credit_requests 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Política 6: Permitir UPDATE para administradores
CREATE POLICY "admin_can_update_all_credit_requests" 
ON public.credit_requests 
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
);

-- Política 7: Permitir UPDATE para clínicas em suas próprias solicitações
CREATE POLICY "clinic_can_update_own_credit_requests" 
ON public.credit_requests 
FOR UPDATE 
TO authenticated 
USING (
    -- Verificar se o usuário está associado à clínica através de clinic_professionals
    EXISTS (
        SELECT 1 FROM public.clinic_professionals cp
        WHERE cp.user_id = auth.uid() 
        AND cp.clinic_id = credit_requests.clinic_id
        AND cp.is_active = true
    )
    OR
    -- Verificar se o usuário é dono da clínica (owner_id)
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE c.id = credit_requests.clinic_id 
        AND c.owner_id = auth.uid()
    )
    OR
    -- Verificar se o usuário é master da clínica (master_user_id)
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE c.id = credit_requests.clinic_id 
        AND c.master_user_id = auth.uid()
    )
)
WITH CHECK (
    -- Mesma verificação para o CHECK
    EXISTS (
        SELECT 1 FROM public.clinic_professionals cp
        WHERE cp.user_id = auth.uid() 
        AND cp.clinic_id = credit_requests.clinic_id
        AND cp.is_active = true
    )
    OR
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE c.id = credit_requests.clinic_id 
        AND c.owner_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.clinics c
        WHERE c.id = credit_requests.clinic_id 
        AND c.master_user_id = auth.uid()
    )
);

-- =====================================================
-- 4. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

-- Listar todas as políticas criadas para credit_requests
SELECT 
    policyname as "Nome da Política",
    cmd as "Comando",
    permissive as "Permissiva",
    roles as "Roles",
    qual as "Condição USING",
    with_check as "Condição WITH CHECK"
FROM pg_policies 
WHERE tablename = 'credit_requests' 
AND schemaname = 'public'
ORDER BY policyname;

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.credit_requests IS 'Tabela de solicitações de crédito com políticas RLS corrigidas em 2025-01-26';

-- =====================================================
-- 6. TESTE BÁSICO DAS POLÍTICAS
-- =====================================================

-- Verificar se as políticas estão funcionando
-- (Este SELECT deve retornar as políticas sem erro)
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE tablename = 'credit_requests' 
AND schemaname = 'public';

-- =====================================================
-- RESUMO DA MIGRAÇÃO
-- =====================================================
/*
POLÍTICAS CRIADAS:

1. admin_can_view_all_credit_requests
   - Permite que administradores vejam todas as solicitações

2. clinic_can_view_own_credit_requests  
   - Permite que clínicas vejam apenas suas próprias solicitações

3. patient_can_view_own_credit_requests
   - Permite que pacientes vejam apenas suas próprias solicitações

4. authenticated_can_insert_credit_requests
   - Permite que usuários autenticados criem solicitações

5. anon_can_insert_credit_requests
   - Permite que usuários anônimos criem solicitações (formulário público)

6. admin_can_update_all_credit_requests
   - Permite que administradores atualizem qualquer solicitação

7. clinic_can_update_own_credit_requests
   - Permite que clínicas atualizem suas próprias solicitações

PROBLEMA RESOLVIDO:
- Erro "permission denied for table credit_requests" deve ser corrigido
- Clínicas agora podem ver suas solicitações baseado em:
  * Associação na tabela user_clinics
  * Propriedade da clínica (owner_id)
*/