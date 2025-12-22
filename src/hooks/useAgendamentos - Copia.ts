import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRealTimeAgendamentos } from './useRealTimeAgendamentos';
import { useAutoRefresh } from './useAutoRefresh';
import { useCachedData } from './useDataCache';

export interface Agendamento {
  id: string;
  paciente_id: string;
  servico_id: string;
  profissional_id?: string;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'no_show';
  observacoes?: string;
  valor?: number;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  paciente?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  servico?: {
    id: string;
    nome: string;
    duracao_minutos: number;
    preco: number;
  };
  profissional?: {
    id: string;
    nome: string;
    especialidade?: string;
  };
}

export interface FiltrosAgendamento {
  dataInicio?: string;
  dataFim?: string;
  status?: string[];
  pacienteId?: string;
  servicoId?: string;
  profissionalId?: string;
}

export interface EstatisticasAgendamentos {
  total: number;
  confirmados: number;
  pendentes: number;
  concluidos: number;
  cancelados: number;
  noShow: number;
  faturamentoTotal: number;
  faturamentoMes: number;
  taxaOcupacao: number;
  proximosAgendamentos: number;
}

export interface UseAgendamentosReturn {
  agendamentos: Agendamento[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosAgendamento;
  setFiltros: (filtros: FiltrosAgendamento) => void;
  criarAgendamento: (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => Promise<Agendamento | null>;
  atualizarAgendamento: (id: string, dados: Partial<Agendamento>) => Promise<boolean>;
  cancelarAgendamento: (id: string, motivo?: string) => Promise<boolean>;
  confirmarAgendamento: (id: string) => Promise<boolean>;
  concluirAgendamento: (id: string) => Promise<boolean>;
  marcarNoShow: (id: string) => Promise<boolean>;
  buscarAgendamentos: (filtros?: FiltrosAgendamento) => Promise<void>;
  buscarAgendamentoPorId: (id: string) => Promise<Agendamento | null>;
  buscarAgendamentosPorData: (data: string) => Promise<Agendamento[]>;
  buscarAgendamentosPorPaciente: (pacienteId: string) => Promise<Agendamento[]>;
  obterEstatisticas: () => EstatisticasAgendamentos;
  recarregar: () => Promise<void>;
}

export function useAgendamentos(filtrosIniciais?: FiltrosAgendamento, options?: {
  enableRealTime?: boolean;
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number;
}): UseAgendamentosReturn {
  const {
    enableRealTime = true,
    enableAutoRefresh = true,
    autoRefreshInterval = 30000
  } = options || {};
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosAgendamento>(filtrosIniciais || {});

  // Gerar chave de cache baseada nos filtros
  const cacheKey = useMemo(() => {
    const filtrosAtivos = filtros;
    return `agendamentos-${JSON.stringify(filtrosAtivos)}`;
  }, [filtros]);

  // Função para buscar dados do servidor
  const fetchAgendamentos = useCallback(async (filtrosCustom?: FiltrosAgendamento) => {
    const filtrosAtivos = filtrosCustom || filtros;
    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        servicos!servico_id(id, nome, duracao_minutos, preco)
      `);

    // Aplicar filtros
    if (filtrosAtivos.dataInicio) {
      query = query.gte('data_hora', filtrosAtivos.dataInicio);
    }
    if (filtrosAtivos.dataFim) {
      query = query.lte('data_hora', filtrosAtivos.dataFim);
    }
    if (filtrosAtivos.status && filtrosAtivos.status.length > 0) {
      query = query.in('status', filtrosAtivos.status);
    }
    if (filtrosAtivos.pacienteId) {
      query = query.eq('paciente_id', filtrosAtivos.pacienteId);
    }
    if (filtrosAtivos.servicoId) {
      query = query.eq('servico_id', filtrosAtivos.servicoId);
    }
    if (filtrosAtivos.profissionalId) {
      query = query.eq('profissional_id', filtrosAtivos.profissionalId);
    }

    const { data, error: queryError } = await query.order('data_hora', { ascending: true });

    if (queryError) {
      throw queryError;
    }

    return data || [];
  }, [filtros]);

  // Usar cache para os dados
  const { data: agendamentosCache, loading: loadingCache, error: errorCache, refetch } = useCachedData(
    cacheKey,
    fetchAgendamentos,
    {
      ttl: 60000, // 1 minuto de cache
      staleWhileRevalidate: true
    }
  );

  // Sincronizar estado local com cache
  useEffect(() => {
    if (agendamentosCache) {
      setAgendamentos(agendamentosCache);
    }
  }, [agendamentosCache]);

  useEffect(() => {
    setLoading(loadingCache);
  }, [loadingCache]);

  useEffect(() => {
    if (errorCache) {
      setError(errorCache.message);
      toast.error(errorCache.message);
    } else {
      setError(null);
    }
  }, [errorCache]);

  // Buscar agendamentos (agora usa cache)
  const buscarAgendamentos = useCallback(async (filtrosCustom?: FiltrosAgendamento) => {
    try {
      if (filtrosCustom) {
        // Se filtros customizados, buscar diretamente
        setLoading(true);
        setError(null);
        const data = await fetchAgendamentos(filtrosCustom);
        setAgendamentos(data);
      } else {
        // Usar cache para filtros atuais
        await refetch();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamentos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAgendamentos, refetch]);

  // Criar novo agendamento
  const criarAgendamento = useCallback(async (novoAgendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔍 [DEBUG] useAgendamentos - Iniciando criação de agendamento');
      console.log('🔍 [DEBUG] useAgendamentos - Dados recebidos:', novoAgendamento);
      
      setError(null);

      console.log('🔍 [DEBUG] useAgendamentos - Executando query INSERT no Supabase...');
      
      const { data, error: insertError } = await supabase
        .from('agendamentos')
        .insert([novoAgendamento])
        .select(`
          *,
          servicos!servico_id(id, nome, duracao_minutos, preco)
        `)
        .single();

      console.log('🔍 [DEBUG] useAgendamentos - Resposta do Supabase:');
      console.log('🔍 [DEBUG] useAgendamentos - Data:', data);
      console.log('🔍 [DEBUG] useAgendamentos - Error:', insertError);

      if (insertError) {
        console.error('❌ [DEBUG] useAgendamentos - Erro na inserção:', insertError);
        throw insertError;
      }

      console.log('✅ [DEBUG] useAgendamentos - Agendamento inserido com sucesso!');
      
      // Atualizar lista local
      setAgendamentos(prev => {
        console.log('🔍 [DEBUG] useAgendamentos - Atualizando lista local. Lista anterior:', prev.length, 'itens');
        const novaLista = [...prev, data];
        console.log('🔍 [DEBUG] useAgendamentos - Nova lista:', novaLista.length, 'itens');
        return novaLista;
      });
      
      toast.success('Agendamento criado com sucesso!');
      
      return data;
    } catch (err) {
      console.error('❌ [DEBUG] useAgendamentos - Erro capturado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      console.error('❌ [DEBUG] useAgendamentos - Mensagem de erro:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Atualizar agendamento
  const atualizarAgendamento = useCallback(async (id: string, dados: Partial<Agendamento>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({ ...dados, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id 
            ? { ...agendamento, ...dados, updated_at: new Date().toISOString() }
            : agendamento
        )
      );

      toast.success('Agendamento atualizado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Cancelar agendamento
  const cancelarAgendamento = useCallback(async (id: string, motivo?: string) => {
    const observacoes = motivo ? `Cancelado: ${motivo}` : 'Agendamento cancelado';
    return await atualizarAgendamento(id, { status: 'cancelado', observacoes });
  }, [atualizarAgendamento]);

  // Confirmar agendamento
  const confirmarAgendamento = useCallback(async (id: string) => {
    return await atualizarAgendamento(id, { status: 'confirmado' });
  }, [atualizarAgendamento]);

  // Concluir agendamento
  const concluirAgendamento = useCallback(async (id: string) => {
    return await atualizarAgendamento(id, { status: 'concluido' });
  }, [atualizarAgendamento]);

  // Marcar como no-show
  const marcarNoShow = useCallback(async (id: string) => {
    return await atualizarAgendamento(id, { status: 'no_show' });
  }, [atualizarAgendamento]);

  // Buscar agendamento por ID
  const buscarAgendamentoPorId = useCallback(async (id: string) => {
    try {
      const { data, error: queryError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes!paciente_dados_id(id, nome, email, telefone),
          servicos!servico_id(id, nome, duracao_minutos, preco),
          clinic_professionals!profissional_id(id, user_id, role)
        `)
        .eq('id', id)
        .single();

      if (queryError) {
        throw queryError;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamento';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Buscar agendamentos por data
  const buscarAgendamentosPorData = useCallback(async (data: string) => {
    try {
      const { data: agendamentosData, error: queryError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes!paciente_dados_id(id, nome, email, telefone),
          servicos!servico_id(id, nome, duracao_minutos, preco),
          clinic_professionals!profissional_id(id, user_id, role)
        `)
        .gte('data_hora', `${data}T00:00:00`)
        .lt('data_hora', `${data}T23:59:59`)
        .order('data_hora', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      return agendamentosData || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamentos';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Buscar agendamentos por paciente
  const buscarAgendamentosPorPaciente = useCallback(async (pacienteId: string) => {
    try {
      const { data: agendamentosData, error: queryError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes!paciente_dados_id(id, nome, email, telefone),
          servicos!servico_id(id, nome, duracao_minutos, preco),
          clinic_professionals!profissional_id(id, user_id, role)
        `)
        .eq('paciente_id', pacienteId)
        .order('data_hora', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      return agendamentosData || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamentos';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Obter estatísticas dos agendamentos
  const obterEstatisticas = useCallback((): EstatisticasAgendamentos => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const total = agendamentos.length;
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const pendentes = agendamentos.filter(a => a.status === 'pendente').length;
    const concluidos = agendamentos.filter(a => a.status === 'concluido').length;
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;
    const noShow = agendamentos.filter(a => a.status === 'no_show').length;
    
    const faturamentoTotal = agendamentos
      .filter(a => a.status === 'concluido' && a.valor)
      .reduce((total, a) => total + (a.valor || 0), 0);
    
    const agendamentosMes = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data_hora);
      return dataAgendamento >= inicioMes && dataAgendamento <= fimMes;
    });
    
    const faturamentoMes = agendamentosMes
      .filter(a => a.status === 'concluido' && a.valor)
      .reduce((total, a) => total + (a.valor || 0), 0);
    
    const proximosAgendamentos = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data_hora);
      return dataAgendamento >= hoje && (a.status === 'confirmado' || a.status === 'pendente');
    }).length;
    
    // Calcular taxa de ocupação (agendamentos confirmados/concluídos vs total de slots disponíveis)
    const agendamentosAtivos = confirmados + concluidos;
    const taxaOcupacao = total > 0 ? (agendamentosAtivos / total) * 100 : 0;
    
    return {
      total,
      confirmados,
      pendentes,
      concluidos,
      cancelados,
      noShow,
      faturamentoTotal,
      faturamentoMes,
      taxaOcupacao,
      proximosAgendamentos
    };
  }, [agendamentos]);

  // Recarregar dados
  const recarregar = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Carregar dados iniciais
  useEffect(() => {
    buscarAgendamentos();
  }, [buscarAgendamentos]);

  // Atualizar quando filtros mudarem
  useEffect(() => {
    if (Object.keys(filtros).length > 0) {
      buscarAgendamentos();
    }
  }, [filtros, buscarAgendamentos]);

  // Configurar real-time subscriptions
  useRealTimeAgendamentos({
    onAgendamentoCriado: (novoAgendamento) => {
      setAgendamentos(prev => {
        // Verificar se já existe para evitar duplicatas
        const existe = prev.some(ag => ag.id === novoAgendamento.id);
        if (!existe) {
          return [...prev, novoAgendamento];
        }
        return prev;
      });
    },
    onAgendamentoAtualizado: (agendamentoAtualizado) => {
      setAgendamentos(prev => 
        prev.map(ag => 
          ag.id === agendamentoAtualizado.id ? agendamentoAtualizado : ag
        )
      );
    },
    onAgendamentoDeletado: (id) => {
      setAgendamentos(prev => prev.filter(ag => ag.id !== id));
    },
    enabled: enableRealTime
  });

  // Configurar auto-refresh
  useAutoRefresh({
    onRefresh: recarregar,
    interval: autoRefreshInterval,
    enabled: enableAutoRefresh,
    dependencies: [filtros]
  });

  return {
    agendamentos,
    loading,
    error,
    filtros,
    setFiltros,
    criarAgendamento,
    atualizarAgendamento,
    cancelarAgendamento,
    confirmarAgendamento,
    concluirAgendamento,
    marcarNoShow,
    buscarAgendamentos,
    buscarAgendamentoPorId,
    buscarAgendamentosPorData,
    buscarAgendamentosPorPaciente,
    obterEstatisticas,
    recarregar
  };
}

// Export default para compatibilidade
export default useAgendamentos;