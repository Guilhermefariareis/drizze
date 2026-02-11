import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { NotificacaoService } from '@/services/notificacaoService';
import { toast } from 'sonner';
import {
  SeletorProfissionais,
  CalendarioAgendamento,
  SeletorHorarios,
  ResumoAgendamento
} from '@/components/agendamento';

interface ClinicaInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface ProfissionalInfo {
  id: string;
  name: string;
  specialty: string;
}

interface AgendamentoData {
  clinicaId: string;
  profissionalId: string;
  data: string;
  horario: string;
  observacoes: string;
}

const AgendamentoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { criarAgendamento } = useAgendamentos();

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [clinicaInfo, setClinicaInfo] = useState<ClinicaInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const [dadosAgendamento, setDadosAgendamento] = useState({
    clinicaId: '',
    profissionalId: '',
    data: '',
    horario: ''
  });

  const [perfilPaciente, setPerfilPaciente] = useState<{
    nome: string;
    email: string;
    telefone: string;
  } | null>(null);

  useEffect(() => {
    const clinicaId = searchParams.get('clinica');
    if (clinicaId) {
      setDadosAgendamento(prev => ({ ...prev, clinicaId }));
      carregarDadosClinica(clinicaId);
    }

    if (user) {
      const carregarPerfil = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setPerfilPaciente({
            nome: data.full_name || '',
            email: data.email || user.email || '',
            telefone: data.phone || ''
          });
        }
      };
      carregarPerfil();
    }
  }, [searchParams, user]);

  const carregarDadosClinica = async (clinicaId: string) => {
    setLoading(true);
    try {
      // Carregar informações da clínica
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicaId)
        .single();

      if (clinicaError) throw clinicaError;

      setClinicaInfo({
        id: clinica.id,
        name: clinica.name || 'Nome não informado',
        address: clinica.address || 'Endereço não informado',
        phone: clinica.phone || 'Telefone não informado',
        email: clinica.email || 'Email não informado'
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar informações da clínica.');
    } finally {
      setLoading(false);
    }
  };

  const proximaEtapa = () => {
    if (etapaAtual < 4) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  // Callbacks para os componentes
  const handleProfissionalSelecionado = (profissionalId: string) => {
    setDadosAgendamento(prev => ({ ...prev, profissionalId }));
  };

  const handleDataSelecionada = (data: string) => {
    setDadosAgendamento(prev => ({ ...prev, data, horario: '' })); // Reset horário ao mudar data
  };

  const handleHorarioSelecionado = (horario: string) => {
    setDadosAgendamento(prev => ({ ...prev, horario }));
  };

  const confirmarAgendamento = async () => {
    if (!user || !dadosAgendamento.clinicaId || !dadosAgendamento.profissionalId || !dadosAgendamento.data || !dadosAgendamento.horario) {
      toast.error('Dados incompletos para confirmar o agendamento');
      return;
    }

    setLoading(true);
    try {
      // Usar a mesma estrutura de dados que funciona na clínica
      const agendamentoData = {
        paciente_id: user.id,
        clinica_id: dadosAgendamento.clinicaId,
        servico_id: 'default-service',
        profissional_id: dadosAgendamento.profissionalId,
        data_hora: `${dadosAgendamento.data}T${dadosAgendamento.horario}:00`,
        status: 'confirmado' as const,
        observacoes: '',
        valor: 0,
        // Incluir dados do paciente para sincronização com a agenda da clínica
        nome_paciente: perfilPaciente?.nome || user.user_metadata?.full_name || '',
        email_paciente: perfilPaciente?.email || user.email || '',
        telefone_paciente: perfilPaciente?.telefone || '',
        tipo_agendamento: 'paciente',
        tipo_consulta: 'paciente'
      };

      // Usar o mesmo hook que funciona na clínica
      const novoAgendamento = await criarAgendamento(agendamentoData);

      if (!novoAgendamento) {
        toast.error('Erro ao confirmar agendamento');
        return;
      }

      // Criar notificação de confirmação
      try {
        await NotificacaoService.criarNotificacaoConfirmacao(
          novoAgendamento,
          clinicaInfo!,
          { full_name: 'Profissional' }
        );

        // Programar lembretes automáticos
        await NotificacaoService.programarLembretes(novoAgendamento.id);
      } catch (notifError) {
        console.error('Erro ao criar notificações:', notifError);
        // Não bloquear o fluxo se houver erro nas notificações
      }

      toast.success('Agendamento confirmado com sucesso!');
      navigate(`/agendamento/confirmacao/${novoAgendamento.id}`);
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast.error('Erro ao confirmar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <SeletorProfissionais
            clinicaId={dadosAgendamento.clinicaId}
            profissionalSelecionado={dadosAgendamento.profissionalId}
            onProfissionalSelecionado={handleProfissionalSelecionado}
          />
        );

      case 2:
        return (
          <CalendarioAgendamento
            clinicaId={dadosAgendamento.clinicaId}
            profissionalId={dadosAgendamento.profissionalId}
            dataSelecionada={dadosAgendamento.data}
            onDataSelecionada={handleDataSelecionada}
          />
        );

      case 3:
        return (
          <SeletorHorarios
            clinicaId={dadosAgendamento.clinicaId}
            profissionalId={dadosAgendamento.profissionalId}
            dataSelecionada={dadosAgendamento.data}
            horarioSelecionado={dadosAgendamento.horario}
            onHorarioSelecionado={handleHorarioSelecionado}
          />
        );

      case 4:
        return (
          <ResumoAgendamento
            clinicaId={dadosAgendamento.clinicaId}
            profissionalId={dadosAgendamento.profissionalId}
            dataSelecionada={dadosAgendamento.data}
            horarioSelecionado={dadosAgendamento.horario}
            onConfirmar={confirmarAgendamento}
            onVoltar={etapaAnterior}
            loading={loading}
            perfilPaciente={perfilPaciente}
          />
        );

      default:
        return null;
    }
  };

  const podeAvancar = () => {
    switch (etapaAtual) {
      case 1:
        return dadosAgendamento.profissionalId !== '';
      case 2:
        return dadosAgendamento.data !== '';
      case 3:
        return dadosAgendamento.horario !== '';
      default:
        return false;
    }
  };

  const getProgressoPercentual = () => {
    return (etapaAtual / 4) * 100;
  };

  const getTituloEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return 'Selecionar Profissional';
      case 2:
        return 'Escolher Data';
      case 3:
        return 'Escolher Horário';
      case 4:
        return 'Confirmar Agendamento';
      default:
        return 'Agendamento';
    }
  };

  if (!clinicaInfo) {
    return (
      <div className="w-full px-6 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <p>Carregando informações da clínica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            Agendar Consulta
          </h1>
          <p className="text-white/70">
            {clinicaInfo.name}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/90">
              Etapa {etapaAtual} de 4 - {getTituloEtapa()}
            </span>
            <span className="text-sm text-white/50">
              {Math.round(getProgressoPercentual())}% concluído
            </span>
          </div>
          <Progress value={getProgressoPercentual()} className="h-2" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {etapaAtual === 1 && (
            <SeletorProfissionais
              clinicaId={dadosAgendamento.clinicaId}
              profissionalSelecionado={dadosAgendamento.profissionalId}
              onProfissionalSelecionado={handleProfissionalSelecionado}
            />
          )}

          {etapaAtual === 2 && (
            <CalendarioAgendamento
              clinicaId={dadosAgendamento.clinicaId}
              profissionalId={dadosAgendamento.profissionalId}
              dataSelecionada={dadosAgendamento.data}
              onDataSelecionada={handleDataSelecionada}
            />
          )}

          {etapaAtual === 3 && (
            <SeletorHorarios
              clinicaId={dadosAgendamento.clinicaId}
              profissionalId={dadosAgendamento.profissionalId}
              dataSelecionada={dadosAgendamento.data}
              horarioSelecionado={dadosAgendamento.horario}
              onHorarioSelecionado={handleHorarioSelecionado}
            />
          )}

          {etapaAtual === 4 && (
            <ResumoAgendamento
              clinicaId={dadosAgendamento.clinicaId}
              profissionalId={dadosAgendamento.profissionalId}
              dataSelecionada={dadosAgendamento.data}
              horarioSelecionado={dadosAgendamento.horario}
              onConfirmar={confirmarAgendamento}
              onVoltar={etapaAnterior}
              loading={loading}
              perfilPaciente={perfilPaciente}
            />
          )}
        </div>

        {/* Navigation */}
        {etapaAtual < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={etapaAnterior}
              disabled={etapaAtual === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={proximaEtapa}
              disabled={!podeAvancar()}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamentoPage;