import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Tipos de notificação
export interface Notificacao {
  id: string;
  tipo: 'agendamento' | 'cancelamento' | 'confirmacao' | 'lembrete' | 'sistema';
  titulo: string;
  mensagem: string;
  data_criacao: string;
  data_leitura?: string;
  lida: boolean;
  usuario_id: string;
  agendamento_id?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  acao_url?: string;
  metadata?: Record<string, any>;
}

export interface UseNotificacoesReturn {
  notificacoes: Notificacao[];
  notificacoesNaoLidas: Notificacao[];
  totalNaoLidas: number;
  loading: boolean;
  error: string | null;
  buscarNotificacoes: () => Promise<void>;
  marcarComoLida: (id: string) => Promise<boolean>;
  marcarTodasComoLidas: () => Promise<boolean>;
  criarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'data_criacao' | 'lida'>) => Promise<Notificacao | null>;
  removerNotificacao: (id: string) => Promise<boolean>;
  limparNotificacoes: () => Promise<boolean>;
}

// Configurações de notificação
export interface ConfiguracaoNotificacao {
  id: string;
  usuario_id: string;
  email_agendamentos: boolean;
  email_cancelamentos: boolean;
  email_lembretes: boolean;
  push_agendamentos: boolean;
  push_cancelamentos: boolean;
  push_lembretes: boolean;
  antecedencia_lembrete: number; // em minutos
  horario_inicio_notificacoes: string; // HH:mm
  horario_fim_notificacoes: string; // HH:mm
  dias_semana_notificacoes: number[]; // 0-6 (domingo-sábado)
  created_at: string;
  updated_at: string;
}

export interface UseConfiguracaoNotificacoesReturn {
  configuracao: ConfiguracaoNotificacao | null;
  loading: boolean;
  error: string | null;
  buscarConfiguracao: () => Promise<void>;
  atualizarConfiguracao: (dados: Partial<ConfiguracaoNotificacao>) => Promise<boolean>;
  criarConfiguracao: (dados: Omit<ConfiguracaoNotificacao, 'id' | 'created_at' | 'updated_at'>) => Promise<ConfiguracaoNotificacao | null>;
}

