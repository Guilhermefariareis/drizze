-- Migração para corrigir todas as políticas RLS que fazem referência à tabela users
-- Data: 2025-01-26
-- Objetivo: Remover todas as políticas problemáticas e recriar políticas simples usando apenas auth.uid()

-- ============================================================================
-- PARTE 1: REMOVER TODAS AS POLÍTICAS RLS PROBLEMÁTICAS
-- ============================================================================

-- Remover políticas da tabela appointments
DROP POLICY IF EXISTS "appointments_select_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_delete_policy" ON appointments;
DROP POLICY IF EXISTS "Enable read access for clinic owners" ON appointments;
DROP POLICY IF EXISTS "Enable insert for clinic owners" ON appointments;
DROP POLICY IF EXISTS "Enable update for clinic owners" ON appointments;
DROP POLICY IF EXISTS "Enable delete for clinic owners" ON appointments;

-- Remover políticas da tabela credit_requests
DROP POLICY IF EXISTS "credit_requests_select_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_insert_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_update_policy" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_delete_policy" ON credit_requests;
DROP POLICY IF EXISTS "Enable read access for clinic owners" ON credit_requests;
DROP POLICY IF EXISTS "Enable insert for clinic owners" ON credit_requests;
DROP POLICY IF EXISTS "Enable update for clinic owners" ON credit_requests;
DROP POLICY IF EXISTS "Enable delete for clinic owners" ON credit_requests;
DROP POLICY IF EXISTS "Clinic owners can view their credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinic owners can update their credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admin can view all credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admin can update all credit requests" ON credit_requests;

-- Remover políticas da tabela clinics
DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;
DROP POLICY IF EXISTS "clinics_insert_policy" ON clinics;
DROP POLICY IF EXISTS "clinics_update_policy" ON clinics;
DROP POLICY IF EXISTS "clinics_delete_policy" ON clinics;
DROP POLICY IF EXISTS "Enable read access for clinic owners" ON clinics;
DROP POLICY IF EXISTS "Enable insert for clinic owners" ON clinics;
DROP POLICY IF EXISTS "Enable update for clinic owners" ON clinics;
DROP POLICY IF EXISTS "Enable delete for clinic owners" ON clinics;
DROP POLICY IF EXISTS "Clinic owners can view their clinic" ON clinics;
DROP POLICY IF EXISTS "Clinic owners can update their clinic" ON clinics;

-- Remover políticas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable delete for own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- ============================================================================
-- PARTE 2: CRIAR POLÍTICAS RLS SIMPLES USANDO APENAS auth.uid()
-- ============================================================================

-- Políticas para a tabela appointments
CREATE POLICY "appointments_select_simple" ON appointments
    FOR SELECT USING (
        -- Usuários podem ver agendamentos de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Admins podem ver todos
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "appointments_insert_simple" ON appointments
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir agendamentos em suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Admins podem inserir em qualquer lugar
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "appointments_update_simple" ON appointments
    FOR UPDATE USING (
        -- Usuários podem atualizar agendamentos de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Admins podem atualizar qualquer agendamento
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "appointments_delete_simple" ON appointments
    FOR DELETE USING (
        -- Usuários podem deletar agendamentos de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Admins podem deletar qualquer agendamento
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

-- Políticas para a tabela credit_requests
CREATE POLICY "credit_requests_select_simple" ON credit_requests
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
        OR
        -- Admins podem ver todas
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "credit_requests_insert_simple" ON credit_requests
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
        OR
        -- Admins podem inserir em qualquer lugar
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "credit_requests_update_simple" ON credit_requests
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
        OR
        -- Admins podem atualizar qualquer solicitação
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "credit_requests_delete_simple" ON credit_requests
    FOR DELETE USING (
        -- Usuários podem deletar solicitações de suas clínicas
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
        OR
        -- Admins podem deletar qualquer solicitação
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

-- Políticas para a tabela clinics
CREATE POLICY "clinics_select_simple" ON clinics
    FOR SELECT USING (
        -- Usuários podem ver suas próprias clínicas
        owner_id = auth.uid()
        OR
        -- Admins podem ver todas as clínicas
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
        OR
        -- Clínicas públicas podem ser vistas por todos
        is_active = true
    );

CREATE POLICY "clinics_insert_simple" ON clinics
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir clínicas para si mesmos
        owner_id = auth.uid()
        OR
        -- Admins podem inserir clínicas para qualquer usuário
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "clinics_update_simple" ON clinics
    FOR UPDATE USING (
        -- Usuários podem atualizar suas próprias clínicas
        owner_id = auth.uid()
        OR
        -- Admins podem atualizar qualquer clínica
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

CREATE POLICY "clinics_delete_simple" ON clinics
    FOR DELETE USING (
        -- Usuários podem deletar suas próprias clínicas
        owner_id = auth.uid()
        OR
        -- Admins podem deletar qualquer clínica
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master')
        )
    );

-- Políticas para a tabela profiles
CREATE POLICY "profiles_select_simple" ON profiles
    FOR SELECT USING (
        -- Usuários podem ver seu próprio perfil
        user_id = auth.uid()
        OR
        -- Admins podem ver todos os perfis
        EXISTS (
            SELECT 1 FROM profiles p2
            WHERE p2.user_id = auth.uid() 
            AND p2.role IN ('admin', 'master')
        )
    );

CREATE POLICY "profiles_insert_simple" ON profiles
    FOR INSERT WITH CHECK (
        -- Usuários podem inserir seu próprio perfil
        user_id = auth.uid()
        OR
        -- Admins podem inserir perfis para qualquer usuário
        EXISTS (
            SELECT 1 FROM profiles p2
            WHERE p2.user_id = auth.uid() 
            AND p2.role IN ('admin', 'master')
        )
    );

CREATE POLICY "profiles_update_simple" ON profiles
    FOR UPDATE USING (
        -- Usuários podem atualizar seu próprio perfil
        user_id = auth.uid()
        OR
        -- Admins podem atualizar qualquer perfil
        EXISTS (
            SELECT 1 FROM profiles p2
            WHERE p2.user_id = auth.uid() 
            AND p2.role IN ('admin', 'master')
        )
    );

CREATE POLICY "profiles_delete_simple" ON profiles
    FOR DELETE USING (
        -- Usuários podem deletar seu próprio perfil
        user_id = auth.uid()
        OR
        -- Admins podem deletar qualquer perfil
        EXISTS (
            SELECT 1 FROM profiles p2
            WHERE p2.user_id = auth.uid() 
            AND p2.role IN ('admin', 'master')
        )
    );

-- ============================================================================
-- PARTE 3: GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================================================

-- Habilitar RLS nas tabelas se não estiver habilitado
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

-- Esta migração remove todas as políticas RLS que podem estar fazendo referência
-- à tabela 'users' do sistema de autenticação do Supabase e as substitui por
-- políticas simples que usam apenas auth.uid() e consultas diretas às tabelas
-- do esquema 'public'.
--
-- As novas políticas são mais simples e evitam problemas de permissão ao
-- tentar acessar a tabela 'users' do esquema 'auth'.