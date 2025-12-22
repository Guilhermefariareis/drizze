import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Agendamento } from '@/hooks/useAgendamentos';

// Tipos do contexto
export interface AgendamentoState {
  agendamentos: Agendamento[];
  agendamentoSelecionado: Agendamento | null;
  loading: boolean;
  error: string | null;
  filtros: {
    dataInicio?: string;
    dataFim?: string;
    status?: string[];
    pacienteId?: string;
    servicoId?: string;
    profissionalId?: string;
  };
  view: 'calendar' | 'list' | 'day';
  dataSelecionada: string;
}

export interface AgendamentoActions {
  setAgendamentos: (agendamentos: Agendamento[]) => void;
  adicionarAgendamento: (agendamento: Agendamento) => void;
  atualizarAgendamento: (id: string, dados: Partial<Agendamento>) => void;
  removerAgendamento: (id: string) => void;
  selecionarAgendamento: (agendamento: Agendamento | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFiltros: (filtros: Partial<AgendamentoState['filtros']>) => void;
  setView: (view: AgendamentoState['view']) => void;
  setDataSelecionada: (data: string) => void;
  buscarAgendamentos: () => Promise<void>;
  criarAgendamento: (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => Promise<Agendamento | null>;
  editarAgendamento: (id: string, dados: Partial<Agendamento>) => Promise<boolean>;
  cancelarAgendamento: (id: string, motivo?: string) => Promise<boolean>;
  confirmarAgendamento: (id: string) => Promise<boolean>;
  concluirAgendamento: (id: string) => Promise<boolean>;
  marcarNoShow: (id: string) => Promise<boolean>;
}

export type AgendamentoContextType = AgendamentoState & AgendamentoActions;

// Actions do reducer
type AgendamentoAction =
  | { type: 'SET_AGENDAMENTOS'; payload: Agendamento[] }
  | { type: 'ADICIONAR_AGENDAMENTO'; payload: Agendamento }
  | { type: 'ATUALIZAR_AGENDAMENTO'; payload: { id: string; dados: Partial<Agendamento> } }
  | { type: 'REMOVER_AGENDAMENTO'; payload: string }
  | { type: 'SELECIONAR_AGENDAMENTO'; payload: Agendamento | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTROS'; payload: Partial<AgendamentoState['filtros']> }
  | { type: 'SET_VIEW'; payload: AgendamentoState['view'] }
  | { type: 'SET_DATA_SELECIONADA'; payload: string };

// Estado inicial
const initialState: AgendamentoState = {
  agendamentos: [],
  agendamentoSelecionado: null,
  loading: false,
  error: null,
  filtros: {},
  view: 'calendar',
  dataSelecionada: new Date().toISOString().split('T')[0]
};

// Reducer
function agendamentoReducer(state: AgendamentoState, action: AgendamentoAction): AgendamentoState {
  switch (action.type) {
    case 'SET_AGENDAMENTOS':
      return {
        ...state,
        agendamentos: action.payload,
        loading: false,
        error: null
      };
    
    case 'ADICIONAR_AGENDAMENTO':
      return {
        ...state,
        agendamentos: [...state.agendamentos, action.payload]
      };
    
    case 'ATUALIZAR_AGENDAMENTO':
      return {
        ...state,
        agendamentos: state.agendamentos.map(agendamento =>
          agendamento.id === action.payload.id
            ? { ...agendamento, ...action.payload.dados, updated_at: new Date().toISOString() }
            : agendamento
        ),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === action.payload.id
          ? { ...state.agendamentoSelecionado, ...action.payload.dados, updated_at: new Date().toISOString() }
          : state.agendamentoSelecionado
      };
    
    case 'REMOVER_AGENDAMENTO':
      return {
        ...state,
        agendamentos: state.agendamentos.filter(agendamento => agendamento.id !== action.payload),
        agendamentoSelecionado: state.agendamentoSelecionado?.id === action.payload
          ? null
          : state.agendamentoSelecionado
      };
    
    case 'SELECIONAR_AGENDAMENTO':
      return {
        ...state,
        agendamentoSelecionado: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'SET_FILTROS':
      return {
        ...state,
        filtros: { ...state.filtros, ...action.payload }
      };
    
    case 'SET_VIEW':
      return {
        ...state,
        view: action.payload
      };
    
    case 'SET_DATA_SELECIONADA':
      return {
        ...state,
        dataSelecionada: action.payload
      };
    
    default:
      return state;
  }
}

// Contexto
const AgendamentoContext = createContext<AgendamentoContextType | null>(null);

// Provider
export function AgendamentoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(agendamentoReducer, initialState);

  // Actions
  const setAgendamentos = useCallback((agendamentos: Agendamento[]) => {
    dispatch({ type: 'SET_AGENDAMENTOS', payload: agendamentos });
  }, []);

  const adicionarAgendamento = useCallback((agendamento: Agendamento) => {
    dispatch({ type: 'ADICIONAR_AGENDAMENTO', payload: agendamento });
  }, []);

  const atualizarAgendamento = useCallback((id: string, dados: Partial<Agendamento>) => {
    dispatch({ type: 'ATUALIZAR_AGENDAMENTO', payload: { id, dados } });
  }, []);

  const removerAgendamento = useCallback((id: string) => {
    dispatch({ type: 'REMOVER_AGENDAMENTO', payload: id });
  }, []);

  const selecionarAgendamento = useCallback((agendamento: Agendamento | null) => {
    dispatch({ type: 'SELECIONAR_AGENDAMENTO', payload: agendamento });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setFiltros = useCallback((filtros: Partial<AgendamentoState['filtros']>) => {
    dispatch({ type: 'SET_FILTROS', payload: filtros });
  }, []);

  const setView = useCallback((view: AgendamentoState['view']) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const setDataSelecionada = useCallback((data: string) => {
    dispatch({ type: 'SET_DATA_SELECIONADA', payload: data });
  }, []);

  // Buscar agendamentos
  const buscarAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          paciente:pacientes(id, nome, email, telefone),
          servico:servicos(id, nome, duracao_minutos, preco),
          profissional:clinic_professionals(id, user_id, role)
        `);

      // Aplicar filtros
      if (state.filtros.dataInicio) {
        query = query.gte('data_hora', `${state.filtros.dataInicio}T00:00:00`);
      }
      if (state.filtros.dataFim) {
        query = query.lte('data_hora', `${state.filtros.dataFim}T23:59:59`);
      }
      if (state.filtros.status && state.filtros.status.length > 0) {
        query = query.in('status', state.filtros.status);
      }
      if (state.filtros.pacienteId) {
        query = query.eq('paciente_id', state.filtros.pacienteId);
      }
      if (state.filtros.servicoId) {
        query = query.eq('servico_id', state.filtros.servicoId);
      }
      if (state.filtros.profissionalId) {
        query = query.eq('profissional_id', state.filtros.profissionalId);
      }

      const { data, error: queryError } = await query.order('data_hora', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setAgendamentos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamentos';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [state.filtros, setAgendamentos, setLoading, setError]);

  // Criar agendamento
  const criarAgendamento = useCallback(async (novoAgendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('agendamentos')
        .insert([novoAgendamento])
        .select(`
          *,
          paciente:pacientes(id, nome, email, telefone),
          servico:servicos(id, nome, duracao_minutos, preco),
          profissional:clinic_professionals(id, user_id, role)
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      adicionarAgendamento(data);
      toast.success('Agendamento criado com sucesso!');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [adicionarAgendamento, setError]);

  // Editar agendamento
  const editarAgendamento = useCallback(async (id: string, dados: Partial<Agendamento>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({ ...dados, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      atualizarAgendamento(id, dados);
      toast.success('Agendamento atualizado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [atualizarAgendamento, setError]);

  // Cancelar agendamento
  const cancelarAgendamento = useCallback(async (id: string, motivo?: string) => {
    const observacoes = motivo ? `Cancelado: ${motivo}` : 'Agendamento cancelado';
    return await editarAgendamento(id, { status: 'cancelado', observacoes });
  }, [editarAgendamento]);

  // Confirmar agendamento
  const confirmarAgendamento = useCallback(async (id: string) => {
    return await editarAgendamento(id, { status: 'confirmado' });
  }, [editarAgendamento]);

  // Concluir agendamento
  const concluirAgendamento = useCallback(async (id: string) => {
    return await editarAgendamento(id, { status: 'concluido' });
  }, [editarAgendamento]);

  // Marcar como no-show
  const marcarNoShow = useCallback(async (id: string) => {
    return await editarAgendamento(id, { status: 'no_show' });
  }, [editarAgendamento]);

  // Carregar dados iniciais
  useEffect(() => {
    buscarAgendamentos();
  }, [buscarAgendamentos]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (Object.keys(state.filtros).length > 0) {
      buscarAgendamentos();
    }
  }, [state.filtros, buscarAgendamentos]);

  // Configurar real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('agendamentos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos'
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              // Buscar dados completos do novo agendamento
              supabase
                .from('agendamentos')
                .select(`
                  *,
                  paciente:pacientes(id, nome, email, telefone),
                  servico:servicos(id, nome, duracao_minutos, preco),
                  profissional:clinic_professionals(id, user_id, role)
                `)
                .eq('id', payload.new.id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    adicionarAgendamento(data);
                    toast.success('Novo agendamento recebido!');
                  }
                });
              break;
            
            case 'UPDATE':
              atualizarAgendamento(payload.new.id, payload.new as Partial<Agendamento>);
              break;
            
            case 'DELETE':
              removerAgendamento(payload.old.id);
              toast.info('Agendamento removido');
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [adicionarAgendamento, atualizarAgendamento, removerAgendamento]);

  const contextValue: AgendamentoContextType = {
    ...state,
    setAgendamentos,
    adicionarAgendamento,
    atualizarAgendamento,
    removerAgendamento,
    selecionarAgendamento,
    setLoading,
    setError,
    setFiltros,
    setView,
    setDataSelecionada,
    buscarAgendamentos,
    criarAgendamento,
    editarAgendamento,
    cancelarAgendamento,
    confirmarAgendamento,
    concluirAgendamento,
    marcarNoShow
  };

  return (
    <AgendamentoContext.Provider value={contextValue}>
      {children}
    </AgendamentoContext.Provider>
  );
}

// Hook para usar o contexto
export function useAgendamentoContext() {
  const context = useContext(AgendamentoContext);
  if (!context) {
    throw new Error('useAgendamentoContext deve ser usado dentro de um AgendamentoProvider');
  }
  return context;
}