export function useNotificacoes(): UseNotificacoesReturn {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar notificações
  const buscarNotificacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: queryError } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(50);

      if (queryError) {
        throw queryError;
      }

      setNotificacoes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar notificações';
      setError(errorMessage);
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como lida
  const marcarComoLida = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('notificacoes')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setNotificacoes(prev => prev.map(notif => 
        notif.id === id 
          ? { ...notif, lida: true, data_leitura: new Date().toISOString() }
          : notif
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar notificação como lida';
      setError(errorMessage);
      console.error('Erro ao marcar como lida:', err);
      return false;
    }
  }, []);

  // Marcar todas como lidas
  const marcarTodasComoLidas = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: updateError } = await supabase
        .from('notificacoes')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('lida', false);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setNotificacoes(prev => prev.map(notif => ({
        ...notif,
        lida: true,
        data_leitura: new Date().toISOString()
      })));

      toast.success('Todas as notificações foram marcadas como lidas');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar todas como lidas';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Criar notificação
  const criarNotificacao = useCallback(async (novaNotificacao: Omit<Notificacao, 'id' | 'data_criacao' | 'lida'>): Promise<Notificacao | null> => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('notificacoes')
        .insert([{
          ...novaNotificacao,
          lida: false,
          data_criacao: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Adicionar ao estado local
      setNotificacoes(prev => [data, ...prev]);

      // Mostrar toast baseado na prioridade
      switch (data.prioridade) {
        case 'urgente':
          toast.error(data.titulo, { description: data.mensagem });
          break;
        case 'alta':
          toast.warning(data.titulo, { description: data.mensagem });
          break;
        case 'media':
          toast.info(data.titulo, { description: data.mensagem });
          break;
        default:
          toast(data.titulo, { description: data.mensagem });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar notificação';
      setError(errorMessage);
      console.error('Erro ao criar notificação:', err);
      return null;
    }
  }, []);

  // Remover notificação
  const removerNotificacao = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Remover do estado local
      setNotificacoes(prev => prev.filter(notif => notif.id !== id));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover notificação';
      setError(errorMessage);
      console.error('Erro ao remover notificação:', err);
      return false;
    }
  }, []);

  // Limpar todas as notificações
  const limparNotificacoes = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: deleteError } = await supabase
        .from('notificacoes')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setNotificacoes([]);
      toast.success('Todas as notificações foram removidas');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar notificações';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Carregar notificações ao montar o componente
  useEffect(() => {
    buscarNotificacoes();
  }, [buscarNotificacoes]);

  // Configurar real-time subscriptions
  useEffect(() => {
    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn('Usuário não autenticado para configurar subscriptions');
          return;
        }

        subscription = supabase
          .channel('notificacoes-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notificacoes',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              switch (payload.eventType) {
                case 'INSERT':
                  const novaNotificacao = payload.new as Notificacao;
                  setNotificacoes(prev => [novaNotificacao, ...prev]);
                  
                  // Mostrar toast para nova notificação
                  switch (novaNotificacao.prioridade) {
                    case 'urgente':
                      toast.error(novaNotificacao.titulo, { description: novaNotificacao.mensagem });
                      break;
                    case 'alta':
                      toast.warning(novaNotificacao.titulo, { description: novaNotificacao.mensagem });
                      break;
                    case 'media':
                      toast.info(novaNotificacao.titulo, { description: novaNotificacao.mensagem });
                      break;
                    default:
                      toast(novaNotificacao.titulo, { description: novaNotificacao.mensagem });
                  }
                  break;
                
                case 'UPDATE':
                  setNotificacoes(prev => prev.map(notif => 
                    notif.id === payload.new.id ? payload.new as Notificacao : notif
                  ));
                  break;
                
                case 'DELETE':
                  setNotificacoes(prev => prev.filter(notif => notif.id !== payload.old.id));
                  break;
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Erro ao configurar subscription de notificações:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Calcular notificações não lidas
  const notificacoesNaoLidas = notificacoes.filter(notif => !notif.lida);
  const totalNaoLidas = notificacoesNaoLidas.length;

  return {
    notificacoes,
    notificacoesNaoLidas,
    totalNaoLidas,
    loading,
    error,
    buscarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    criarNotificacao,
    removerNotificacao,
    limparNotificacoes
  };
}

// Hook para configurações de notificação
export function useConfiguracaoNotificacoes(): UseConfiguracaoNotificacoesReturn {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoNotificacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar configuração
  const buscarConfiguracao = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: queryError } = await supabase
        .from('configuracoes_notificacao')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      setConfiguracao(data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar configuração';
      setError(errorMessage);
      console.error('Erro ao buscar configuração:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar configuração
  const atualizarConfiguracao = useCallback(async (dados: Partial<ConfiguracaoNotificacao>): Promise<boolean> => {
    try {
      setError(null);

      if (!configuracao) {
        throw new Error('Configuração não encontrada');
      }

      const { error: updateError } = await supabase
        .from('configuracoes_notificacao')
        .update({
          ...dados,
          updated_at: new Date().toISOString()
        })
        .eq('id', configuracao.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setConfiguracao(prev => prev ? {
        ...prev,
        ...dados,
        updated_at: new Date().toISOString()
      } : null);

      toast.success('Configurações atualizadas com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [configuracao]);

  // Criar configuração
  const criarConfiguracao = useCallback(async (novaConfiguracao: Omit<ConfiguracaoNotificacao, 'id' | 'created_at' | 'updated_at'>): Promise<ConfiguracaoNotificacao | null> => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('configuracoes_notificacao')
        .insert([{
          ...novaConfiguracao,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setConfiguracao(data);
      toast.success('Configuração criada com sucesso!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar configuração';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Carregar configuração ao montar o componente
  useEffect(() => {
    buscarConfiguracao();
  }, [buscarConfiguracao]);

  return {
    configuracao,
    loading,
    error,
    buscarConfiguracao,
    atualizarConfiguracao,
    criarConfiguracao
  };
}

// Utilitários para notificações
export const NotificacaoUtils = {
  // Criar notificação de agendamento
  criarNotificacaoAgendamento: (agendamentoId: string, pacienteNome: string, dataHora: string) => ({
    tipo: 'agendamento' as const,
    titulo: 'Novo Agendamento',
    mensagem: `Agendamento marcado para ${pacienteNome} em ${dataHora}`,
    agendamento_id: agendamentoId,
    prioridade: 'media' as const
  }),

  // Criar notificação de cancelamento
  criarNotificacaoCancelamento: (agendamentoId: string, pacienteNome: string, motivo?: string) => ({
    tipo: 'cancelamento' as const,
    titulo: 'Agendamento Cancelado',
    mensagem: `Agendamento de ${pacienteNome} foi cancelado${motivo ? `: ${motivo}` : ''}`,
    agendamento_id: agendamentoId,
    prioridade: 'alta' as const
  }),

  // Criar notificação de lembrete
  criarNotificacaoLembrete: (agendamentoId: string, pacienteNome: string, dataHora: string) => ({
    tipo: 'lembrete' as const,
    titulo: 'Lembrete de Agendamento',
    mensagem: `Agendamento com ${pacienteNome} em ${dataHora}`,
    agendamento_id: agendamentoId,
    prioridade: 'media' as const
  }),

  // Criar notificação de confirmação
  criarNotificacaoConfirmacao: (agendamentoId: string, pacienteNome: string) => ({
    tipo: 'confirmacao' as const,
    titulo: 'Agendamento Confirmado',
    mensagem: `Agendamento de ${pacienteNome} foi confirmado`,
    agendamento_id: agendamentoId,
    prioridade: 'baixa' as const
  })
};