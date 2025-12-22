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
  Menu,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Agendamento, useAgendamentos } from '@/hooks/useAgendamentos';
import { toast } from 'sonner';
import { format, parseISO, isSameDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppSidebar } from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import FormularioAgendamento from '@/components/agendamento/FormularioAgendamento';
import ModalAgendamento from '@/components/agendamento/ModalAgendamento';
import { Paciente } from '@/types/paciente';
import { Profissional } from '@/types/profissional';
import { useAuth } from '@/contexts/AuthContext';

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

const AgendamentosPage: React.FC = () => {
  const { user } = useAuth();
  const { agendamentos, loading, buscarAgendamentos, criarAgendamento, atualizarAgendamento, cancelarAgendamento } = useAgendamentos();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgendamentoStatus | 'todos'>('todos');
  const [tipoFilter, setTipoFilter] = useState<AgendamentoTipo | 'todos'>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEdicao, setAgendamentoEdicao] = useState<Agendamento | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [agendamentoVisualizando, setAgendamentoVisualizando] = useState<Agendamento | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [viewMode, setViewMode] = useState<'lista' | 'semana' | 'mes' | 'calendario'>('lista');
  const [mesAtual, setMesAtual] = useState(new Date());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstadisticasAgendamentos>({
    total: 0,
    confirmados: 0,
    pendentes: 0,
    concluidos: 0,
    cancelados: 0
  });

  const carregarAgendamentos = async () => {
    try {
      if (user?.id) {
        await buscarAgendamentos({ clinicaId: user.id });
      }
    } catch (error) {
      toast.error('Erro ao carregar agendamentos');
    }
  };

  useEffect(() => {
    const calcularEstatisticas = () => {
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
      }, {
        total: 0,
        confirmados: 0,
        pendentes: 0,
        concluidos: 0,
        cancelados: 0
      });
      
      setEstatisticas(stats);
    };

    if (agendamentos.length > 0) {
      calcularEstatisticas();
    }
  }, [agendamentos]);

  useEffect(() => {
    if (user?.id) {
      carregarAgendamentos();
    }
  }, [user?.id]);

  const handleSalvarAgendamento = async (dados: any) => {
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
      carregarAgendamentos();
    } catch (error) {
      toast.error('Erro ao salvar agendamento');
    }
  };

  const handleEditarAgendamento = (agendamento: Agendamento) => {
    setAgendamentoEdicao(agendamento);
    setModalAberto(true);
  };

  const handleExcluirAgendamento = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await cancelarAgendamento(id);
        toast.success('Agendamento excluído com sucesso!');
        carregarAgendamentos();
      } catch (error) {
        toast.error('Erro ao excluir agendamento');
      }
    }
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAgendamentoEdicao(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAgendamentoVisualizando(null);
  };

  const handleViewAgendamento = (agendamento: Agendamento) => {
    setAgendamentoVisualizando(agendamento);
    setShowModal(true);
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const correspondeBusca = searchTerm === '' || 
      agendamento.paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.profissional?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const correspondeStatus = statusFilter === 'todos' || agendamento.status === statusFilter;
    const correspondeTipo = tipoFilter === 'todos' || agendamento.tipo === tipoFilter;
    
    return correspondeBusca && correspondeStatus && correspondeTipo;
  });

  const agendamentosDaSemana = agendamentosFiltrados.filter(agendamento => {
    const dataAgendamento = parseISO(agendamento.data_hora);
    const inicioSemana = startOfWeek(dataSelecionada, { weekStartsOn: 1 });
    const fimSemana = endOfWeek(dataSelecionada, { weekStartsOn: 1 });
    return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana;
  });

  const diasDaSemana = [];
  const inicioSemana = startOfWeek(dataSelecionada, { weekStartsOn: 1 });
  
  for (let i = 0; i < 7; i++) {
    diasDaSemana.push(addDays(inicioSemana, i));
  }

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

  const voltarParaMesAtual = () => {
    setMesAtual(new Date());
  };

  const getStatusBadge = (status: AgendamentoStatus) => {
    const cores = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-green-100 text-green-800',
      'concluido': 'bg-blue-100 text-blue-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    
    return <Badge className={cores[status]}>{status}</Badge>;
  };

  const getTipoBadge = (tipo: AgendamentoTipo) => {
    const cores = {
      'consulta': 'bg-purple-100 text-purple-800',
      'retorno': 'bg-orange-100 text-orange-800',
      'exame': 'bg-pink-100 text-pink-800',
      'cirurgia': 'bg-red-100 text-red-800',
      'vacina': 'bg-green-100 text-green-800'
    };
    
    return <Badge className={cores[tipo]}>{tipo}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Desktop - oculto em mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Menu Lateral Mobile */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            
            {/* Sidebar Mobile */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <span className="sr-only">Fechar sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <AppSidebar />
              </div>
            </div>
            <div className="flex-shrink-0 w-14">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
          <Navbar />
          <div className="flex-1 overflow-auto pt-4 flex items-center justify-center">
            <div className="text-gray-500">Carregando agendamentos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop - oculto em mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Menu Lateral Mobile */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          {/* Sidebar Mobile */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <span className="sr-only">Fechar sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <AppSidebar />
            </div>
          </div>
          <div className="flex-shrink-0 w-14">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        <Navbar />
        <div className="flex-1 overflow-auto pt-4">
          <div className="container mx-auto px-4">
            {/* Cabeçalho com botão Novo Agendamento */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
              </div>
              <Button onClick={() => setModalAberto(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>

            {/* Filtros e busca */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
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
                      <SelectItem value="vacina">Vacina</SelectItem>
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
                      <SelectItem value="lista">Lista</SelectItem>
                      <SelectItem value="semana">Semana</SelectItem>
                      <SelectItem value="mes">Mês</SelectItem>
                      <SelectItem value="calendario">Calendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{estatisticas.confirmados}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{estatisticas.concluidos}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{estatisticas.cancelados}</div>
                </CardContent>
              </Card>
            </div>

            {/* Conteúdo principal com Tabs */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="semana">Semana</TabsTrigger>
                <TabsTrigger value="mes">Mês</TabsTrigger>
                <TabsTrigger value="calendario">Calendário</TabsTrigger>
              </TabsList>

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
                                     {format(parseISO(agendamento.data_hora), 'dd/MM/yyyy', { locale: ptBR })}
                                   </div>
                                   <div className="text-sm text-gray-500">
                                     {format(parseISO(agendamento.data_hora), 'HH:mm', { locale: ptBR })}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

              {/* Visualização Calendário Detalhado */}
              <TabsContent value="calendario" className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-4">Calendário de Agendamentos</h3>
                  <div className="text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <p>Funcionalidade de calendário detalhado em desenvolvimento.</p>
                    <p className="text-sm mt-2">Use a visualização "Mês" para ver todos os agendamentos em formato de calendário.</p>
                  </div>
                </div>
              </TabsContent>

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
                           .filter(agendamento => isSameDay(parseISO(agendamento.data_hora), dia))
                           .map((agendamento) => (
                             <div
                               key={agendamento.id}
                               className="p-2 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100"
                               onClick={() => handleViewAgendamento(agendamento)}
                             >
                               <div className="text-xs font-medium text-blue-900">
                                 {format(parseISO(agendamento.data_hora), 'HH:mm', { locale: ptBR })}
                               </div>
                              <div className="text-xs text-blue-700 truncate">
                                {agendamento.paciente?.nome || 'Paciente não encontrado'}
                              </div>
                              <div className="text-xs text-blue-600">
                                {getStatusBadge(agendamento.status)}
                              </div>
                            </div>
                          ))}
                          
                        {agendamentosDaSemana.filter(agendamento => isSameDay(parseISO(agendamento.data_hora), dia)).length === 0 && (
                          <div className="text-xs text-gray-400 text-center py-4">
                            Nenhum agendamento
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Card com estatísticas detalhadas */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Detalhadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-600">Pendentes</span>
                      </div>
                      <span className="font-medium">{estatisticas.pendentes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Confirmados</span>
                      </div>
                      <span className="font-medium">{estatisticas.confirmados}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Concluídos</span>
                      </div>
                      <span className="font-medium">{estatisticas.concluidos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">Cancelados</span>
                      </div>
                      <span className="font-medium">{estatisticas.cancelados}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Modal de Formulário */}
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {agendamentoEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}
                </DialogTitle>
              </DialogHeader>
              
              <FormularioAgendamento
                clinicaId={user?.id || ''}
                agendamento={agendamentoEdicao}
                onSalvar={handleSalvarAgendamento}
                onCancelar={handleFecharModal}
                modo={agendamentoEdicao ? 'editar' : 'criar'}
                hideTypeSelection={true}
              />
            </DialogContent>
          </Dialog>

          {/* Modal de Visualização */}
          <ModalAgendamento
            agendamento={agendamentoVisualizando}
            isOpen={showModal}
            onClose={handleCloseModal}
            onEdit={(agendamento) => {
              handleCloseModal();
              handleEditarAgendamento(agendamento);
            }}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendamentosPage;