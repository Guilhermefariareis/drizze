import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import ModalAcoesAgendamento from './ModalAcoesAgendamento';
import ModalConfirmacaoRemocao from './ModalConfirmacaoRemocao';
import TooltipAgendamento from './TooltipAgendamento';
import IndicadorMultiplosAgendamentos from './IndicadorMultiplosAgendamentos';
import useAgendamentosMultiplos from '@/hooks/useAgendamentosMultiplos';

// Configurar moment para português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface Agendamento {
  id: string;
  paciente_nome: string;
  servico_nome: string;
  data_hora: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes?: string;
  valor?: number;
}

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
    hora_inicio: string;
    data_hora: string;
    observacoes?: string;
  };
}

interface CalendarioPrincipalProps {
  clinicaId: string;
  onNovoAgendamento?: () => void;
  onEditarAgendamento?: (agendamento: Agendamento) => void;
}

const CalendarioPrincipal: React.FC<CalendarioPrincipalProps> = ({
  clinicaId,
  onNovoAgendamento,
  onEditarAgendamento
}) => {
  console.log('🔍 [CalendarioPrincipal] clinicaId recebido:', clinicaId);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  
  // Hook para detectar múltiplos agendamentos
  const { getQuantidadePorDia, temMultiplosAgendamentos } = useAgendamentosMultiplos(events);
  
  // Estados para modais
  const [modalAcoesOpen, setModalAcoesOpen] = useState(false);
  const [modalRemocaoOpen, setModalRemocaoOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<CalendarEvent | null>(null);
  const [removendoAgendamento, setRemovendoAgendamento] = useState(false);
  
  // Carregar agendamentos
  const carregarAgendamentos = useCallback(async () => {
    if (!clinicaId) {
      console.log('❌ clinicaId não fornecido, abortando carregamento');
      return;
    }
    
    setLoading(true);
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          observacoes,
          valor,
          paciente_dados_id,
          servico_id,
          tipo_consulta,
          pacientes:paciente_dados_id (
            id,
            nome,
            telefone,
            email
          ),
          servicos:servico_id (
            id,
            nome,
            duracao_minutos,
            preco
          )
        `)
        .eq('clinica_id', clinicaId)
        .order('data_hora', { ascending: true });

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      console.log('🔍 DEBUG: Executando query no Supabase...');
      const { data, error } = await query;

      if (error) {
        console.error('🔍 DEBUG: Erro na query:', error);
        throw error;
      }

      console.log('🔍 DEBUG: Dados retornados do Supabase:', data);
      console.log('🔍 DEBUG: Quantidade de agendamentos encontrados:', data?.length || 0);

      const calendarEvents: CalendarEvent[] = data?.map((agendamento: any) => {
        console.log('🔍 DEBUG: Processando agendamento:', agendamento);
        
        const startTime = new Date(agendamento.data_hora);
        console.log('🔍 DEBUG: Data/hora convertida:', startTime);
        
        const duracao = agendamento?.servicos?.duracao_minutos || 30;
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duracao);

        const pacienteNome = agendamento?.pacientes?.nome || 'Paciente';
        const servicoNome = agendamento?.servicos?.nome || agendamento.tipo_consulta || 'Consulta';

        const event: CalendarEvent = {
          id: agendamento.id,
          title: `Agendamento - ${servicoNome}`,
          start: startTime,
          end: endTime,
          resource: {
            id: agendamento.id,
            status: agendamento.status,
            paciente_nome: pacienteNome,
            servico_nome: servicoNome,
            valor: agendamento.valor,
            data_hora: agendamento.data_hora,
            hora_inicio: format(startTime, 'HH:mm', { locale: ptBR }),
            observacoes: agendamento.observacoes
          }
        };
        
        console.log('🔍 DEBUG: Evento criado:', event);
        return event;
      }) || [];

      console.log('🔍 DEBUG: Total de eventos criados para o calendário:', calendarEvents.length);
      console.log('🔍 DEBUG: Eventos finais:', calendarEvents);
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('🔍 DEBUG: Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [clinicaId, filtroStatus]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  // Estilização dos eventos baseada no status
  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    switch (status) {

      case 'pendente':
        backgroundColor = '#eab308'; // yellow-500
        borderColor = '#ca8a04'; // yellow-600
        break;
      case 'confirmado':
        backgroundColor = '#10b981'; // emerald-500
        borderColor = '#059669'; // emerald-600
        break;
      case 'cancelado':
        backgroundColor = '#ef4444'; // red-500
        borderColor = '#dc2626'; // red-600
        break;
      case 'concluido':
        backgroundColor = '#8b5cf6'; // violet-500
        borderColor = '#7c3aed'; // violet-600
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '4px',
        fontSize: '12px'
      }
    };
  };

  // Componente customizado para eventos
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const statusColors = {
      pendente: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      confirmado: 'bg-green-100 border-green-300 text-green-800',
      cancelado: 'bg-red-100 border-red-300 text-red-800',
      concluido: 'bg-blue-100 border-blue-300 text-blue-800'
    };

    const statusColor = statusColors[event.resource.status as keyof typeof statusColors] || statusColors.pendente;
    const quantidadeDia = getQuantidadePorDia(event.start);

    return (
      <TooltipAgendamento agendamento={event.resource}>
        <div 
          className={`p-1 rounded border-l-4 ${statusColor} h-full overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative`}
        >
          <div className="text-xs font-medium truncate">
            {event.resource.paciente_nome}
          </div>
          <div className="text-xs opacity-75 truncate">
            {event.resource.servico_nome}
          </div>
          <div className="text-xs opacity-75 flex items-center justify-between">
            <span>{format(event.start, 'HH:mm', { locale: ptBR })}</span>
            {quantidadeDia > 1 && (
              <IndicadorMultiplosAgendamentos 
                quantidade={quantidadeDia} 
                size="sm" 
                variant="dot"
                className="ml-1"
              />
            )}
          </div>
        </div>
      </TooltipAgendamento>
    );
  };

  // Manipular clique no evento
  const handleSelectEvent = (event: CalendarEvent) => {
    setAgendamentoSelecionado(event.resource);
    setModalAcoesOpen(true);
  };
  
  // Função para editar agendamento
  const handleEditarAgendamento = (agendamento: any) => {
    setModalAcoesOpen(false);
    setAgendamentoSelecionado(null);
    if (onEditarAgendamento) {
      onEditarAgendamento(agendamento);
    }
  };
  
  // Função para iniciar remoção
  const handleIniciarRemocao = (agendamento: any) => {
    setAgendamentoSelecionado(agendamento);
    setModalRemocaoOpen(true);
  };
  
  // Função para confirmar remoção
  const handleConfirmarRemocao = async () => {
    if (!agendamentoSelecionado) return;
    
    setRemovendoAgendamento(true);
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', agendamentoSelecionado.id);
      
      if (error) {
        console.error('Erro ao remover agendamento:', error);
        toast.error('Erro ao remover agendamento');
        return;
      }
      
      toast.success('Agendamento removido com sucesso!');
      setModalRemocaoOpen(false);
      setAgendamentoSelecionado(null);
      
      // Recarregar agendamentos
      await carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      toast.error('Erro ao remover agendamento');
    } finally {
      setRemovendoAgendamento(false);
    }
  };

  // Manipular clique em slot vazio
  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (onNovoAgendamento) {
      onNovoAgendamento();
    }
  };

  // Mensagens customizadas em português
  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há agendamentos neste período',
    showMore: (total: number) => `+ ${total} mais`
  };

  const statusOptions = [
    { value: 'todos', label: 'Todos', color: 'bg-gray-500' },
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-500' },

    { value: 'confirmado', label: 'Confirmado', color: 'bg-emerald-500' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
    { value: 'concluido', label: 'Concluído', color: 'bg-violet-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="calendar-header">
        <div>
          <h2 className="text-responsive-lg font-bold text-foreground">Calendário de Agendamentos</h2>
          <p className="text-responsive-sm text-muted-foreground">Gerencie seus agendamentos de forma visual</p>
        </div>
        
        <div className="calendar-controls">
          <div className="calendar-view-toggle">
            <button
              className={`calendar-view-button ${view === Views.MONTH ? 'active' : ''}`}
              onClick={() => setView(Views.MONTH)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mês</span>
            </button>
            <button
              className={`calendar-view-button ${view === Views.WEEK ? 'active' : ''}`}
              onClick={() => setView(Views.WEEK)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Semana</span>
            </button>
            <button
              className={`calendar-view-button ${view === Views.DAY ? 'active' : ''}`}
              onClick={() => setView(Views.DAY)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dia</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={carregarAgendamentos}
              disabled={loading}
              className="touch-target"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="h-full">
        <CardHeader>
          {/* Filtros e Legenda */}
          <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtrar por status:</span>
            <div className="flex gap-1">
              {statusOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={filtroStatus === option.value ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${
                    filtroStatus === option.value ? option.color : ''
                  }`}
                  onClick={() => setFiltroStatus(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Total: {events.length} agendamentos
          </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2 sm:p-6">
        <div className="calendar-container">
          <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              popup
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent
              }}
              messages={messages}
              step={30}
              timeslots={2}
              min={new Date(2024, 0, 1, 7, 0)} // 7:00 AM
              max={new Date(2024, 0, 1, 19, 0)} // 7:00 PM
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) => 
                  `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                dayFormat: 'DD/MM',
                dayHeaderFormat: 'dddd, DD/MM',
                monthHeaderFormat: 'MMMM YYYY',
                dayRangeHeaderFormat: ({ start, end }) => 
                  `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`
              }}
              className="rbc-calendar scrollbar-thin"
            />
          </div>
        </div>
        </CardContent>
      </Card>
      
      {/* Modal de ações do agendamento */}
      <ModalAcoesAgendamento
        isOpen={modalAcoesOpen}
        onClose={() => {
          setModalAcoesOpen(false);
          setAgendamentoSelecionado(null);
        }}
        agendamento={agendamentoSelecionado}
        onEditar={handleEditarAgendamento}
        onRemover={handleIniciarRemocao}
      />
      
      {/* Modal de confirmação de remoção */}
      <ModalConfirmacaoRemocao
        isOpen={modalRemocaoOpen}
        onClose={() => {
          setModalRemocaoOpen(false);
          setAgendamentoSelecionado(null);
        }}
        agendamento={agendamentoSelecionado}
        onConfirm={handleConfirmarRemocao}
        loading={removendoAgendamento}
      />
    </div>
  );
};

export { CalendarioPrincipal };
export default CalendarioPrincipal;