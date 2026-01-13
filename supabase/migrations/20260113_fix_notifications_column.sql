-- Migração para corrigir a tabela de notificações e permitir testes
-- Renomeia a coluna 'read' para 'is_read' para manter consistência com o código frontend
-- Adiciona política de RLS para permitir que usuários criem suas próprias notificações de teste

-- 1. Renomear a coluna se ela existir como 'read'
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'read'
    ) THEN
        ALTER TABLE public.notifications RENAME COLUMN "read" TO is_read;
    END IF;
END $$;

-- 2. Garantir que a política de inserção existe para testes
-- Isto permite que o próprio usuário insira uma notificação (útil para o botão de teste no site)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users can create own notifications for testing'
    ) THEN
        CREATE POLICY "Users can create own notifications for testing" ON public.notifications
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;
