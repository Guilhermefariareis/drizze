import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes, parseISO, isBefore, startOfDay } from 'date-fns';

export interface HorarioFuncionamento {
  id: string;
  clinica_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  duracao_consulta: number;
  ativo: boolean | null;
}

export interface HorarioBloqueado {
  id: string;
  clinica_id: string;
  profissional_id: string | null;
  data_inicio: string;
  data_fim: string;
  motivo: string | null;
}

export interface SlotHorario {
  horario: string;
  disponivel: boolean;
  motivo?: string;
}

export function useHorariosDisponiveis(clinicaId?: string) {
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorarioFuncionamento[]>([]);
  const [horariosBloqueados, setHorariosBloqueados] = useState<HorarioBloqueado[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar horários de funcionamento
  const carregarHorariosFuncionamento = useCallback(async () => {
    if (!clinicaId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('horarios_funcionamento')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .order('dia_semana');

      if (error) {
        console.error('Erro ao carregar horários de funcionamento:', error);
        return;
      }

      if (data && data.length > 0) {
        setHorariosFuncionamento(data);
      } else {
        // Criar horários padrão se não existirem
        const horariosPadrao = [
          { clinica_id: clinicaId, dia_semana: 1, hora_inicio: '08:00', hora_fim: '12:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 1, hora_inicio: '14:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 2, hora_inicio: '08:00', hora_fim: '12:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 2, hora_inicio: '14:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 3, hora_inicio: '08:00', hora_fim: '12:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 3, hora_inicio: '14:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 4, hora_inicio: '08:00', hora_fim: '12:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 4, hora_inicio: '14:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 5, hora_inicio: '08:00', hora_fim: '12:00', duracao_consulta: 30, ativo: true },
          { clinica_id: clinicaId, dia_semana: 5, hora_inicio: '14:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true }
        ];

        // Usar horários padrão imediatamente
        setHorariosFuncionamento(horariosPadrao as HorarioFuncionamento[]);

        // Criar no banco em background (sem await)
        horariosPadrao.forEach(async (horario) => {
          try {
            await supabase.from('horarios_funcionamento').insert(horario);
          } catch (e) {
            // Ignorar erro se já existir
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar horários de funcionamento:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  // Obter horários disponíveis para uma data específica
  const obterHorariosDisponiveis = useCallback(async (
    data: string,
    profissionalId?: string,
    duracaoMinutos: number = 30
  ): Promise<SlotHorario[]> => {
    if (!clinicaId || !data) {
      console.warn('🔍 [DEBUG] obterHorariosDisponiveis - Faltando clinicaId ou data', { clinicaId, data });
      return [];
    }

    try {
      console.log('🔍 [DEBUG] obterHorariosDisponiveis - Buscando para:', { data, profissionalId });

      let funcionamentoAtual = horariosFuncionamento;

      // Se não temos horários de funcionamento no estado, tentar buscar uma vez
      if (funcionamentoAtual.length === 0) {
        console.log('🔍 [DEBUG] obterHorariosDisponiveis - Estado vazio, buscando no banco...');
        const { data: dbData } = await supabase
          .from('horarios_funcionamento')
          .select('*')
          .eq('clinica_id', clinicaId)
          .eq('ativo', true);

        if (dbData && dbData.length > 0) {
          funcionamentoAtual = dbData as HorarioFuncionamento[];
          console.log('🔍 [DEBUG] obterHorariosDisponiveis - Encontrados no banco:', dbData.length);
        } else {
          console.log('🔍 [DEBUG] obterHorariosDisponiveis - Sem horários no banco, usando padrão.');
          funcionamentoAtual = [
            { id: 'p1', clinica_id: clinicaId, dia_semana: 1, hora_inicio: '08:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
            { id: 'p2', clinica_id: clinicaId, dia_semana: 2, hora_inicio: '08:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
            { id: 'p3', clinica_id: clinicaId, dia_semana: 3, hora_inicio: '08:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
            { id: 'p4', clinica_id: clinicaId, dia_semana: 4, hora_inicio: '08:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true },
            { id: 'p5', clinica_id: clinicaId, dia_semana: 5, hora_inicio: '08:00', hora_fim: '18:00', duracao_consulta: 30, ativo: true }
          ] as HorarioFuncionamento[];
        }
      }

      const dataObj = parseISO(data);
      const diaSemana = dataObj.getDay();
      const hoje = startOfDay(new Date());
      const dataConsulta = startOfDay(dataObj);

      // Verificar se a data não é no passado
      if (isBefore(dataConsulta, hoje)) {
        console.warn('🔍 [DEBUG] obterHorariosDisponiveis - Data no passado');
        return [];
      }

      // Buscar horário de funcionamento para o dia da semana
      const funcionamento = funcionamentoAtual.find(h => h.dia_semana === diaSemana);

      if (!funcionamento) {
        console.warn('🔍 [DEBUG] obterHorariosDisponiveis - Sem funcionamento para o dia:', diaSemana);
        return [];
      }

      // Buscar agendamentos existentes
      let query = supabase
        .from('agendamentos')
        .select('data_hora')
        .eq('clinica_id', clinicaId)
        .gte('data_hora', `${data}T00:00:00`)
        .lt('data_hora', `${data}T23:59:59`)
        .in('status', ['pendente', 'confirmado']);

      // Se um profissional específico foi selecionado, filtrar por ele
      // Se não, precisamos ver se a clínica opera com bloqueio global ou por profissional
      // Por padrão, assumimos bloqueio por profissional se um for passado
      if (profissionalId) {
        query = query.eq('profissional_id', profissionalId);
      }

      const { data: agendamentos, error: agendamentoError } = await query;

      if (agendamentoError) {
        console.error('Erro ao buscar agendamentos:', agendamentoError);
        return [];
      }

      const horariosOcupados = new Set(agendamentos?.map(a => {
        const dataHora = new Date(a.data_hora);
        return format(dataHora, 'HH:mm');
      }) || []);

      // Gerar slots de horário
      const slots: SlotHorario[] = [];
      const [horaInicio, minutoInicio] = funcionamento.hora_inicio.split(':').map(Number);
      const [horaFim, minutoFim] = funcionamento.hora_fim.split(':').map(Number);

      let horarioAtual = new Date(dataObj);
      horarioAtual.setHours(horaInicio, minutoInicio, 0, 0);

      const horarioLimite = new Date(dataObj);
      horarioLimite.setHours(horaFim, minutoFim, 0, 0);

      const duracao = funcionamento.duracao_consulta || duracaoMinutos;

      while (isBefore(horarioAtual, horarioLimite)) {
        const horarioStr = format(horarioAtual, 'HH:mm');
        let disponivel = true;
        let motivo = '';

        // Verificar se está ocupado
        if (horariosOcupados.has(horarioStr)) {
          disponivel = false;
          motivo = 'Horário já agendado';
        }

        // Verificar se é no passado (para hoje)
        if (disponivel && format(dataObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
          const agora = new Date();
          if (isBefore(horarioAtual, agora)) {
            disponivel = false;
            motivo = 'Horário já passou';
          }
        }

        slots.push({
          horario: horarioStr,
          disponivel,
          motivo: disponivel ? undefined : motivo
        });

        horarioAtual = addMinutes(horarioAtual, duracao);
      }

      return slots;
    } catch (error) {
      console.error('Erro ao obter horários disponíveis:', error);
      return [];
    }
  }, [clinicaId, horariosFuncionamento]);

  // Carregar dados quando clinicaId mudar
  useEffect(() => {
    if (clinicaId) {
      carregarHorariosFuncionamento();
    }
  }, [clinicaId]);

  return {
    horariosFuncionamento,
    horariosBloqueados,
    loading,
    obterHorariosDisponiveis
  };
}