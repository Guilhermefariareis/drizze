import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Agendamento } from './useAgendamentos';

interface UseRealTimeAgendamentosProps {
  onAgendamentoCriado?: (agendamento: Agendamento) => void;
  onAgendamentoAtualizado?: (agendamento: Agendamento) => void;
  onAgendamentoDeletado?: (id: string) => void;
  enabled?: boolean;
}

export function useRealTimeAgendamentos({
  onAgendamentoCriado,
  onAgendamentoAtualizado,
  onAgendamentoDeletado,
  enabled = true
}: UseRealTimeAgendamentosProps = {}) {
  
  const handleInsert = useCallback((payload: any) => {
    const novoAgendamento = payload.new as Agendamento;
    
    // Mostrar notificação
    toast.success(`Novo agendamento criado para ${novoAgendamento.paciente?.nome || 'paciente'}`, {
      description: `${new Date(novoAgendamento.data_hora).toLocaleDateString('pt-BR')} às ${new Date(novoAgendamento.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    });
    
    // Chamar callback se fornecido
    onAgendamentoCriado?.(novoAgendamento);
  }, [onAgendamentoCriado]);
  
  const handleUpdate = useCallback((payload: any) => {
    const agendamentoAtualizado = payload.new as Agendamento;
    const agendamentoAnterior = payload.old as Agendamento;
    
    // Verificar se o status mudou para mostrar notificação apropriada
    if (agendamentoAnterior.status !== agendamentoAtualizado.status) {
      const statusMessages = {
        confirmado: 'Agendamento confirmado',
        cancelado: 'Agendamento cancelado',
        concluido: 'Agendamento concluído',
        no_show: 'Paciente não compareceu'
      };
      
      const message = statusMessages[agendamentoAtualizado.status as keyof typeof statusMessages];
      if (message) {
        toast.info(message, {
          description: `${agendamentoAtualizado.paciente?.nome || 'Paciente'} - ${new Date(agendamentoAtualizado.data_hora).toLocaleDateString('pt-BR')}`
        });
      }
    }
    
    // Chamar callback se fornecido
    onAgendamentoAtualizado?.(agendamentoAtualizado);
  }, [onAgendamentoAtualizado]);
  
  const handleDelete = useCallback((payload: any) => {
    const agendamentoDeletado = payload.old as Agendamento;
    
    toast.info('Agendamento removido', {
      description: `${agendamentoDeletado.paciente?.nome || 'Paciente'} - ${new Date(agendamentoDeletado.data_hora).toLocaleDateString('pt-BR')}`
    });
    
    // Chamar callback se fornecido
    onAgendamentoDeletado?.(agendamentoDeletado.id);
  }, [onAgendamentoDeletado]);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Subscription para mudanças na tabela de agendamentos
    const subscription = supabase
      .channel('agendamentos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agendamentos'
        },
        handleInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agendamentos'
        },
        handleUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'agendamentos'
        },
        handleDelete
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [enabled, handleInsert, handleUpdate, handleDelete]);
  
  return {
    // Função para desabilitar temporariamente as notificações
    disable: () => {},
    enable: () => {}
  };
}

export default useRealTimeAgendamentos;