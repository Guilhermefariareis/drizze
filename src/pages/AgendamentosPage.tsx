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
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { toast } from 'sonner';
import { format, parseISO, isSameDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppSidebar } from '@/components/AppSidebar';
import FormularioAgendamento from '@/components/agendamento/FormularioAgendamento';
import ModalAgendamento from '@/components/agendamento/ModalAgendamento';
import { Paciente } from '@/types/paciente';
import { Profissional } from '@/types/profissional';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicProfile } from '@/hooks/useClinicProfile';

// Definições dos tipos
export type AgendamentoStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'no_show';
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
  const { clinic } = useClinicProfile();
  const { agendamentos, loading, buscarAgendamentos, criarAgendamento, atualizarAgendamento, cancelarAgendamento } = useAgendamentos();

  // ... (rest of state)

  // Use the correct clinic ID
  const clinicaId = clinic?.id || user?.id || '';
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
      if (clinicaId) {
        console.log('📅 [DEBUG] AgendamentosPage - Carregando agendamentos para clínica:', clinicaId);
        await buscarAgendamentos({ clinicaId: clinicaId });
      } else {
        console.warn('📅 [DEBUG] AgendamentosPage - clinicaId ainda não disponível');
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

  useEffect(() => {
    if (clinicaId) {
      carregarAgendamentos();
    }
  }, [clinicaId]);

  const { criarNotificacao } = useNotificacoes();

  const handleSalvarAgendamento = async (dados: any) => {
    try {
      if (agendamentoEdicao) {
        await atualizarAgendamento(agendamentoEdicao.id, dados);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        const novoAgendamento = await criarAgendamento({
          ...dados,
          status: 'confirmado' // Confirmar automaticamente como solicitado
        });

        if (novoAgendamento) {
          // Criar notificação
          try {
            await criarNotificacao({
              tipo: 'agendamento',
              titulo: 'Novo Agendamento Confirmado',
              mensagem: `Agendamento para ${dados.nome_paciente || 'Paciente'} em ${format(new Date(dados.data_hora), "dd/MM 'às' HH:mm")}`,
              usuario_id: user?.id || '',
              prioridade: 'alta'
            });
          } catch (notifError) {
            console.error('Erro ao criar notificação:', notifError);
          }

          toast.success('Agendamento criado e confirmado!');
        }
      }

      setModalAberto(false);
      setAgendamentoEdicao(null);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao salvar:', error);
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
      <div className="flex h-screen bg-[#0F0F23] overflow-hidden">
        {/* Sidebar Desktop - já inclusa no layout principal se usado wrappers, mas aqui parece ser standalone */}
        {/* A AppSidebar já é dark agora */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* ... Mobile sidebar logic can stay similar but needs bg update if reused ... */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0F0F23] shadow-2xl border-r border-white/10">
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
            <div className="flex-shrink-0 w-14"></div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-24 lg:ml-64 bg-[#0F0F23]">
          <div className="flex-1 overflow-auto pt-4 flex items-center justify-center">
            <div className="text-muted-foreground flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p>Carregando agendamentos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0F0F23] overflow-hidden text-foreground">
      {/* Background Aurora */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Menu Lateral Mobile */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0F0F23] shadow-2xl border-r border-white/10">
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
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-24 lg:ml-64 transition-all duration-300">
        <div className="flex-1 overflow-auto pt-4">
          <div className="container mx-auto px-4 lg:px-8 py-6">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Agendamentos</h1>
                  <p className="text-muted-foreground">Gerencie sua agenda de forma eficiente</p>
                </div>
              </div>
              <Button onClick={() => setModalAberto(true)} className="bg-primary hover:bg-primary-hover text-white font-bold h-12 px-6 rounded-2xl shadow-glow shadow-primary/20">
                <Plus className="w-5 h-5 mr-2" />
                Novo Agendamento
              </Button>
            </div>

            {/* Filtros e busca */}
            <div className="glass-effect rounded-[2rem] p-6 mb-8 border-none">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Paciente ou profissional..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Tipo</label>
                  <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as any)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Visualização</label>
                  <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="glass-effect border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{estatisticas.total}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Confirmados</CardTitle>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{estatisticas.confirmados}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                  <div className="w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-400">{estatisticas.pendentes}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{estatisticas.concluidos}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cancelados</CardTitle>
                  <div className="w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-400">{estatisticas.cancelados}</div>
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
                <div className="glass-effect rounded-[2rem] border-none overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Paciente
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Profissional
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Data/Hora
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent divide-y divide-white/5">
                        {agendamentosFiltrados.map((agendamento) => (
                          <tr key={agendamento.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-primary" />
                                <div>
                                  <div className="text-sm font-bold text-white">
                                    {agendamento.paciente?.nome || 'Paciente não encontrado'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {agendamento.paciente?.telefone || ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Stethoscope className="w-4 h-4 mr-2 text-primary" />
                                <div className="text-sm text-gray-300">
                                  {agendamento.profissional?.nome || 'Profissional não encontrado'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-primary" />
                                <div>
                                  <div className="text-sm text-gray-300">
                                    {format(parseISO(agendamento.data_hora), 'dd/MM/yyyy', { locale: ptBR })}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
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
                                  className="text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                  <Calendar className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditarAgendamento(agendamento)}
                                  className="text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExcluirAgendamento(agendamento.id)}
                                  className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
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
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 opacity-50" />
                      </div>
                      <p>Nenhum agendamento encontrado</p>
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
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Mês Anterior
                  </Button>

                  <div className="text-lg font-bold text-white uppercase tracking-wider">
                    {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={proximoMes}
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    Próximo Mês
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Calendário Mensal */}
                <div className="glass-effect rounded-[2rem] border-none shadow-xl overflow-hidden">
                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                      <div key={dia} className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 divide-x divide-white/5 divide-y">
                    {(() => {
                      const dias = getDiasDoMes(mesAtual);
                      const primeiroDia = dias[0];
                      const diaSemana = primeiroDia.getDay();
                      const diasVazios = Array(diaSemana).fill(null);

                      return [...diasVazios, ...dias].map((dia, index) => (
                        <div
                          key={index}
                          className={`min-h-[120px] p-2 transition-colors ${dia ? 'hover:bg-white/5 cursor-pointer' : ''
                            } ${dia && isToday(dia) ? 'bg-primary/10 border-primary/30 relative overflow-hidden' : ''
                            } ${dia && !isSameMonth(dia, mesAtual) ? 'opacity-30' : ''
                            }`}
                          onClick={() => dia && setDataSelecionada(dia)}
                        >
                          {dia && isToday(dia) && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                          {dia && (
                            <>
                              <div className={`text-sm font-bold mb-2 flex justify-between items-center ${isToday(dia) ? 'text-primary' : 'text-white'
                                }`}>
                                <span>{format(dia, 'd')}</span>
                                {isToday(dia) && <span className="text-[10px] uppercase font-bold tracking-wider">Hoje</span>}
                              </div>
                              <div className="space-y-1.5">
                                {getAgendamentosDoDia(dia).slice(0, 3).map((agendamento) => (
                                  <div
                                    key={agendamento.id}
                                    className="text-[10px] p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 truncate border border-white/5 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewAgendamento(agendamento);
                                    }}
                                  >
                                    <span className="font-bold text-primary">{format(parseISO(agendamento.data_hora), 'HH:mm')}</span> {agendamento.paciente?.nome || 'Paciente'}
                                  </div>
                                ))}
                                {getAgendamentosDoDia(dia).length > 3 && (
                                  <div className="text-[10px] text-muted-foreground text-center font-medium">
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
                <div className="glass-effect rounded-[2rem] border-none p-8 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Calendário de Agendamentos</h3>
                  <div className="text-muted-foreground max-w-md mx-auto">
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
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Semana Anterior
                  </Button>

                  <div className="text-lg font-bold text-white">
                    {format(inicioSemana, 'dd/MM', { locale: ptBR })} - {format(endOfWeek(dataSelecionada, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDataSelecionada(addDays(dataSelecionada, 7))}
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    Próxima Semana
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Grade da semana */}
                <div className="grid grid-cols-7 gap-4">
                  {diasDaSemana.map((dia) => (
                    <div key={dia.toISOString()} className="glass-effect rounded-2xl border-none overflow-hidden">
                      <div className="p-3 border-b border-white/10 bg-white/5 text-center">
                        <div className="text-sm font-bold text-white uppercase tracking-wider">
                          {format(dia, 'EEEE', { locale: ptBR })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(dia, 'dd/MM', { locale: ptBR })}
                        </div>
                      </div>

                      <div className="p-3 space-y-2 min-h-[200px]">
                        {agendamentosDaSemana
                          .filter(agendamento => isSameDay(parseISO(agendamento.data_hora), dia))
                          .map((agendamento) => (
                            <div
                              key={agendamento.id}
                              className="p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-105 transition-all group"
                              onClick={() => handleViewAgendamento(agendamento)}
                            >
                              <div className="text-xs font-bold text-primary mb-1">
                                {format(parseISO(agendamento.data_hora), 'HH:mm', { locale: ptBR })}
                              </div>
                              <div className="text-xs text-white truncate font-medium group-hover:text-primary transition-colors">
                                {agendamento.paciente?.nome || 'Paciente não encontrado'}
                              </div>
                              <div className="mt-2">
                                {getStatusBadge(agendamento.status)}
                              </div>
                            </div>
                          ))}

                        {agendamentosDaSemana.filter(agendamento => isSameDay(parseISO(agendamento.data_hora), dia)).length === 0 && (
                          <div className="text-xs text-muted-foreground text-center py-8 opacity-50">
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
              <Card className="glass-effect border-none">
                <CardHeader>
                  <CardTitle className="text-white">Estatísticas Detalhadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        <span className="text-gray-300 font-medium">Pendentes</span>
                      </div>
                      <span className="font-bold text-white text-lg">{estatisticas.pendentes}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-gray-300 font-medium">Confirmados</span>
                      </div>
                      <span className="font-bold text-white text-lg">{estatisticas.confirmados}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-gray-300 font-medium">Concluídos</span>
                      </div>
                      <span className="font-bold text-white text-lg">{estatisticas.concluidos}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                        <span className="text-gray-300 font-medium">Cancelados</span>
                      </div>
                      <span className="font-bold text-white text-lg">{estatisticas.cancelados}</span>
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
                  clinicaId={clinicaId}
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