import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';
import { format, parse, addMinutes, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SeletorHorariosProps {
  clinicaId: string;
  profissionalId: string;
  dataSelecionada: string;
  horarioSelecionado: string;
  onHorarioSelecionado: (horario: string) => void;
}

interface HorarioSlot {
  horario: string;
  disponivel: boolean;
  motivo?: string;
}

const SeletorHorarios: React.FC<SeletorHorariosProps> = ({
  clinicaId,
  profissionalId,
  dataSelecionada,
  horarioSelecionado,
  onHorarioSelecionado
}) => {
  const [horarios, setHorarios] = useState<HorarioSlot[]>([]);
  const { obterHorariosDisponiveis, loading, error } = useHorariosDisponiveis(clinicaId);

  useEffect(() => {
    if (clinicaId && profissionalId && dataSelecionada) {
      carregarHorarios();
    }
  }, [clinicaId, profissionalId, dataSelecionada, obterHorariosDisponiveis]);

  const carregarHorarios = async () => {
    console.error('🔍 SeletorHorarios - Carregando horários:', { clinicaId, profissionalId, dataSelecionada });
    if (!dataSelecionada || !clinicaId) {
      console.error('❌ SeletorHorarios - Dados insuficientes:', { dataSelecionada, clinicaId });
      return;
    }

    try {
      console.error('🚀 SeletorHorarios - Chamando obterHorariosDisponiveis...');
      const slots = await obterHorariosDisponiveis(dataSelecionada, profissionalId);
      console.error('✅ SeletorHorarios - Slots recebidos:', slots);
      console.error('📊 SeletorHorarios - Quantidade de slots:', slots?.length || 0);
      
      const horariosFormatados = slots.map(slot => ({
        horario: slot.horario,
        disponivel: slot.disponivel
      }));
      
      console.error('📋 SeletorHorarios - Horários formatados:', horariosFormatados);
      console.error('🎯 SeletorHorarios - Setando horários no estado...');
      setHorarios(horariosFormatados);
      console.error('✨ SeletorHorarios - Horários definidos com sucesso!');
    } catch (error) {
      console.error('❌ SeletorHorarios - Erro ao carregar horários:', error);
      setHorarios([]);
    }
  };

  const gerarSlotsHorario = (
    inicio: string,
    fim: string,
    horariosOcupados: Set<string>
  ): HorarioSlot[] => {
    const slots: HorarioSlot[] = [];
    const agora = new Date();
    const dataAgendamento = new Date(dataSelecionada + 'T00:00:00');
    const isHoje = format(agora, 'yyyy-MM-dd') === dataSelecionada;

    // Parse dos horários
    const inicioTime = parse(inicio, 'HH:mm', new Date());
    const fimTime = parse(fim, 'HH:mm', new Date());

    let horarioAtual = inicioTime;

    while (isBefore(horarioAtual, fimTime)) {
      const horarioStr = format(horarioAtual, 'HH:mm');
      const horarioCompleto = new Date(dataAgendamento);
      horarioCompleto.setHours(
        horarioAtual.getHours(),
        horarioAtual.getMinutes(),
        0,
        0
      );

      let disponivel = true;
      let motivo = '';

      // Verificar se já passou (apenas para hoje)
      if (isHoje && isBefore(horarioCompleto, agora)) {
        disponivel = false;
        motivo = 'Horário já passou';
      }

      // Verificar se está ocupado
      if (horariosOcupados.has(horarioStr)) {
        disponivel = false;
        motivo = 'Horário ocupado';
      }

      slots.push({
        horario: horarioStr,
        disponivel,
        motivo
      });

      horarioAtual = addMinutes(horarioAtual, 30); // Slots de 30 minutos
    }

    return slots;
  };

  const handleSelecionarHorario = (horario: string) => {
    const slot = horarios.find(h => h.horario === horario);
    if (slot?.disponivel) {
      onHorarioSelecionado(horario);
    }
  };

  const getHorarioClass = (slot: HorarioSlot) => {
    const baseClass = 'p-3 text-center rounded-lg transition-colors border';
    
    if (!slot.disponivel) {
      return `${baseClass} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
    }
    
    if (horarioSelecionado === slot.horario) {
      return `${baseClass} bg-blue-600 text-white border-blue-600`;
    }
    
    return `${baseClass} bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer`;
  };

  if (!dataSelecionada) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Selecionar Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Selecione uma data primeiro
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-mobile sm:card-desktop">
      <CardHeader className="spacing-mobile sm:spacing-desktop">
        <CardTitle className="text-responsive-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários Disponíveis
        </CardTitle>
        <p className="text-responsive-sm text-gray-600 mt-1">
          {format(new Date(dataSelecionada + 'T00:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="spacing-mobile sm:spacing-desktop">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando horários...</p>
          </div>
        ) : error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : horarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum horário disponível para esta data
          </div>
        ) : (
          <>
            <div className="grid-horarios">
              {horarios.map((slot) => (
                <div
                  key={slot.horario}
                  className={`${getHorarioClass(slot)} touch-target`}
                  onClick={() => handleSelecionarHorario(slot.horario)}
                  title={slot.motivo || ''}
                >
                  <div className="font-medium text-responsive-sm">{slot.horario}</div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Selecionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Ocupado</span>
              </div>
            </div>
            
            {horarioSelecionado && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-800">
                  Horário selecionado: <span className="font-semibold">{horarioSelecionado}</span>
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { SeletorHorarios };
export default SeletorHorarios;