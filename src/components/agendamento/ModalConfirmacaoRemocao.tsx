import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
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

interface ModalConfirmacaoRemocaoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: AgendamentoDetalhes | null;
  onConfirmar: () => void;
  loading?: boolean;
}

const ModalConfirmacaoRemocao: React.FC<ModalConfirmacaoRemocaoProps> = ({
  isOpen,
  onClose,
  agendamento,
  onConfirmar,
  loading = false
}) => {
  if (!agendamento) return null;

  const dataFormatada = format(parseISO(agendamento.data_hora), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Remoção
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O agendamento será removido permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações do agendamento a ser removido */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Agendamento a ser removido:</h4>
            <div className="space-y-1 text-sm text-red-700">
              <p><strong>Paciente:</strong> {agendamento.paciente_nome}</p>
              <p><strong>Serviço:</strong> {agendamento.servico_nome}</p>
              <p><strong>Data/Hora:</strong> {dataFormatada}</p>
              {agendamento.valor && (
                <p><strong>Valor:</strong> R$ {agendamento.valor.toFixed(2).replace('.', ',')}</p>
              )}
            </div>
          </div>
          
          {/* Botões de confirmação */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={onConfirmar}
              variant="destructive"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Remoção
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalConfirmacaoRemocao;