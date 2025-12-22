import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, Mail, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoInfo {
  id: string;
  codigo_confirmacao: string;
  data_hora: string;
  status: string;
  observacoes: string;
  clinica: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  profissional: {
    name: string;
    specialty: string;
  };
  paciente: {
    name: string;
    email: string;
    phone: string;
  };
}

const AgendamentoConfirmacao: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [agendamento, setAgendamento] = useState<AgendamentoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agendamentoId = searchParams.get('id');
    if (agendamentoId) {
      carregarAgendamento(agendamentoId);
    } else {
      navigate('/agendamento');
    }
  }, [searchParams, navigate]);

  const carregarAgendamento = async (agendamentoId: string) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          codigo_confirmacao,
          data_hora,
          status,
          observacoes,
          clinics:clinica_id (
            name,
            address,
            phone,
            email
          ),
          professionals:profissional_id (
            name,
            specialty
          ),
          profiles:paciente_id (
            full_name,
            email,
            phone
          )
        `)
        .eq('id', agendamentoId)
        .single();

      if (error) throw error;

      setAgendamento({
        id: data.id,
        codigo_confirmacao: data.codigo_confirmacao,
        data_hora: data.data_hora,
        status: data.status,
        observacoes: data.observacoes,
        clinica: data.clinics,
        profissional: data.professionals,
        paciente: {
          name: data.profiles.full_name,
          email: data.profiles.email,
          phone: data.profiles.phone
        }
      });
    } catch (error) {
      console.error('Erro ao carregar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do agendamento.',
        variant: 'destructive'
      });
      navigate('/agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCompartilhar = async () => {
    if (!agendamento) return;

    const texto = `Agendamento confirmado!\n\nCódigo: ${agendamento.codigo_confirmacao}\nClínica: ${agendamento.clinica.name}\nProfissional: ${agendamento.profissional.name}\nData: ${format(new Date(agendamento.data_hora), 'dd/MM/yyyy', { locale: ptBR })}\nHorário: ${format(new Date(agendamento.data_hora), 'HH:mm', { locale: ptBR })}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Agendamento Confirmado',
          text: texto
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para copiar para clipboard
      try {
        await navigator.clipboard.writeText(texto);
        toast({
          title: 'Copiado!',
          description: 'Informações do agendamento copiadas para a área de transferência.'
        });
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-green-100 text-green-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'confirmado':
        return 'Confirmado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando confirmação...</p>
        </div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Agendamento não encontrado.</p>
          <Button onClick={() => navigate('/agendamento')}>Fazer novo agendamento</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h1>
            <p className="text-gray-600">Seu agendamento foi realizado com sucesso.</p>
          </div>

          {/* Confirmation Code */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Código de Confirmação</p>
                <p className="text-2xl font-bold text-blue-600 tracking-wider">
                  {agendamento.codigo_confirmacao}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Guarde este código para futuras consultas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalhes do Agendamento</span>
                <Badge className={getStatusColor(agendamento.status)}>
                  {getStatusText(agendamento.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {format(new Date(agendamento.data_hora), 'EEEE, dd \\de MMMM \\de yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(agendamento.data_hora), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Clinic */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{agendamento.clinica.name}</p>
                  <p className="text-sm text-gray-600">{agendamento.clinica.address}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {agendamento.clinica.phone}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {agendamento.clinica.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{agendamento.profissional.name}</p>
                  <p className="text-sm text-gray-600">{agendamento.profissional.specialty}</p>
                </div>
              </div>

              {/* Notes */}
              {agendamento.observacoes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                  <p className="text-sm text-gray-600">{agendamento.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Chegue com 15 minutos de antecedência</li>
                <li>• Traga um documento com foto</li>
                <li>• Em caso de cancelamento, avise com pelo menos 24h de antecedência</li>
                <li>• Para reagendar, entre em contato com a clínica</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleCompartilhar}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            
            <Button
              onClick={() => navigate('/patient/appointments')}
              className="flex-1"
            >
              Ver Meus Agendamentos
            </Button>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoConfirmacao;