-- Script para excluir completamente a tabela credit_requests
-- Este script remove a tabela e todas as suas dependências

-- Primeiro, remover todas as políticas RLS
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Users can insert their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can update requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON credit_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON credit_requests;

-- Remover índices se existirem
DROP INDEX IF EXISTS idx_credit_requests_patient_id;
DROP INDEX IF EXISTS idx_credit_requests_clinic_id;
DROP INDEX IF EXISTS idx_credit_requests_status;
DROP INDEX IF EXISTS idx_credit_requests_created_at;

-- Finalmente, excluir a tabela completamente
DROP TABLE IF EXISTS credit_requests CASCADE;

-- Verificar se a tabela foi removida
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'credit_requests'
        ) 
        THEN 'ERRO: Tabela credit_requests ainda existe!' 
        ELSE 'SUCESSO: Tabela credit_requests foi removida completamente.'
    END as resultado;