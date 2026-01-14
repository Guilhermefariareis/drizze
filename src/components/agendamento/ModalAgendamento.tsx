import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  X,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Agendamento, useAgendamentos } from '@/hooks/useAgendamentos';

interface ModalAgendamentoProps {
  agendamento: Agendamento | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (agendamento: Agendamento) => void;
}

const statusConfig = {
  pendente: {
    label: 'Pendente',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Calendar,
    description: 'Agendamento criado, aguardando confirmação'
  },
  confirmado: {
    label: 'Confirmado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Agendamento confirmado pelo paciente'
  },
  concluido: {
    label: 'Concluído',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: CheckCircle,
    description: 'Consulta realizada com sucesso'
  },
  cancelado: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Agendamento cancelado'
  }
};

export const ModalAgendamento: React.FC<ModalAgendamentoProps> = ({
  agendamento,
  isOpen,
  onClose,
  onEdit
}) => {
  const {
    cancelarAgendamento,
    confirmarAgendamento,
    concluirAgendamento,
    loading
  } = useAgendamentos();

  if (!agendamento) return null;

  const statusInfo = statusConfig[agendamento.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo?.icon || AlertCircle;

  const handleStatusChange = async (novoStatus: string) => {
    try {
      switch (novoStatus) {
        case 'confirmado':
          await confirmarAgendamento(agendamento.id);
          break;
        case 'concluido':
          await concluirAgendamento(agendamento.id);
          break;
        case 'cancelado':
          await cancelarAgendamento(agendamento.id);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const formatDateSafe = (dateString: string | undefined | null, formatStr: string) => {
    if (!dateString) return 'Data não disponível';
    try {
      return format(parseISO(dateString), formatStr, { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatarDataCompleta = (dataHora: string) => {
    return formatDateSafe(dataHora, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm");
  };

  const calcularDuracao = () => {
    if (agendamento.servico?.duracao_minutos) {
      const horas = Math.floor(agendamento.servico.duracao_minutos / 60);
      const minutos = agendamento.servico.duracao_minutos % 60;

      if (horas > 0) {
        return `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`;
      }
      return `${minutos}min`;
    }
    return 'Não informado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-mobile sm:modal-desktop max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="spacing-mobile sm:spacing-desktop">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-responsive-lg text-xl font-semibold">
              Detalhes do Agendamento
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`${statusInfo?.color} border px-3 py-1`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusInfo?.label}
              </Badge>
              <span className="text-sm text-white/60">
                {statusInfo?.description}
              </span>
            </div>

            {onEdit && agendamento.status !== 'cancelado' && (
              <Button variant="outline" size="sm" onClick={() => onEdit(agendamento)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>

          <Separator />

          {/* Informações do Paciente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações do Paciente
            </h3>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 space-y-3">
              {agendamento.paciente ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/50">Nome</label>
                    <p className="text-white font-medium">{agendamento.paciente.nome}</p>
                  </div>

                  {agendamento.paciente.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{agendamento.paciente.email}</p>
                      </div>
                    </div>
                  )}

                  {agendamento.paciente.telefone && (
                    <div>
                      <label className="text-sm font-medium text-white/50">Telefone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-white/40" />
                        <p className="text-white">{agendamento.paciente.telefone}</p>
                      </div>
                    </div>
                  )}

                  {agendamento.paciente.data_nascimento && (
                    <div>
                      <label className="text-sm font-medium text-white/50">Data de Nascimento</label>
                      <p className="text-white">
                        {formatDateSafe(agendamento.paciente.data_nascimento, 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/60">Informações do paciente não disponíveis</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações do Agendamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informações do Agendamento
            </h3>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/50">Data e Hora</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white/40" />
                    <p className="text-white capitalize">
                      {formatarDataCompleta(agendamento.data_hora)}
                    </p>
                  </div>
                </div>

                {agendamento.servico ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-white/50">Serviço</label>
                      <p className="text-white">{agendamento.servico.nome}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white/50">Duração</label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-white/40" />
                        <p className="text-white">{calcularDuracao()}</p>
                      </div>
                    </div>

                    {agendamento.servico.preco && (
                      <div>
                        <label className="text-sm font-medium text-white/50">Valor</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-white/40" />
                          <p className="text-white">
                            R$ {agendamento.servico.preco.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-white/60">Informações do serviço não disponíveis</p>
                  </div>
                )}
              </div>

              {agendamento.servico?.descricao && (
                <div>
                  <label className="text-sm font-medium text-white/50">Descrição do Serviço</label>
                  <p className="text-white/70 text-sm">{agendamento.servico.descricao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {agendamento.observacoes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Observações
                </h3>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-white/80">{agendamento.observacoes}</p>
                </div>
              </div>
            </>
          )}

          {/* Ações */}
          {agendamento.status !== 'cancelado' && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Ações</h3>
                <div className="flex flex-wrap gap-2">
                  {agendamento.status === 'pendente' && (
                    <Button
                      onClick={() => handleStatusChange('confirmado')}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Agendamento
                    </Button>
                  )}

                  {agendamento.status === 'confirmado' && (
                    <Button
                      onClick={() => handleStatusChange('concluido')}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  )}

                  {agendamento.status !== 'concluido' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusChange('cancelado')}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Agendamento
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Informações de Auditoria */}
          <Separator />
          <div className="text-xs text-gray-500 space-y-1">
            <p>Criado em: {formatDateSafe(agendamento.created_at, 'dd/MM/yyyy HH:mm')}</p>
            {agendamento.updated_at !== agendamento.created_at && (
              <p>Última atualização: {formatDateSafe(agendamento.updated_at, 'dd/MM/yyyy HH:mm')}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAgendamento;