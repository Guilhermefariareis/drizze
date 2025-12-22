import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BuscaAvancada } from './BuscaAvancada';
import { useCachedData } from '@/hooks/useDataCache';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarioAgendamentoProps {
  clinicaId: string;
  profissionalId: string;
  dataSelecionada: string;
  onDataSelecionada: (data: string) => void;
}

interface DiaDisponivel {
  data: Date;
  disponivel: boolean;
  horariosDisponiveis: number;
}

interface FiltrosBusca {
  termo: string;
  status: string[];
  periodo: {
    inicio: string;
    fim: string;
  } | null;
}

const CalendarioAgendamento: React.FC<CalendarioAgendamentoProps> = ({
  clinicaId,
  profissionalId,
  dataSelecionada,
  onDataSelecionada
}) => {
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  const [diasDisponiveis, setDiasDisponiveis] = useState<DiaDisponivel[]>([]);
  const [filtros, setFiltros] = useState<FiltrosBusca>({
    termo: '',
    status: [],
    periodo: null
  });

  // Chave de cache baseada nos parâmetros
  const cacheKey = useMemo(() => {
    const inicioSemana = startOfWeek(semanaAtual, { weekStartsOn: 0 });
    return `disponibilidade_${clinicaId}_${profissionalId}_${format(inicioSemana, 'yyyy-MM-dd')}`;
  }, [clinicaId, profissionalId, semanaAtual]);

  // Função para buscar dados de disponibilidade
  const fetchDisponibilidade = useCallback(async () => {
    if (!clinicaId || !profissionalId) {
      throw new Error('Clínica e profissional são obrigatórios');
    }

    const inicioSemana = startOfWeek(semanaAtual, { weekStartsOn: 0 });
    const fimSemana = endOfWeek(semanaAtual, { weekStartsOn: 0 });
    
    // Carregar dados em paralelo para melhor performance
    const [horariosFuncionamento, agendamentosExistentes, horariosBloqueados] = await Promise.all([
      supabase
        .from('horarios_funcionamento')
        .select('*')
        .eq('clinica_id', clinicaId)
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        }),
      
      supabase
        .from('agendamentos')
        .select('data_hora')
        .eq('clinica_id', clinicaId)
        .eq('profissional_id', profissionalId)
        .gte('data_hora', format(inicioSemana, 'yyyy-MM-dd'))
        .lte('data_hora', format(fimSemana, 'yyyy-MM-dd'))
        .in('status', ['pendente', 'confirmado'])
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        }),
      
      supabase
        .from('horarios_bloqueados')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('profissional_id', profissionalId)
        .gte('data_inicio', format(inicioSemana, 'yyyy-MM-dd'))
        .lte('data_fim', format(fimSemana, 'yyyy-MM-dd'))
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    ]);

    // Calcular disponibilidade para cada dia da semana
    const dias: DiaDisponivel[] = [];
    for (let i = 0; i < 7; i++) {
      const data = addDays(inicioSemana, i);
      const diaSemana = data.getDay();
      
      // Verificar se há horário de funcionamento para este dia
      const funcionamento = horariosFuncionamento?.find(h => h.dia_semana === diaSemana);
      
      if (!funcionamento || isBefore(data, startOfDay(new Date()))) {
        dias.push({
          data,
          disponivel: false,
          horariosDisponiveis: 0
        });
        continue;
      }

      // Verificar se o dia está bloqueado
      const diaBloqueado = horariosBloqueados?.some(bloqueio => {
        const dataStr = format(data, 'yyyy-MM-dd');
        return dataStr >= bloqueio.data_inicio && dataStr <= bloqueio.data_fim;
      });

      if (diaBloqueado) {
        dias.push({
          data,
          disponivel: false,
          horariosDisponiveis: 0
        });
        continue;
      }

      // Calcular horários disponíveis
      const horariosOcupados = agendamentosExistentes?.filter(
        ag => ag.data_hora?.startsWith(format(data, 'yyyy-MM-dd'))
      ).length || 0;

      // Assumindo slots de 30 minutos
      const inicioMinutos = parseInt(funcionamento.hora_inicio.split(':')[0]) * 60 + parseInt(funcionamento.hora_inicio.split(':')[1]);
        const fimMinutos = parseInt(funcionamento.hora_fim.split(':')[0]) * 60 + parseInt(funcionamento.hora_fim.split(':')[1]);
      const totalSlots = (fimMinutos - inicioMinutos) / 30;
      const slotsDisponiveis = Math.max(0, totalSlots - horariosOcupados);

      dias.push({
        data,
        disponivel: slotsDisponiveis > 0,
        horariosDisponiveis: slotsDisponiveis
      });
    }

    return dias;
  }, [clinicaId, profissionalId, semanaAtual]);

  // Usar cache para dados de disponibilidade
  const {
    data: cachedDiasDisponiveis,
    loading,
    error,
    refetch
  } = useCachedData(
    cacheKey,
    fetchDisponibilidade,
    {
      enabled: !!(clinicaId && profissionalId),
      ttl: 2 * 60 * 1000, // Cache por 2 minutos
      refetchOnMount: false
    }
  );

  // Atualizar estado local quando os dados do cache mudarem
  useEffect(() => {
    if (cachedDiasDisponiveis) {
      setDiasDisponiveis(cachedDiasDisponiveis);
    }
  }, [cachedDiasDisponiveis]);

  // Funções de navegação otimizadas
  const handleSemanaAnterior = useCallback(() => {
    setSemanaAtual(prev => addDays(prev, -7));
  }, []);

  const handleProximaSemana = useCallback(() => {
    setSemanaAtual(prev => addDays(prev, 7));
  }, []);

  // Função para forçar atualização dos dados
  const atualizarDisponibilidade = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSelecionarData = useCallback((data: Date) => {
    const dia = diasDisponiveis.find(d => isSameDay(d.data, data));
    if (dia?.disponivel) {
      onDataSelecionada(format(data, 'yyyy-MM-dd'));
    }
  }, [diasDisponiveis, onDataSelecionada]);

  const getDiaClass = useCallback((dia: DiaDisponivel) => {
    const baseClass = 'p-2 sm:p-3 text-center cursor-pointer rounded-lg transition-colors touch-target min-h-[44px] sm:min-h-[48px] flex flex-col justify-center';
    
    if (!dia.disponivel) {
      return `${baseClass} text-gray-400 bg-gray-100 cursor-not-allowed`;
    }
    
    if (dataSelecionada && isSameDay(dia.data, new Date(dataSelecionada))) {
      return `${baseClass} bg-blue-600 text-white`;
    }
    
    if (isToday(dia.data)) {
      return `${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200`;
    }
    
    return `${baseClass} hover:bg-gray-100 text-gray-700`;
  }, [dataSelecionada]);

  // Mostrar erro se houver
  if (error) {
    return (
      <Card className="card-mobile sm:card-desktop">
        <CardContent className="spacing-mobile sm:spacing-desktop">
          <div className="text-center py-6 sm:py-8">
            <p className="text-red-600 mb-4">Erro ao carregar disponibilidade</p>
            <Button onClick={atualizarDisponibilidade} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Busca Avançada */}
      <BuscaAvancada
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onBuscar={(novosFiltros) => {
          setFiltros(novosFiltros);
          // Atualizar semana baseada no período se especificado
          if (novosFiltros.periodo?.inicio) {
            setSemanaAtual(new Date(novosFiltros.periodo.inicio));
          }
        }}
      />
      
      {/* Calendário */}
      <Card className="card-mobile sm:card-desktop">
        <CardHeader className="spacing-mobile sm:spacing-desktop">
          <CardTitle className="flex items-center gap-2 text-responsive-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Selecionar Data
          </CardTitle>
        </CardHeader>
        <CardContent className="spacing-mobile sm:spacing-desktop">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSemanaAnterior}
            disabled={loading}
            className="touch-target"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <h3 className="font-semibold text-responsive-sm text-center px-2">
            {format(startOfWeek(semanaAtual, { weekStartsOn: 0 }), 'dd/MM', { locale: ptBR })} - {format(endOfWeek(semanaAtual, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: ptBR })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleProximaSemana}
            disabled={loading}
            className="touch-target"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-600">Carregando disponibilidade...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
              <div key={dia} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-600">
                {dia}
              </div>
            ))}
            
            {/* Days */}
            {diasDisponiveis.map((dia, index) => (
              <div
                key={index}
                className={getDiaClass(dia)}
                onClick={() => handleSelecionarData(dia.data)}
              >
                <div className="font-medium text-xs sm:text-sm">
                  {format(dia.data, 'd')}
                </div>
                {dia.disponivel && (
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {dia.horariosDisponiveis} slots
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-100 rounded"></div>
            <span>Hoje</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-100 rounded"></div>
            <span>Indisponível</span>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { CalendarioAgendamento };
export default CalendarioAgendamento;