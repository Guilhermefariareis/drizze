// Hooks de agendamentos
export { useAgendamentos } from './useAgendamentos';
export type { Agendamento, FiltrosAgendamento, UseAgendamentosReturn } from './useAgendamentos';

// Hooks de horários
export { useHorarios } from './useHorarios';
export type { 
  HorarioFuncionamento, 
  BloqueioHorario, 
  UseHorariosReturn 
} from './useHorarios';

// Hooks de notificações
export { 
  useNotificacoes, 
  useConfiguracaoNotificacoes,
  NotificacaoUtils 
} from './useNotificacoes';
export type { 
  Notificacao, 
  UseNotificacoesReturn,
  ConfiguracaoNotificacao,
  UseConfiguracaoNotificacoesReturn 
} from './useNotificacoes';

// Context de agendamentos
export { AgendamentoProvider, useAgendamentoContext } from '@/contexts/AgendamentoContext';
export type { 
  AgendamentoState, 
  AgendamentoActions, 
  AgendamentoContextType 
} from '../contexts/AgendamentoContext';

// Hooks de edição de valores de crédito
export { useEditValues } from './useEditValues';
export { useEditHistory } from './useEditHistory';