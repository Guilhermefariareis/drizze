import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, Clock, User, FileText, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoDetalhes {
  id: string;
  status: string;
  paciente_nome: string;
  servico_nome: string;
  valor?: number;
  data_hora: string;
  observacoes?: string;
}

interface ModalAcoesAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: AgendamentoDetalhes | null;
  onEditar: (agendamento: AgendamentoDetalhes) => void;
  onRemover: (agendamento: AgendamentoDetalhes) => void;
}

const ModalAcoesAgendamento: React.FC<ModalAcoesAgendamentoProps> = ({
  isOpen,
  onClose,
  agendamento,
  onEditar,
  onRemover
}) => {
  if (!agendamento) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-500';
      case 'confirmado':
        return 'bg-emerald-500';
      case 'cancelado':
        return 'bg-red-500';
      case 'concluido':
        return 'bg-violet-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'confirmado':
        return 'Confirmado';
      case 'cancelado':
        return 'Cancelado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  const dataFormatada = format(parseISO(agendamento.data_hora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const horaFormatada = format(parseISO(agendamento.data_hora), 'HH:mm', { locale: ptBR });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription>
            Escolha uma ação para este agendamento
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações do agendamento */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{agendamento.paciente_nome}</span>
              </div>
              <Badge className={`${getStatusColor(agendamento.status)} text-white`}>
                {getStatusLabel(agendamento.status)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>{agendamento.servico_nome}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{dataFormatada}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{horaFormatada}</span>
            </div>
            
            {agendamento.valor && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>R$ {agendamento.valor.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            
            {agendamento.observacoes && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Observações:</strong> {agendamento.observacoes}
                </p>
              </div>
            )}
          </div>
          
          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                onEditar(agendamento);
                onClose();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <Button
              onClick={() => {
                onRemover(agendamento);
                onClose();
              }}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAcoesAgendamento;