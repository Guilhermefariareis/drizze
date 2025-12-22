import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Agendamento, useAgendamentos } from '@/hooks/useAgendamentos';
import { toast } from 'sonner';
import { format, parseISO, isSameDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FormularioAgendamento from '@/components/agendamento/FormularioAgendamento';
import ModalAgendamento from '@/components/agendamento/ModalAgendamento';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicProfile } from '@/hooks/useClinicProfile';

// Definições dos tipos
export type AgendamentoStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type AgendamentoTipo = 'consulta' | 'retorno' | 'exame' | 'cirurgia' | 'vacina';

interface EstadisticasAgendamentos {
  total: number;
  confirmados: number;
  pendentes: number;
  concluidos: number;
  cancelados: number;
}

interface AgendamentosContentProps {
  initialViewMode?: 'lista' | 'semana' | 'mes' | 'calendario';
}

const AgendamentosContent: React.FC<AgendamentosContentProps> = ({ initialViewMode = 'calendario' }) => {
  const { user } = useAuth();
  const { clinic } = useClinicProfile();
  const { agendamentos, loading, buscarAgendamentos, criarAgendamento, atualizarAgendamento, cancelarAgendamento } = useAgendamentos();
  
  // Obter o clinicId correto da clínica do usuário logado
  const clinicId = clinic?.id || user?.id || '';
  
  console.log('🔍 [DEBUG] AgendamentosContent - clinic:', clinic);
  console.log('🔍 [DEBUG] AgendamentosContent - clinicId:', clinicId);
  console.log('🔍 [DEBUG] AgendamentosContent - user?.id:', user?.id);
  
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgendamentoStatus | 'todos'>('todos');
  const [tipoFilter, setTipoFilter] = useState<AgendamentoTipo | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'semana' | 'mes' | 'calendario'>(initialViewMode);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date());
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEdicao, setAgendamentoEdicao] = useState<Agendamento | null>(null);
  const [agendamentoVisualizando, setAgendamentoVisualizando] = useState<Agendamento | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstadisticasAgendamentos>({
    total: 0,
    confirmados: 0,
    pendentes: 0,
    concluidos: 0,
    cancelados: 0
  });

  // Buscar agendamentos quando o componente montar ou filtros mudarem
  useEffect(() => {
    console.log('🔍 [DEBUG] AgendamentosContent - useEffect chamado');
    console.log('🔍 [DEBUG] AgendamentosContent - clinicId:', clinicId);
    
    if (clinicId) {
      console.log('🔍 [DEBUG] AgendamentosContent - Buscando agendamentos para clinicId:', clinicId);
      buscarAgendamentos({ clinicaId: clinicId });
    } else {
      console.log('⚠️ [DEBUG] AgendamentosContent - clinicId não disponível');
    }
  }, [clinicId, buscarAgendamentos]);

  // Calcular estatísticas
  useEffect(() => {
    if (agendamentos.length > 0) {
      const stats = agendamentos.reduce((acc, agendamento) => {
        acc.total++;
        switch (agendamento.status) {
          case 'confirmado':
            acc.confirmados++;
            break;
          case 'pendente':
            acc.pendentes++;
            break;
          case 'concluido':
            acc.concluidos++;
            break;
          case 'cancelado':
            acc.cancelados++;
            break;
        }
        return acc;
      }, { total: 0, confirmados: 0, pendentes: 0, concluidos: 0, cancelados: 0 });
      setEstatisticas(stats);
    }
  }, [agendamentos]);

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const correspondeBusca = searchTerm === '' || 
      agendamento.paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.profissional?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const correspondeStatus = statusFilter === 'todos' || agendamento.status === statusFilter;
    const correspondeTipo = tipoFilter === 'todos' || agendamento.tipo === tipoFilter;
    
    return correspondeBusca && correspondeStatus && correspondeTipo;
  });

  // Funções para o calendário mensal
  const getDiasDoMes = (data: Date) => {
    const inicio = startOfMonth(data);
    const fim = endOfMonth(data);
    return eachDayOfInterval({ start: inicio, end: fim });
  };

  const getAgendamentosDoDia = (dia: Date) => {
    return agendamentosFiltrados.filter(agendamento => 
      isSameDay(parseISO(agendamento.data_hora), dia)
    );
  };

  const mesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };

  const proximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };

  // Dias da semana para visualização de semana
  const diasDaSemana = [];
  const inicioSemana = startOfWeek(dataSelecionada, { weekStartsOn: 1 });
  
  for (let i = 0; i < 7; i++) {
    diasDaSemana.push(addDays(inicioSemana, i));
  }

  // Agendamentos da semana
  const agendamentosDaSemana = agendamentosFiltrados.filter(agendamento => {
    if (!agendamento.data_hora) return false;
    const dataAgendamento = parseISO(agendamento.data_hora);
    return dataAgendamento >= inicioSemana && dataAgendamento <= endOfWeek(dataSelecionada, { weekStartsOn: 1 });
  });

  // Handlers
  const handleSalvarAgendamento = async (dados: Partial<Agendamento>) => {
    try {
      if (agendamentoEdicao) {
        await atualizarAgendamento(agendamentoEdicao.id, dados);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await criarAgendamento(dados);
        toast.success('Agendamento criado com sucesso!');
      }
      setModalAberto(false);
      setAgendamentoEdicao(null);
    } catch (error) {
      toast.error('Erro ao salvar agendamento');
    }
  };

  // Função para abrir o modal de novo agendamento
  const abrirModalNovo = () => {
    console.log('🔍 [DEBUG] AgendamentosContent - Abrindo modal de novo agendamento');
    console.log('🔍 [DEBUG] AgendamentosContent - clinicId:', clinicId);
    setAgendamentoEdicao(null);
    setModalAberto(true);
  };

  // Função para abrir o modal de edição
  const abrirModalEdicao = (agendamento: Agendamento) => {
    console.log('🔍 [DEBUG] AgendamentosContent - Abrindo modal de edição:', agendamento);
    setAgendamentoEdicao(agendamento);
    setModalAberto(true);
  };

  const handleEditarAgendamento = (agendamento: Agendamento) => {
    setAgendamentoEdicao(agendamento);
    setModalAberto(true);
  };

  const handleExcluirAgendamento = async (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await cancelarAgendamento(id);
        toast.success('Agendamento cancelado com sucesso!');
      } catch (error) {
        toast.error('Erro ao cancelar agendamento');
      }
    }
  };

  const handleViewAgendamento = (agendamento: Agendamento) => {
    setAgendamentoVisualizando(agendamento);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAgendamentoVisualizando(null);
  };

  const getStatusBadge = (status: AgendamentoStatus) => {
    const cores = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      concluido: 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={`${cores[status]} text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: AgendamentoTipo) => {
    const cores = {
      consulta: 'bg-blue-100 text-blue-800',
      retorno: 'bg-green-100 text-green-800',
      exame: 'bg-purple-100 text-purple-800',
      cirurgia: 'bg-red-100 text-red-800',
      vacina: 'bg-indigo-100 text-indigo-800'
    };
    
    if (!tipo) return <Badge className="bg-gray-100 text-gray-800 text-xs">Desconhecido</Badge>;
    
    return (
      <Badge className={`${cores[tipo]} text-xs`}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão Novo Agendamento */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        </div>
        <Button onClick={abrirModalNovo}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
            <div className="text-sm text-blue-800">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estatisticas.confirmados}</div>
            <div className="text-sm text-green-800">Confirmados</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
            <div className="text-sm text-yellow-800">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.concluidos}</div>
            <div className="text-sm text-blue-800">Concluídos</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{estatisticas.cancelados}</div>
            <div className="text-sm text-red-800">Cancelados</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Paciente ou profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="consulta">Consulta</SelectItem>
                <SelectItem value="retorno">Retorno</SelectItem>
                <SelectItem value="exame">Exame</SelectItem>
                <SelectItem value="cirurgia">Cirurgia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visualização</label>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Modo de visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendario">Calendário</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="lista">Lista</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="mes">Mês</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>

        {/* Visualização Calendário Detalhado */}
        <TabsContent value="calendario" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Controles do calendário */}
            <div className="flex justify-between items-center p-4 border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMesAtual(subMonths(mesAtual, 1))}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Mês Anterior
              </Button>
              
              <div className="text-lg font-semibold">
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMesAtual(addMonths(mesAtual, 1))}
              >
                Próximo Mês
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Calendário mensal detalhado */}
            <div className="p-4">
              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                  <div key={dia} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded">
                    {dia}
                  </div>
                ))}
              </div>
              
              {/* Dias do mês com agendamentos */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const dias = getDiasDoMes(mesAtual);
                  const primeiroDia = dias[0];
                  const diaSemana = primeiroDia.getDay();
                  const diasVazios = Array(diaSemana).fill(null);
                  
                  return [...diasVazios, ...dias].map((dia, index) => {
                    if (!dia) {
                      return <div key={index} className="h-24"></div>;
                    }
                    
                    const agendamentosDoDia = getAgendamentosDoDia(dia);
                    const temAgendamentos = agendamentosDoDia.length > 0;
                    
                    return (
                      <div
                        key={index}
                        className={`h-24 border rounded p-2 cursor-pointer transition-colors ${
                          isToday(dia) 
                            ? 'bg-blue-50 border-blue-300' 
                            : temAgendamentos 
                              ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (temAgendamentos) {
                            setDataSelecionada(dia);
                            setViewMode('lista');
                          }
                        }}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(dia) ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {format(dia, 'd')}
                        </div>
                        
                        {temAgendamentos && (
                          <div className="space-y-1">
                            <div className="text-xs text-green-600 font-medium">
                              {agendamentosDoDia.length} agendamento{agendamentosDoDia.length > 1 ? 's' : ''}
                            </div>
                            
                            {agendamentosDoDia.slice(0, 2).map((agendamento) => (
                              <div
                                key={agendamento.id}
                                className="text-xs p-1 bg-green-100 text-green-800 rounded truncate"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewAgendamento(agendamento);
                                }}
                              >
                                {format(parseISO(agendamento.data_hora), 'HH:mm')} - {agendamento.paciente?.nome || 'Paciente'}
                              </div>
                            ))}
                            
                            {agendamentosDoDia.length > 2 && (
                              <div className="text-xs text-green-600 text-center">
                                +{agendamentosDoDia.length - 2} mais
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!temAgendamentos && (
                          <div className="text-xs text-gray-400 text-center mt-4">
                            Sem agendamentos
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
          
          {/* Legenda */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded mr-2"></div>
              <span>Hoje</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
              <span>Com agendamentos</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
              <span>Sem agendamentos</span>
            </div>
          </div>
        </TabsContent>

        {/* Visualização Mensal */}
        <TabsContent value="mes" className="space-y-4">
          {/* Controles do mês */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={mesAnterior}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Mês Anterior
            </Button>
            
            <div className="text-lg font-semibold">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={proximoMes}
            >
              Próximo Mês
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Calendário Mensal */}
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 border-b bg-gray-50">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                <div key={dia} className="p-3 text-center text-sm font-medium text-gray-700">
                  {dia}
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7">
              {(() => {
                const dias = getDiasDoMes(mesAtual);
                const primeiroDia = dias[0];
                const diaSemana = primeiroDia.getDay();
                const diasVazios = Array(diaSemana).fill(null);
                
                return [...diasVazios, ...dias].map((dia, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] border-r border-b p-2 ${
                      dia ? 'hover:bg-gray-50 cursor-pointer' : ''
                    } ${
                      dia && isToday(dia) ? 'bg-blue-50 border-blue-200' : ''
                    } ${
                      dia && !isSameMonth(dia, mesAtual) ? 'text-gray-300' : ''
                    }`}
                    onClick={() => dia && setDataSelecionada(dia)}
                  >
                    {dia && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(dia) ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {format(dia, 'd')}
                        </div>
                        <div className="space-y-1">
                          {getAgendamentosDoDia(dia).slice(0, 3).map((agendamento) => (
                            <div
                              key={agendamento.id}
                              className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewAgendamento(agendamento);
                              }}
                            >
                              {format(parseISO(agendamento.data_hora), 'HH:mm')} - {agendamento.paciente?.nome || 'Paciente'}
                            </div>
                          ))}
                          {getAgendamentosDoDia(dia).length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{getAgendamentosDoDia(dia).length - 3} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </TabsContent>

        {/* Visualização Semana */}
        <TabsContent value="semana" className="space-y-4">
          {/* Controles da semana */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDataSelecionada(subDays(dataSelecionada, 7))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Semana Anterior
            </Button>
            
            <div className="text-lg font-semibold">
              {format(inicioSemana, 'dd/MM', { locale: ptBR })} - {format(endOfWeek(dataSelecionada, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDataSelecionada(addDays(dataSelecionada, 7))}
            >
              Próxima Semana
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Grade da semana */}
          <div className="grid grid-cols-7 gap-4">
            {diasDaSemana.map((dia) => (
              <div key={dia.toISOString()} className="bg-white rounded-lg shadow-sm border">
                <div className="p-3 border-b bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">
                    {format(dia, 'EEEE', { locale: ptBR })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(dia, 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
                
                <div className="p-3 space-y-2 min-h-[200px]">
                  {agendamentosDaSemana
                     .filter(agendamento => agendamento.data_hora && isSameDay(parseISO(agendamento.data_hora), dia))
                     .map((agendamento) => (
                       <div
                         key={agendamento.id}
                         className="p-2 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100"
                         onClick={() => handleViewAgendamento(agendamento)}
                       >
                         <div className="text-xs font-medium text-blue-900">
                           {agendamento.data_hora ? format(parseISO(agendamento.data_hora), 'HH:mm', { locale: ptBR }) : 'Hora não informada'}
                         </div>
                        <div className="text-xs text-blue-700 truncate">
                          {agendamento.paciente?.nome || 'Paciente não encontrado'}
                        </div>
                        <div className="text-xs text-blue-600">
                          {getStatusBadge(agendamento.status)}
                        </div>
                      </div>
                    ))}
                    
                  {agendamentosDaSemana.filter(agendamento => agendamento.data_hora && isSameDay(parseISO(agendamento.data_hora), dia)).length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4">
                      Nenhum agendamento
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Visualização Lista */}
        <TabsContent value="lista" className="space-y-4">
          {/* Lista de Agendamentos */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profissional
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agendamentosFiltrados.map((agendamento) => (
                    <tr key={agendamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {agendamento.paciente?.nome || 'Paciente não encontrado'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agendamento.paciente?.telefone || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {agendamento.profissional?.nome || 'Profissional não encontrado'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                               {agendamento.data_hora ? format(parseISO(agendamento.data_hora), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
                             </div>
                             <div className="text-sm text-gray-500">
                               {agendamento.data_hora ? format(parseISO(agendamento.data_hora), 'HH:mm', { locale: ptBR }) : 'Hora não informada'}
                             </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTipoBadge(agendamento.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(agendamento.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAgendamento(agendamento)}
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarAgendamento(agendamento)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirAgendamento(agendamento.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {agendamentosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum agendamento encontrado
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Formulário */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {agendamentoEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>
          
          <FormularioAgendamento
            clinicaId={clinicId}
            agendamento={agendamentoEdicao}
            onSalvar={handleSalvarAgendamento}
            onCancelar={() => {
              setModalAberto(false);
              setAgendamentoEdicao(null);
            }}
            modo={agendamentoEdicao ? 'editar' : 'criar'}
            hideTypeSelection={true}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <ModalAgendamento
        agendamento={agendamentoVisualizando}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setAgendamentoVisualizando(null);
        }}
        onEdit={(agendamento) => {
          setShowModal(false);
          setAgendamentoVisualizando(null);
          handleEditarAgendamento(agendamento);
        }}
      />
    </div>
  );
};

export default AgendamentosContent;