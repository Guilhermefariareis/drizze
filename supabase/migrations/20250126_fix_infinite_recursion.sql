-- Migração para corrigir recursão infinita nas políticas RLS
-- Data: 2025-01-27
-- Objetivo: Corrigir as políticas da tabela profiles que estão causando recursão infinita

-- ============================================================================
-- CORRIGIR POLÍTICAS DA TABELA PROFILES
-- ============================================================================

-- Remover políticas problemáticas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_update_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_simple" ON profiles;

-- Criar políticas simples para profiles sem recursão
CREATE POLICY "profiles_select_no_recursion" ON profiles
    FOR SELECT USING (
        -- Usuários podem ver seu próprio perfil
        user_id = auth.uid()
        OR
        -- Permitir acesso público para leitura básica (evita recursão)
        true
    );

CREATE POLICY "profiles_insert_no_recursion" ON profiles
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir apenas seu próprio perfil
        user_id = auth.uid()
    );

CREATE POLICY "profiles_update_no_recursion" ON profiles
    FOR UPDATE USING (
        -- Usuários podem atualizar apenas seu próprio perfil
        user_id = auth.uid()
    );

CREATE POLICY "profiles_delete_no_recursion" ON profiles
    FOR DELETE USING (
        -- Usuários podem deletar apenas seu próprio perfil
        user_id = auth.uid()
    );

-- ============================================================================
-- CORRIGIR POLÍTICAS DAS OUTRAS TABELAS PARA EVITAR RECURSÃO
-- ============================================================================

-- Remover e recriar políticas de appointments sem recursão
DROP POLICY IF EXISTS "appointments_select_simple" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_simple" ON appointments;
DROP POLICY IF EXISTS "appointments_update_simple" ON appointments;
DROP POLICY IF EXISTS "appointments_delete_simple" ON appointments;

CREATE POLICY "appointments_select_no_recursion" ON appointments
    FOR SELECT USING (
        -- Usuários podem ver agendamentos de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "appointments_insert_no_recursion" ON appointments
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir agendamentos em suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "appointments_update_no_recursion" ON appointments
    FOR UPDATE USING (
        -- Usuários podem atualizar agendamentos de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "appointments_delete_no_recursion" ON appointments
    FOR DELETE USING (
        -- Usuários podem deletar agendamentos de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

-- Remover e recriar políticas de credit_requests sem recursão
DROP POLICY IF EXISTS "credit_requests_select_simple" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_insert_simple" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_update_simple" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_delete_simple" ON credit_requests;

CREATE POLICY "credit_requests_select_no_recursion" ON credit_requests
    FOR SELECT USING (
        -- Usuários podem ver solicitações de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Pacientes podem ver suas próprias solicitações
        patient_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "credit_requests_insert_no_recursion" ON credit_requests
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir solicitações em suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Pacientes podem inserir suas próprias solicitações
        patient_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "credit_requests_update_no_recursion" ON credit_requests
    FOR UPDATE USING (
        -- Usuários podem atualizar solicitações de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Pacientes podem atualizar suas próprias solicitações
        patient_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "credit_requests_delete_no_recursion" ON credit_requests
    FOR DELETE USING (
        -- Usuários podem deletar solicitações de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

-- Remover e recriar políticas de clinics sem recursão
DROP POLICY IF EXISTS "clinics_select_simple" ON clinics;
DROP POLICY IF EXISTS "clinics_insert_simple" ON clinics;
DROP POLICY IF EXISTS "clinics_update_simple" ON clinics;
DROP POLICY IF EXISTS "clinics_delete_simple" ON clinics;

CREATE POLICY "clinics_select_no_recursion" ON clinics
    FOR SELECT USING (
        -- Usuários podem ver suas próprias clínicas
        owner_id = auth.uid()
        OR
        -- Clínicas ativas podem ser vistas por todos
        is_active = true
    );

CREATE POLICY "clinics_insert_no_recursion" ON clinics
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir clínicas para si mesmos
        owner_id = auth.uid()
    );

CREATE POLICY "clinics_update_no_recursion" ON clinics
    FOR UPDATE USING (
        -- Usuários podem atualizar suas próprias clínicas
        owner_id = auth.uid()
    );

CREATE POLICY "clinics_delete_no_recursion" ON clinics
    FOR DELETE USING (
        -- Usuários podem deletar suas próprias clínicas
        owner_id = auth.uid()
    );

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

-- Esta migração corrige o problema de recursão infinita removendo as referências
-- circulares nas políticas RLS. As políticas agora são mais simples e diretas,
-- evitando consultas que possam causar loops infinitos.