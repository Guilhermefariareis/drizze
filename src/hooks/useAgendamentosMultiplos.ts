import { useMemo } from 'react';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    id: string;
    status: string;
    paciente_nome: string;
    servico_nome: string;
    valor?: number;
    data_hora: string;
    observacoes?: string;
  };
}

interface AgendamentosPorDia {
  [data: string]: CalendarEvent[];
}

interface EstatisticasDia {
  data: string;
  quantidade: number;
  agendamentos: CalendarEvent[];
  statusCount: {
    pendente: number;
    confirmado: number;
    cancelado: number;
    concluido: number;
  };
}

interface UseAgendamentosMultiplosReturn {
  agendamentosPorDia: AgendamentosPorDia;
  diasComMultiplos: string[];
  estatisticasPorDia: EstatisticasDia[];
  getQuantidadePorDia: (data: Date) => number;
  getAgendamentosPorDia: (data: Date) => CalendarEvent[];
  temMultiplosAgendamentos: (data: Date) => boolean;
}

export const useAgendamentosMultiplos = (events: CalendarEvent[]): UseAgendamentosMultiplosReturn => {
  const agendamentosPorDia = useMemo(() => {
    const grupos: AgendamentosPorDia = {};
    
    events.forEach(event => {
      const dataKey = format(event.start, 'yyyy-MM-dd');
      
      if (!grupos[dataKey]) {
        grupos[dataKey] = [];
      }
      
      grupos[dataKey].push(event);
    });
    
    return grupos;
  }, [events]);

  const diasComMultiplos = useMemo(() => {
    return Object.keys(agendamentosPorDia).filter(
      data => agendamentosPorDia[data].length > 1
    );
  }, [agendamentosPorDia]);

  const estatisticasPorDia = useMemo(() => {
    return Object.entries(agendamentosPorDia).map(([data, agendamentos]) => {
      const statusCount = {
        pendente: 0,
        confirmado: 0,
        cancelado: 0,
        concluido: 0
      };
      
      agendamentos.forEach(agendamento => {
        const status = agendamento.resource.status as keyof typeof statusCount;
        if (statusCount.hasOwnProperty(status)) {
          statusCount[status]++;
        }
      });
      
      return {
        data,
        quantidade: agendamentos.length,
        agendamentos,
        statusCount
      };
    }).sort((a, b) => a.data.localeCompare(b.data));
  }, [agendamentosPorDia]);

  const getQuantidadePorDia = (data: Date): number => {
    const dataKey = format(data, 'yyyy-MM-dd');
    return agendamentosPorDia[dataKey]?.length || 0;
  };

  const getAgendamentosPorDia = (data: Date): CalendarEvent[] => {
    const dataKey = format(data, 'yyyy-MM-dd');
    return agendamentosPorDia[dataKey] || [];
  };

  const temMultiplosAgendamentos = (data: Date): boolean => {
    return getQuantidadePorDia(data) > 1;
  };

  return {
    agendamentosPorDia,
    diasComMultiplos,
    estatisticasPorDia,
    getQuantidadePorDia,
    getAgendamentosPorDia,
    temMultiplosAgendamentos
  };
};

export default useAgendamentosMultiplos;