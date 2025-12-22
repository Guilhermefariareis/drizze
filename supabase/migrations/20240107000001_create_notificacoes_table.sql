-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error')),
  lida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_leitura TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem apenas suas notificações
CREATE POLICY "Users can view own notifications" ON public.notificacoes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir notificações (sistema pode criar para qualquer usuário)
CREATE POLICY "System can insert notifications" ON public.notificacoes
  FOR INSERT WITH CHECK (true);

-- Política para atualizar próprias notificações (marcar como lida)
CREATE POLICY "Users can update own notifications" ON public.notificacoes
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para deletar próprias notificações
CREATE POLICY "Users can delete own notifications" ON public.notificacoes
  FOR DELETE USING (auth.uid() = user_id);

-- Conceder permissões aos roles
GRANT ALL PRIVILEGES ON public.notificacoes TO authenticated;
GRANT SELECT ON public.notificacoes TO anon;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notificacoes_updated_at
  BEFORE UPDATE ON public.notificacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas notificações de exemplo
INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo) VALUES
  (auth.uid(), 'Bem-vindo ao Doutorizze!', 'Sua conta foi criada com sucesso. Explore todas as funcionalidades disponíveis.', 'success'),
  (auth.uid(), 'Sistema de Agendamentos', 'O novo sistema de agendamentos está disponível. Acesse o menu para começar a usar.', 'info');