import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface HorarioFuncionamento {
  id: string;
  clinica_id: string;
  dia_semana: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  hora_inicio: string;
  hora_fim: string;
  intervalo_inicio?: string;
  intervalo_fim?: string;
  created_at: string;
  updated_at: string;
}

export interface BloqueioHorario {
  id: string;
  clinica_id: string;
  profissional_id?: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio?: string;
  hora_fim?: string;
  motivo: string;
  tipo: 'ferias' | 'feriado' | 'manutencao' | 'pessoal' | 'outro';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface HorarioDisponivel {
  data: string;
  hora: string;
  disponivel: boolean;
  motivo?: string;
  profissional_id?: string;
}

export interface ConfiguracaoHorario {
  duracao_padrao: number; // em minutos
  intervalo_entre_consultas: number; // em minutos
  antecedencia_minima: number; // em horas
  antecedencia_maxima: number; // em dias
  permite_agendamento_feriados: boolean;
  permite_agendamento_finais_semana: boolean;
}

export interface UseHorariosReturn {
  horariosFuncionamento: HorarioFuncionamento[];
  bloqueiosHorario: BloqueioHorario[];
  configuracao: ConfiguracaoHorario;
  loading: boolean;
  error: string | null;
  
  // Horários de funcionamento
  criarHorarioFuncionamento: (horario: Omit<HorarioFuncionamento, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  atualizarHorarioFuncionamento: (id: string, dados: Partial<HorarioFuncionamento>) => Promise<boolean>;
  removerHorarioFuncionamento: (id: string) => Promise<boolean>;
  
  // Bloqueios de horário
  criarBloqueioHorario: (bloqueio: Omit<BloqueioHorario, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  atualizarBloqueioHorario: (id: string, dados: Partial<BloqueioHorario>) => Promise<boolean>;
  removerBloqueioHorario: (id: string) => Promise<boolean>;
  
  // Verificação de disponibilidade
  verificarDisponibilidade: (data: string, hora: string, profissionalId?: string) => Promise<boolean>;
  obterHorariosDisponiveis: (data: string, profissionalId?: string) => Promise<HorarioDisponivel[]>;
  obterHorariosDisponiveisPeriodo: (dataInicio: string, dataFim: string, profissionalId?: string) => Promise<HorarioDisponivel[]>;
  
  // Configurações
  atualizarConfiguracao: (config: Partial<ConfiguracaoHorario>) => Promise<boolean>;
  
  // Utilitários
  recarregar: () => Promise<void>;
}

const CONFIGURACAO_PADRAO: ConfiguracaoHorario = {
  duracao_padrao: 30,
  intervalo_entre_consultas: 0,
  antecedencia_minima: 1,
  antecedencia_maxima: 30,
  permite_agendamento_feriados: false,
  permite_agendamento_finais_semana: true
};

export function useHorarios(clinicaId: string): UseHorariosReturn {
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorarioFuncionamento[]>([]);
  const [bloqueiosHorario, setBloqueiosHorario] = useState<BloqueioHorario[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoHorario>(CONFIGURACAO_PADRAO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar horários de funcionamento
  const carregarHorariosFuncionamento = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('horarios_funcionamento')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('dia_semana', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setHorariosFuncionamento(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar horários';
      setError(errorMessage);
    }
  }, [clinicaId]);

  // Carregar bloqueios de horário
  const carregarBloqueiosHorario = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('horarios_bloqueados')
        .select('*')
        .eq('clinica_id', clinicaId)
        .gte('data_fim', new Date().toISOString().split('T')[0])
        .order('data_inicio', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setBloqueiosHorario(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar bloqueios';
      setError(errorMessage);
    }
  }, [clinicaId]);

  // Criar horário de funcionamento
  const criarHorarioFuncionamento = useCallback(async (horario: Omit<HorarioFuncionamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('horarios_funcionamento')
        .insert([horario]);

      if (insertError) {
        throw insertError;
      }

      await carregarHorariosFuncionamento();
      toast.success('Horário de funcionamento criado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar horário';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [carregarHorariosFuncionamento]);

  // Atualizar horário de funcionamento
  const atualizarHorarioFuncionamento = useCallback(async (id: string, dados: Partial<HorarioFuncionamento>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('horarios_funcionamento')
        .update({ ...dados, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      await carregarHorariosFuncionamento();
      toast.success('Horário atualizado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar horário';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [carregarHorariosFuncionamento]);

  // Remover horário de funcionamento
  const removerHorarioFuncionamento = useCallback(async (id: string) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('horarios_funcionamento')
        .delete()
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await carregarHorariosFuncionamento();
      toast.success('Horário removido com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover horário';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [carregarHorariosFuncionamento]);

  // Criar bloqueio de horário
  const criarBloqueioHorario = useCallback(async (bloqueio: Omit<BloqueioHorario, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('horarios_bloqueados')
        .insert([bloqueio]);

      if (insertError) {
        throw insertError;
      }

      await carregarBloqueiosHorario();
      toast.success('Bloqueio criado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [carregarBloqueiosHorario]);

  // Atualizar bloqueio de horário
  const atualizarBloqueioHorario = useCallback(async (id: string, dados: Partial<BloqueioHorario>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('horarios_bloqueados')
        .update(dados)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await carregarBloqueiosHorario();
      toast.success('Bloqueio atualizado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [carregarBloqueiosHorario]);

  // Remover bloqueio de horário
  const removerBloqueioHorario = useCallback(async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('horarios_bloqueados')
        .delete()
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await carregarBloqueiosHorario();
      toast.success('Bloqueio removido com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [carregarBloqueiosHorario]);

  // Verificar disponibilidade de um horário específico
  const verificarDisponibilidade = useCallback(async (data: string, hora: string, profissionalId?: string) => {
    try {
      const dataObj = new Date(data);
      const diaSemana = dataObj.getDay();

      // Verificar se há horário de funcionamento para o dia
      const horarioFuncionamento = horariosFuncionamento.find(h => h.dia_semana === diaSemana);
      if (!horarioFuncionamento) {
        return false;
      }

      // Verificar se está dentro do horário de funcionamento
      if (hora < horarioFuncionamento.hora_inicio || hora >= horarioFuncionamento.hora_fim) {
        return false;
      }

      // Verificar se está no intervalo
      if (horarioFuncionamento.intervalo_inicio && horarioFuncionamento.intervalo_fim) {
        if (hora >= horarioFuncionamento.intervalo_inicio && hora < horarioFuncionamento.intervalo_fim) {
          return false;
        }
      }

      // Verificar bloqueios
      const temBloqueio = bloqueiosHorario.some(bloqueio => {
        const dentroDataBloqueio = data >= bloqueio.data_inicio && data <= bloqueio.data_fim;
        const dentroHorarioBloqueio = !bloqueio.hora_inicio || !bloqueio.hora_fim || 
          (hora >= bloqueio.hora_inicio && hora < bloqueio.hora_fim);
        const profissionalBloqueado = !bloqueio.profissional_id || bloqueio.profissional_id === profissionalId;
        
        return dentroDataBloqueio && dentroHorarioBloqueio && profissionalBloqueado;
      });

      if (temBloqueio) {
        return false;
      }

      // Verificar se já existe agendamento
      const { data: agendamentos, error: queryError } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('data_hora', `${data}T${hora}:00`)
        .neq('status', 'cancelado')
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      return agendamentos.length === 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar disponibilidade');
      return false;
    }
  }, [horariosFuncionamento, bloqueiosHorario]);

  // Obter horários disponíveis para uma data
  const obterHorariosDisponiveis = useCallback(async (data: string, profissionalId?: string) => {
    try {
      const dataObj = new Date(data);
      const diaSemana = dataObj.getDay();
      const horariosDisponiveis: HorarioDisponivel[] = [];

      // Buscar horário de funcionamento para o dia
      const horarioFuncionamento = horariosFuncionamento.find(h => h.dia_semana === diaSemana);
      if (!horarioFuncionamento) {
        return horariosDisponiveis;
      }

      // Gerar slots de horário
      const inicio = new Date(`${data}T${horarioFuncionamento.hora_inicio}`);
      const fim = new Date(`${data}T${horarioFuncionamento.hora_fim}`);
      const intervaloInicio = horarioFuncionamento.intervalo_inicio ? 
        new Date(`${data}T${horarioFuncionamento.intervalo_inicio}`) : null;
      const intervaloFim = horarioFuncionamento.intervalo_fim ? 
        new Date(`${data}T${horarioFuncionamento.intervalo_fim}`) : null;

      const duracaoSlot = configuracao.duracao_padrao + configuracao.intervalo_entre_consultas;
      let horaAtual = new Date(inicio);

      while (horaAtual < fim) {
        const horaString = horaAtual.toTimeString().slice(0, 5);
        
        // Verificar se está no intervalo
        const noIntervalo = intervaloInicio && intervaloFim && 
          horaAtual >= intervaloInicio && horaAtual < intervaloFim;

        if (!noIntervalo) {
          const disponivel = await verificarDisponibilidade(data, horaString, profissionalId);
          horariosDisponiveis.push({
            data,
            hora: horaString,
            disponivel,
            profissional_id: profissionalId
          });
        }

        horaAtual.setMinutes(horaAtual.getMinutes() + duracaoSlot);
      }

      return horariosDisponiveis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter horários disponíveis');
      return [];
    }
  }, [horariosFuncionamento, configuracao, verificarDisponibilidade]);

  // Obter horários disponíveis para um período
  const obterHorariosDisponiveisPeriodo = useCallback(async (dataInicio: string, dataFim: string, profissionalId?: string) => {
    try {
      const horariosDisponiveis: HorarioDisponivel[] = [];
      const dataAtual = new Date(dataInicio);
      const dataFinal = new Date(dataFim);

      while (dataAtual <= dataFinal) {
        const dataString = dataAtual.toISOString().split('T')[0];
        const horariosData = await obterHorariosDisponiveis(dataString, profissionalId);
        horariosDisponiveis.push(...horariosData);
        
        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      return horariosDisponiveis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter horários do período');
      return [];
    }
  }, [obterHorariosDisponiveis]);

  // Atualizar configuração
  const atualizarConfiguracao = useCallback(async (config: Partial<ConfiguracaoHorario>) => {
    try {
      setError(null);
      setConfiguracao(prev => ({ ...prev, ...config }));
      toast.success('Configuração atualizada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Recarregar todos os dados
  const recarregar = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      carregarHorariosFuncionamento(),
      carregarBloqueiosHorario()
    ]);
    setLoading(false);
  }, [carregarHorariosFuncionamento, carregarBloqueiosHorario]);

  // Carregar dados iniciais
  useEffect(() => {
    if (clinicaId) {
      recarregar();
    }
  }, [clinicaId, recarregar]);

  return {
    horariosFuncionamento,
    bloqueiosHorario,
    configuracao,
    loading,
    error,
    criarHorarioFuncionamento,
    atualizarHorarioFuncionamento,
    removerHorarioFuncionamento,
    criarBloqueioHorario,
    atualizarBloqueioHorario,
    removerBloqueioHorario,
    verificarDisponibilidade,
    obterHorariosDisponiveis,
    obterHorariosDisponiveisPeriodo,
    atualizarConfiguracao,
    recarregar
  };
}