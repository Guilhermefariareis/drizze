import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRealTimeAgendamentos } from './useRealTimeAgendamentos.tsx';
import { useAutoRefresh } from './useAutoRefresh.tsx';
import { useCachedData } from './useDataCache.tsx';
import { NotificacaoService } from '@/services/notificacaoService';

export interface Agendamento {
  id: string;
  paciente_id: string;
  paciente_dados_id?: string;
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
  clinica?: {
    id: string;
    name: string;
    city?: string;
    phone?: string;
    address?: string;
  };
}

export interface FiltrosAgendamento {
  dataInicio?: string;
  dataFim?: string;
  status?: string[];
  pacienteId?: string;
  servicoId?: string;
  profissionalId?: string;
  clinicaId?: string;
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
  console.log('🚨 [CRÍTICO] useAgendamentos INICIALIZADO');
  console.log('🚨 [CRÍTICO] Filtros iniciais:', JSON.stringify(filtrosIniciais, null, 2));
  console.log('🚨 [CRÍTICO] Options:', JSON.stringify(options, null, 2));

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
    console.log('🚨 [CRÍTICO] fetchAgendamentos INICIADO');
    console.log('🚨 [CRÍTICO] Filtros recebidos (custom):', JSON.stringify(filtrosCustom, null, 2));
    console.log('🚨 [CRÍTICO] Filtros atuais (state):', JSON.stringify(filtros, null, 2));
    console.log('🚨 [CRÍTICO] Filtros ativos (final):', JSON.stringify(filtrosAtivos, null, 2));

    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        paciente:paciente_dados_id(id, nome, email, telefone),
        clinica:clinica_id(id, name, city, phone, address),
        profissional:profissional_id(id, profiles(nome:full_name)),
        servico:servico_id(id, nome, preco, duracao_minutos)
      `);

    console.log('🔍 [DEBUG] Buscando agendamentos com filtros:', JSON.stringify(filtrosAtivos, null, 2));

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
    if (filtrosAtivos.clinicaId) {
      query = query.eq('clinica_id', filtrosAtivos.clinicaId);
    }

    const { data, error: queryError } = await query.order('data_hora', { ascending: true });

    if (queryError) {
      console.error('🚨 [ERROR] Erro na query de agendamentos:', queryError);
      throw queryError;
    }

    console.log('✅ [SUCCESS] Agendamentos retornados da query:', data?.length || 0);
    console.log('📋 [DATA] Primeiros 2 agendamentos:', JSON.stringify(data?.slice(0, 2), null, 2));
    console.log('🚨 [CRÍTICO] TODOS os agendamentos retornados:', JSON.stringify(data, null, 2));

    // Transformar dados para achatar o nome do profissional
    const agendamentosFormatados = (data || []).map((item: any) => ({
      ...item,
      profissional: item.profissional ? {
        id: item.profissional.id,
        nome: item.profissional.profiles?.nome || 'Profissional não informado',
        especialidade: item.profissional.especialidade
      } : undefined
    }));

    return agendamentosFormatados;
  }, [filtros]);

  // Usar cache para os dados
  const { data: agendamentosCache, loading: loadingCache, error: errorCache, refetch } = useCachedData(
    cacheKey,
    fetchAgendamentos,
    {
      ttl: 60000 // 1 minuto de cache
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

      // Campos válidos da tabela agendamentos conforme schema
      const camposValidos = [
        'paciente_id',
        'clinica_id',
        'profissional_id',
        'data_hora',
        'tipo_consulta',
        'status',
        'observacoes',
        'codigo_confirmacao',
        'valor',
        'paciente_dados_id',
        'servico_id',
        'tipo_agendamento',
        'external_id',
        'booking_source',
        'chat_session_id',
        'dados_coletados_chat'
      ];

      // Filtrar apenas campos válidos e remover campos problemáticos
      const dadosLimpos: any = {};

      // Map tipo_agendamento to tipo_consulta if exists
      if (novoAgendamento.hasOwnProperty('tipo_agendamento')) {
        dadosLimpos.tipo_consulta = (novoAgendamento as any).tipo_agendamento;
      }

      // Copiar apenas campos válidos
      camposValidos.forEach(campo => {
        if (novoAgendamento.hasOwnProperty(campo)) {
          dadosLimpos[campo] = (novoAgendamento as any)[campo];
        }
      });

      console.log('🚨 [CRÍTICO] Campos removidos (não existem na tabela):');
      Object.keys(novoAgendamento).forEach(campo => {
        if (!camposValidos.includes(campo)) {
          console.log(`❌ Removido: ${campo} = ${(novoAgendamento as any)[campo]}`);
        }
      });

      // Preservar dados do paciente interno nas observações
      let observacoesExtras = '';
      if ((novoAgendamento as any).nome_paciente) {
        observacoesExtras += `Paciente: ${(novoAgendamento as any).nome_paciente}\n`;
      }
      if ((novoAgendamento as any).telefone_paciente) {
        observacoesExtras += `Telefone: ${(novoAgendamento as any).telefone_paciente}\n`;
      }

      if (observacoesExtras) {
        dadosLimpos.observacoes = dadosLimpos.observacoes
          ? `${observacoesExtras}\n${dadosLimpos.observacoes}`
          : observacoesExtras;
      }

      // Verificar clinica_id
      if (!dadosLimpos.clinica_id || dadosLimpos.clinica_id === '') {
        console.error('🚨 [CRÍTICO] clinica_id está vazio! BLOQUEANDO INSERÇÃO!');
        throw new Error('ID da clínica é obrigatório e não pode estar vazio');
      }

      // Remover campos UUID vazios para evitar erro no Supabase
      if (dadosLimpos.paciente_id === '' || dadosLimpos.paciente_id === null) {
        console.log('🧹 Removendo paciente_id vazio');
        delete dadosLimpos.paciente_id;
      }

      if (dadosLimpos.paciente_dados_id === '' || dadosLimpos.paciente_dados_id === null) {
        console.log('🧹 Removendo paciente_dados_id vazio');
        delete dadosLimpos.paciente_dados_id;
      }

      if (dadosLimpos.servico_id === '' || dadosLimpos.servico_id === null) {
        console.log('🧹 Removendo servico_id vazio');
        delete dadosLimpos.servico_id;
      }

      if (dadosLimpos.profissional_id === '' || dadosLimpos.profissional_id === null || dadosLimpos.profissional_id === 'any') {
        console.log('🧹 Removendo profissional_id vazio ou inválido');
        delete dadosLimpos.profissional_id;
      }

      console.log('🚨 [CRÍTICO] Dados limpos para inserção:', JSON.stringify(dadosLimpos, null, 2));

      setError(null);

      const { data, error: insertError } = await supabase
        .from('agendamentos')
        .insert([dadosLimpos])
        .select(`
          *,
          paciente:paciente_dados_id(id, nome, email, telefone),
          clinica:clinica_id(id, name, city, phone, address),
          profissional:profissional_id(id, profiles(nome:full_name)),
          servico:servico_id(id, nome, preco, duracao_minutos)
        `)
        .single();

      if (insertError) {
        console.error('🚨 [CRÍTICO] ERRO NA INSERÇÃO:', insertError);
        console.error('🚨 [CRÍTICO] Dados que causaram o erro:', JSON.stringify(dadosLimpos, null, 2));
        setError(JSON.stringify(insertError));
        throw insertError;
      }

      // Transformar dados para achatar o nome do profissional
      const item: any = data;
      const agendamentoFormatado = {
        ...item,
        profissional: item.profissional ? {
          id: item.profissional.id,
          nome: item.profissional.profiles?.nome || 'Profissional não informado',
          especialidade: item.profissional.especialidade
        } : undefined
      };

      console.log('🚨 [CRÍTICO] AGENDAMENTO CRIADO COM SUCESSO:', agendamentoFormatado);

      // Atualizar lista local
      if (agendamentoFormatado) {
        setAgendamentos(prev => [...prev, agendamentoFormatado]);
      }

      toast.success('Agendamento criado com sucesso!');
      return agendamentoFormatado;

    } catch (err) {
      console.error('🚨 [CRÍTICO] ERRO AO CRIAR AGENDAMENTO:', err);
      console.error('🚨 [CRÍTICO] Dados originais:', JSON.stringify(novoAgendamento, null, 2));
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Atualizar agendamento
  const atualizarAgendamento = useCallback(async (id: string, dados: Partial<Agendamento>) => {
    try {
      console.log('🔍 [DEBUG] useAgendamentos - Iniciando atualização do agendamento:', id);
      console.log('🔍 [DEBUG] useAgendamentos - Dados para atualização:', dados);

      setError(null);

      // Fazer o update e buscar o resultado atualizado em uma única operação
      const { data: agendamentoAtualizado, error: updateError } = await supabase
        .from('agendamentos')
        .update({ ...dados, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ [DEBUG] useAgendamentos - Erro no update:', updateError);
        throw updateError;
      }

      console.log('✅ [DEBUG] useAgendamentos - Agendamento atualizado:', agendamentoAtualizado);

      // Atualizar lista local com os dados completos
      setAgendamentos(prev =>
        prev.map(agendamento =>
          agendamento.id === id ? agendamentoAtualizado : agendamento
        )
      );

      console.log('✅ [DEBUG] useAgendamentos - Lista local atualizada');
      toast.success('Agendamento atualizado com sucesso!');
      return agendamentoAtualizado;
    } catch (err) {
      console.error('❌ [DEBUG] useAgendamentos - Erro ao atualizar agendamento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Cancelar agendamento
  const cancelarAgendamento = useCallback(async (id: string, motivo?: string) => {
    const observacoes = motivo ? `Cancelado: ${motivo}` : 'Agendamento cancelado';
    const updated = await atualizarAgendamento(id, { status: 'cancelado', observacoes });

    if (updated) {
      try {
        const agendamentoCompleto = await buscarAgendamentoPorId(id);
        if (agendamentoCompleto && agendamentoCompleto.paciente && agendamentoCompleto.clinica && agendamentoCompleto.profissional) {
          await NotificacaoService.criarNotificacaoCancelamento(
            agendamentoCompleto as any,
            {
              name: agendamentoCompleto.clinica.name,
              address: agendamentoCompleto.clinica.address,
              phone: agendamentoCompleto.clinica.phone
            },
            {
              full_name: agendamentoCompleto.profissional.nome,
              specialty: agendamentoCompleto.profissional.especialidade
            },
            motivo
          );
          toast.success("Paciente notificado do cancelamento");
        }
      } catch (e) {
        console.error("Erro ao enviar notificação", e);
      }
    }
    return updated;
  }, [atualizarAgendamento, buscarAgendamentoPorId]);

  // Confirmar agendamento
  const confirmarAgendamento = useCallback(async (id: string) => {
    const updated = await atualizarAgendamento(id, { status: 'confirmado' });

    if (updated) {
      try {
        const agendamentoCompleto = await buscarAgendamentoPorId(id);
        if (agendamentoCompleto && agendamentoCompleto.paciente && agendamentoCompleto.clinica && agendamentoCompleto.profissional) {
          await NotificacaoService.criarNotificacaoConfirmacao(
            agendamentoCompleto as any,
            {
              name: agendamentoCompleto.clinica.name,
              address: agendamentoCompleto.clinica.address,
              phone: agendamentoCompleto.clinica.phone
            },
            {
              full_name: agendamentoCompleto.profissional.nome,
              specialty: agendamentoCompleto.profissional.especialidade
            }
          );
          toast.success("Paciente notificado da confirmação");
        }
      } catch (e) {
        console.error("Erro ao enviar notificação", e);
      }
    }
    return updated;
  }, [atualizarAgendamento, buscarAgendamentoPorId]);

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
          paciente:paciente_dados_id(id, nome, email, telefone),
          clinica:clinica_id(id, name, city, phone, address),
          profissional:profissional_id(id, profiles(nome:full_name)),
          servico:servico_id(id, nome, preco, duracao_minutos)
        `)
        .eq('id', id)
        .single();

      if (queryError) {
        throw queryError;
      }

      // Format professional data
      const agendamentoFormatado = {
        ...data,
        profissional: data.profissional ? {
          id: data.profissional.id,
          nome: data.profissional.profiles?.nome || 'Profissional não informado',
          especialidade: data.profissional.especialidade
        } : undefined
      };

      return agendamentoFormatado;
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
        .select('*')
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
        .select('*')
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