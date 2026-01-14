import { supabase } from '@/integrations/supabase/client';
import { addDays, subHours, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoInfo {
  id: string;
  paciente_id: string;
  profissional_id: string;
  clinica_id: string;
  data_hora: string;
  tipo_consulta: string;
  status: string;
  observacoes?: string;
}

interface ClinicaInfo {
  name: string;
  address?: string;
  phone?: string;
}

interface ProfissionalInfo {
  full_name: string;
  specialty?: string;
}

export class NotificacaoService {
  /**
   * Cria uma notificação de confirmação de agendamento
   */
  static async criarNotificacaoConfirmacao(
    agendamento: AgendamentoInfo,
    clinica: ClinicaInfo,
    profissional: ProfissionalInfo
  ) {
    const dataHora = new Date(agendamento.data_hora);
    const dataFormatada = format(dataHora, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
    const horarioFormatado = format(dataHora, 'HH:mm');

    const titulo = 'Agendamento Confirmado';
    const mensagem = `Seu agendamento com ${profissional.full_name} foi confirmado para ${dataFormatada} às ${horarioFormatado} na ${clinica.name}.`;

    return this.criarNotificacao(
      agendamento.paciente_id,
      agendamento.id,
      'confirmacao',
      titulo,
      mensagem
    );
  }

  /**
   * Cria uma notificação de lembrete de agendamento
   */
  static async criarNotificacaoLembrete(
    agendamento: AgendamentoInfo,
    clinica: ClinicaInfo,
    profissional: ProfissionalInfo,
    horasAntecedencia: number = 24
  ) {
    const dataHora = new Date(agendamento.data_hora);
    const dataFormatada = format(dataHora, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
    const horarioFormatado = format(dataHora, 'HH:mm');

    const titulo = `Lembrete: Consulta em ${horasAntecedencia}h`;
    const mensagem = `Não se esqueça! Você tem uma consulta agendada com ${profissional.full_name} amanhã (${dataFormatada}) às ${horarioFormatado} na ${clinica.name}.`;

    return this.criarNotificacao(
      agendamento.paciente_id,
      agendamento.id,
      'lembrete',
      titulo,
      mensagem
    );
  }

  /**
   * Cria uma notificação de cancelamento de agendamento
   */
  static async criarNotificacaoCancelamento(
    agendamento: AgendamentoInfo,
    clinica: ClinicaInfo,
    profissional: ProfissionalInfo,
    motivo?: string
  ) {
    const dataHora = new Date(agendamento.data_hora);
    const dataFormatada = format(dataHora, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
    const horarioFormatado = format(dataHora, 'HH:mm');

    const titulo = 'Agendamento Cancelado';
    let mensagem = `Seu agendamento com ${profissional.full_name} para ${dataFormatada} às ${horarioFormatado} foi cancelado.`;

    if (motivo) {
      mensagem += ` Motivo: ${motivo}`;
    }

    mensagem += ' Entre em contato conosco para reagendar.';

    return this.criarNotificacao(
      agendamento.paciente_id,
      agendamento.id,
      'cancelamento',
      titulo,
      mensagem
    );
  }

  /**
   * Cria uma notificação de reagendamento
   */
  static async criarNotificacaoReagendamento(
    agendamentoAntigo: AgendamentoInfo,
    agendamentoNovo: AgendamentoInfo,
    clinica: ClinicaInfo,
    profissional: ProfissionalInfo
  ) {
    const dataHoraAntiga = new Date(agendamentoAntigo.data_hora);
    const dataHoraNova = new Date(agendamentoNovo.data_hora);
    const dataAntigaFormatada = format(dataHoraAntiga, "dd 'de' MMMM", {
      locale: ptBR
    });
    const dataNovaFormatada = format(dataHoraNova, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
    const horarioAntigoFormatado = format(dataHoraAntiga, 'HH:mm');
    const horarioNovoFormatado = format(dataHoraNova, 'HH:mm');

    const titulo = 'Agendamento Reagendado';
    const mensagem = `Seu agendamento com ${profissional.full_name} foi reagendado de ${dataAntigaFormatada} às ${horarioAntigoFormatado} para ${dataNovaFormatada} às ${horarioNovoFormatado}.`;

    return this.criarNotificacao(
      agendamentoNovo.paciente_id,
      agendamentoNovo.id,
      'reagendamento',
      titulo,
      mensagem
    );
  }

  /**
   * Método base para criar notificações
   */
  private static async criarNotificacao(
    userId: string,
    agendamentoId: string,
    tipo: 'confirmacao' | 'lembrete' | 'cancelamento' | 'reagendamento',
    titulo: string,
    mensagem: string
  ) {
    try {
      // Default type mapping
      const notificationType = 'info';

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: titulo,
          message: mensagem,
          type: notificationType,
          is_read: false,
          metadata: {
            agendamento_id: agendamentoId,
            sub_type: tipo
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar notificação:', error);
        return { success: false, error };
      }

      console.log('Notificação criada com sucesso:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return { success: false, error };
    }
  }

  /**
   * Programa lembretes automáticos para agendamentos
   */
  static async programarLembretes(agendamentoId: string) {
    try {
      // Buscar informações do agendamento
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clinics!inner(
            name,
            address,
            phone
          ),
          clinic_professionals!inner(
            profiles!inner(
              full_name
            )
          )
        `)
        .eq('id', agendamentoId)
        .single();

      if (agendamentoError || !agendamento) {
        console.error('Erro ao buscar agendamento:', agendamentoError);
        return { success: false, error: agendamentoError };
      }

      const dataAgendamento = new Date(agendamento.data_hora);
      const agora = new Date();

      // Programar lembrete 24h antes (se ainda não passou)
      const lembrete24h = subHours(dataAgendamento, 24);
      if (lembrete24h > agora) {
        await this.criarNotificacaoLembrete(
          agendamento,
          agendamento.clinics,
          agendamento.clinic_professionals.profiles,
          24
        );
      }

      // Programar lembrete 2h antes (se ainda não passou)
      const lembrete2h = subHours(dataAgendamento, 2);
      if (lembrete2h > agora) {
        await this.criarNotificacaoLembrete(
          agendamento,
          agendamento.clinics,
          agendamento.clinic_professionals.profiles,
          2
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao programar lembretes:', error);
      return { success: false, error };
    }
  }

  /**
   * Busca agendamentos que precisam de lembretes
   */
  static async processarLembretesAutomaticos() {
    try {
      const agora = new Date();
      const em24h = addDays(agora, 1);
      const em2h = new Date(agora.getTime() + 2 * 60 * 60 * 1000);

      // Buscar agendamentos que precisam de lembrete 24h
      const { data: agendamentos24h } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clinics!inner(
            name,
            address,
            phone
          ),
          clinic_professionals!inner(
            profiles!inner(
              full_name
            )
          )
        `)
        .eq('status', 'confirmado')
        .gte('data_hora', em24h.toISOString().split('T')[0])
        .lt('data_hora', addDays(em24h, 1).toISOString().split('T')[0]);

      // Buscar agendamentos que precisam de lembrete 2h
      const { data: agendamentos2h } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clinics!inner(
            name,
            address,
            phone
          ),
          clinic_professionals!inner(
            profiles!inner(
              full_name
            )
          )
        `)
        .eq('status', 'confirmado')
        .gte('data_hora', agora.toISOString().split('T')[0])
        .lt('data_hora', addDays(agora, 1).toISOString().split('T')[0]);

      // Processar lembretes 24h
      if (agendamentos24h) {
        for (const agendamento of agendamentos24h) {
          await this.criarNotificacaoLembrete(
            agendamento,
            agendamento.clinics,
            agendamento.clinic_professionals.profiles,
            24
          );
        }
      }

      // Processar lembretes 2h
      if (agendamentos2h) {
        for (const agendamento of agendamentos2h) {
          const dataHoraAgendamento = new Date(agendamento.data_hora);
          const tempoRestante = dataHoraAgendamento.getTime() - agora.getTime();
          const horasRestantes = tempoRestante / (1000 * 60 * 60);

          // Enviar lembrete se faltam aproximadamente 2 horas
          if (horasRestantes <= 2.5 && horasRestantes >= 1.5) {
            await this.criarNotificacaoLembrete(
              agendamento,
              agendamento.clinics,
              agendamento.clinic_professionals.profiles,
              2
            );
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao processar lembretes automáticos:', error);
      return { success: false, error };
    }
  }
}