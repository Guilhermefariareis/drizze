import React, { useState, useMemo } from 'react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { Agendamento } from '@/types/agendamento';
import { LoadingState, LoadingSpinner } from '@/components/ui/loading-spinner';
import { useConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';

interface ListaAgendamentosProps {
  onEditAgendamento?: (agendamento: Agendamento) => void;
  onViewAgendamento?: (agendamento: Agendamento) => void;
  showFilters?: boolean;
  compactMode?: boolean;
}

const statusConfig = {
  pendente: {
    label: 'Pendente',
    color: 'bg-blue-100 text-blue-800',
    icon: Calendar
  },
  confirmado: {
    label: 'Confirmado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  concluido: {
    label: 'Concluído',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle
  },
  cancelado: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
};

const formatarDataRelativa = (data: string) => {
  const dataObj = parseISO(data);
  
  if (isToday(dataObj)) {
    return 'Hoje';
  } else if (isTomorrow(dataObj)) {
    return 'Amanhã';
  } else if (isYesterday(dataObj)) {
    return 'Ontem';
  } else {
    return format(dataObj, "dd 'de' MMMM", { locale: ptBR });
  }
};

export const ListaAgendamentos: React.FC<ListaAgendamentosProps> = ({
  onEditAgendamento,
  onViewAgendamento,
  showFilters = true,
  compactMode = false
}) => {
  const {
    agendamentos,
    loading,
    cancelarAgendamento,
    confirmarAgendamento,
    concluirAgendamento
  } = useAgendamentos({ enableRealTime: true, enableAutoRefresh: true });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dataFilter, setDataFilter] = useState<string>('todos');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const agendamentosFiltrados = useMemo(() => {
    let filtered = agendamentos;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(agendamento => {
        const pacienteNome = agendamento.paciente?.nome?.toLowerCase() || '';
        const pacienteEmail = agendamento.paciente?.email?.toLowerCase() || '';
        const servicoNome = agendamento.servico?.nome?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return pacienteNome.includes(searchLower) ||
               pacienteEmail.includes(searchLower) ||
               servicoNome.includes(searchLower);
      });
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(agendamento => agendamento.status === statusFilter);
    }

    // Filtro por data
    if (dataFilter !== 'todos') {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      
      filtered = filtered.filter(agendamento => {
        const dataAgendamento = parseISO(agendamento.data_hora);
        
        switch (dataFilter) {
          case 'hoje':
            return isToday(dataAgendamento);
          case 'amanha':
            return isTomorrow(dataAgendamento);
          case 'semana':
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());
            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + 6);
            return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => 
      new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
    );
  }, [agendamentos, searchTerm, statusFilter, dataFilter]);

  const handleStatusChange = (agendamento: Agendamento, novoStatus: string) => {
    const statusMessages = {
      confirmado: {
        title: 'Confirmar Agendamento',
        description: `Deseja confirmar o agendamento de ${agendamento.paciente?.nome || 'paciente'}?`,
        confirmText: 'Confirmar',
        action: () => confirmarAgendamento(agendamento.id)
      },
      concluido: {
        title: 'Concluir Agendamento',
        description: `Marcar o agendamento de ${agendamento.paciente?.nome || 'paciente'} como concluído?`,
        confirmText: 'Concluir',
        action: () => concluirAgendamento(agendamento.id)
      },
      cancelado: {
        title: 'Cancelar Agendamento',
        description: `Tem certeza que deseja cancelar o agendamento de ${agendamento.paciente?.nome || 'paciente'}? Esta ação não pode ser desfeita.`,
        confirmText: 'Cancelar Agendamento',
        variant: 'destructive' as const,
        action: () => cancelarAgendamento(agendamento.id)
      }
    };

    const config = statusMessages[novoStatus as keyof typeof statusMessages];
    if (!config) return;

    showConfirmation({
      ...config,
      onConfirm: async () => {
        try {
          setActionLoading(agendamento.id);
          await config.action();
          toast.success(`Agendamento ${novoStatus} com sucesso!`);
        } catch (error) {
          console.error('Erro ao alterar status:', error);
          toast.error('Erro ao alterar status do agendamento');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  if (loading) {
    return <LoadingState message="Carregando agendamentos..." />;
  }

  return (
    <div className="space-y-4">
      <ConfirmationDialog />
      {showFilters && (
        <Card className="card-mobile sm:card-desktop">
          <CardContent className="spacing-mobile sm:spacing-desktop">
            <div className="calendar-header">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por paciente, email ou serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-mobile sm:input-desktop"
                  />
                </div>
              </div>
              
              <div className="calendar-controls">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 select-mobile sm:select-desktop">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dataFilter} onValueChange={setDataFilter}>
                  <SelectTrigger className="w-full sm:w-48 select-mobile sm:select-desktop">
                    <SelectValue placeholder="Data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as datas</SelectItem>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="amanha">Amanhã</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {agendamentosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'todos' || dataFilter !== 'todos'
                ? 'Tente ajustar os filtros para encontrar agendamentos.'
                : 'Não há agendamentos cadastrados ainda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-mobile sm:card-desktop">
          <CardContent className="p-0">
            <div className="table-responsive">
              <table className="w-full table-mobile">
                <thead className="bg-muted/50 hidden md:table-header-group">
                  <tr>
                    <th className="text-left p-4 font-medium text-responsive-sm">Paciente</th>
                    <th className="text-left p-4 font-medium text-responsive-sm">Data/Hora</th>
                    <th className="text-left p-4 font-medium text-responsive-sm">Serviço</th>
                    <th className="text-left p-4 font-medium text-responsive-sm">Status</th>
                    <th className="text-left p-4 font-medium text-responsive-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentosFiltrados.map((agendamento) => {
                    const StatusIcon = statusConfig[agendamento.status as keyof typeof statusConfig]?.icon || Calendar;
                    
                    return (
                      <tr key={agendamento.id} className="table-row-mobile hover:bg-muted/30">
                        <td className="table-cell-mobile" data-label="Paciente">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-responsive-sm">{agendamento.paciente?.nome || 'Nome não informado'}</p>
                              <p className="text-xs text-muted-foreground">{agendamento.paciente?.telefone || 'Telefone não informado'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell-mobile" data-label="Data/Hora">
                          <div>
                            <p className="font-medium text-responsive-sm">{formatarDataRelativa(agendamento.data_hora)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(agendamento.data_hora), 'HH:mm')}
                            </p>
                          </div>
                        </td>
                        <td className="table-cell-mobile" data-label="Serviço">
                          <p className="font-medium text-responsive-sm">{agendamento.servico?.nome || 'Serviço não informado'}</p>
                        </td>
                        <td className="table-cell-mobile" data-label="Status">
                          <Badge 
                            className={`status-indicator status-${agendamento.status} ${statusConfig[agendamento.status as keyof typeof statusConfig]?.color}`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[agendamento.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </td>
                        <td className="table-cell-mobile" data-label="Ações">
                          <div className="flex items-center gap-2 flex-wrap">
                            {onViewAgendamento && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewAgendamento(agendamento)}
                                className="touch-target"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Visualizar</span>
                              </Button>
                            )}
                            {onEditAgendamento && agendamento.status !== 'cancelado' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditAgendamento(agendamento)}
                                className="touch-target"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            )}
                            {agendamento.status === 'pendente' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(agendamento, 'confirmado')}
                                disabled={actionLoading === agendamento.id}
                                className="text-green-600 hover:text-green-700 touch-target"
                              >
                                {actionLoading === agendamento.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                <span className="sr-only">Confirmar</span>
                              </Button>
                            )}
                            {agendamento.status === 'confirmado' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(agendamento, 'concluido')}
                                disabled={actionLoading === agendamento.id}
                                className="text-purple-600 hover:text-purple-700 touch-target"
                              >
                                {actionLoading === agendamento.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                <span className="sr-only">Concluir</span>
                              </Button>
                            )}
                            {agendamento.status !== 'cancelado' && agendamento.status !== 'concluido' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(agendamento, 'cancelado')}
                                disabled={actionLoading === agendamento.id}
                                className="text-red-600 hover:text-red-700 touch-target"
                              >
                                {actionLoading === agendamento.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span className="sr-only">Cancelar</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListaAgendamentos;