-- Migração para corrigir acesso à tabela credit_requests
-- Data: 2025-01-26
-- Objetivo: Remover foreign keys que fazem referência à tabela auth.users

-- ============================================================================
-- PARTE 1: REMOVER FOREIGN KEYS PROBLEMÁTICAS
-- ============================================================================

-- Remover foreign keys que fazem referência à tabela auth.users
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_analyzed_by_fkey;
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_approved_by_fkey;
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_rejected_by_fkey;

-- ============================================================================
-- PARTE 2: RECRIAR POLÍTICAS RLS MAIS ESPECÍFICAS
-- ============================================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "credit_requests_select_no_recursion" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_insert_no_recursion" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_update_no_recursion" ON credit_requests;
DROP POLICY IF EXISTS "credit_requests_delete_no_recursion" ON credit_requests;

-- Criar políticas mais específicas e simples
CREATE POLICY "credit_requests_select_clinic_only" ON credit_requests
    FOR SELECT USING (
        -- Apenas usuários que são donos da clínica podem ver as solicitações
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "credit_requests_insert_clinic_only" ON credit_requests
    FOR INSERT WITH CHECK (
        -- Apenas usuários que são donos da clínica podem inserir solicitações
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "credit_requests_update_clinic_only" ON credit_requests
    FOR UPDATE USING (
        -- Apenas usuários que são donos da clínica podem atualizar solicitações
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "credit_requests_delete_clinic_only" ON credit_requests
    FOR DELETE USING (
        -- Apenas usuários que são donos da clínica podem deletar solicitações
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

-- ============================================================================
-- PARTE 3: GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================================================

-- Habilitar RLS na tabela se não estiver habilitado
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

-- Esta migração remove as foreign keys que fazem referência à tabela auth.users
-- e simplifica as políticas RLS para evitar problemas de permissão.
-- 
-- As colunas analyzed_by, approved_by e rejected_by continuam existindo como UUID,
-- mas não têm mais constraint de foreign key para auth.users.
--
-- Isso permite que a aplicação funcione sem tentar acessar a tabela auth.users
-- diretamente através das foreign keys.