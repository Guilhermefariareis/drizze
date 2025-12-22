import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Phone, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Agendamento {
  id: string;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes: string | null;
  valor: number | null;
  tipo_consulta: string;
  codigo_confirmacao: string | null;
  clinics: {
    name: string;
    phone: string | null;
    address: string | null;
  } | null;
}

const MeusAgendamentos = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAgendamentos();
    }
  }, [user]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 [MeusAgendamentos] Buscando agendamentos para usuário:', user?.id);
      
      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        toast.error('Erro ao carregar dados do perfil');
        return;
      }
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          observacoes,
          valor,
          tipo_consulta,
          codigo_confirmacao,
          clinics (
            name,
            phone,
            address
          )
        `)
        .eq('paciente_id', profile.id)
        .order('data_hora', { ascending: false });
        
      console.log('🔍 [MeusAgendamentos] Resultado da query:', { data, error, userID: user?.id });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        toast.error('Erro ao carregar agendamentos');
        return;
      }

      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAgendamento = async (agendamentoId: string) => {
    try {
      setCancellingId(agendamentoId);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', agendamentoId);

      if (error) {
        console.error('Erro ao cancelar agendamento:', error);
        toast.error('Erro ao cancelar agendamento');
        return;
      }

      toast.success('Agendamento cancelado com sucesso');
      fetchAgendamentos(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      confirmado: { label: 'Confirmado', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
      concluido: { label: 'Concluído', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canCancelAgendamento = (status: string, dataHora: string) => {
    const agendamentoDate = new Date(dataHora);
    const now = new Date();
    return (status === 'pendente' || status === 'confirmado') && agendamentoDate > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando seus agendamentos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h1>
            <p className="text-gray-600">Gerencie suas consultas agendadas</p>
          </div>

          {agendamentos.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não possui consultas agendadas.
                </p>
                <Button onClick={() => window.location.href = '/search'}>
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((agendamento) => {
                const { date, time } = formatDateTime(agendamento.data_hora);
                return (
                  <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {agendamento.clinics?.name || 'Clínica não informada'}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {agendamento.tipo_consulta.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                        {getStatusBadge(agendamento.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{time}</span>
                        </div>
                        {agendamento.clinics?.phone && (
                           <div className="flex items-center space-x-2">
                             <Phone className="h-4 w-4 text-blue-600" />
                             <span className="text-sm">{agendamento.clinics.phone}</span>
                           </div>
                         )}
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            {formatPrice(agendamento.valor)}
                          </span>
                        </div>
                      </div>

                      {agendamento.clinics?.address && (
                         <div className="flex items-start space-x-2">
                           <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                           <span className="text-sm text-gray-600">
                             {agendamento.clinics.address}
                           </span>
                         </div>
                       )}

                      {agendamento.observacoes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {agendamento.observacoes}
                          </p>
                        </div>
                      )}

                      {agendamento.codigo_confirmacao && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Código de Confirmação:</strong> {agendamento.codigo_confirmacao}
                          </p>
                        </div>
                      )}

                      {canCancelAgendamento(agendamento.status, agendamento.data_hora) && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAgendamento(agendamento.id)}
                            disabled={cancellingId === agendamento.id}
                          >
                            {cancellingId === agendamento.id ? 'Cancelando...' : 'Cancelar Agendamento'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MeusAgendamentos;