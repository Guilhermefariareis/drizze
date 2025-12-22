import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  CreditCard, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Eye,
  Upload,
  DollarSign,
  Calendar,
  Building2,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationSystem from '../../components/NotificationSystem';

interface CreditRequest {
  id: string;
  clinic_id: string;
  amount: number;
  installments: number;
  treatment_description: string;
  status: 'pending' | 'clinic_reviewing' | 'sent_to_admin' | 'admin_analyzing' | 'approved' | 'rejected' | 'cancelled' | 'awaiting_documents' | 'admin_approved' | 'admin_rejected' | 'sent_to_patient' | 'patient_accepted' | 'patient_rejected';
  created_at: string;
  updated_at: string;
  clinics: {
    name: string;
    address: string;
  };
}

interface CreditOffer {
  id: string;
  credit_request_id: string;
  bank_name: string;
  approved_amount: number;
  interest_rate: number;
  installments: number;
  conditions: string;
  monthly_payment: number | null;
  total_amount: number | null;
  created_at: string;
}

interface CreditDocument {
  id: string;
  credit_request_id: string;
  document_type: string;
  file_name: string;
  uploaded_at: string;
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalApprovedAmount: number;
  documentsUploaded: number;
}

const PatientDashboard: React.FC = () => {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [creditOffers, setCreditOffers] = useState<{ [key: string]: CreditOffer[] }>({});
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalApprovedAmount: 0,
    documentsUploaded: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // TODO: Substituir por ID do usuário logado
  const currentPatientId = 'current-patient-id';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar solicitações de crédito
      const { data: requests, error: requestsError } = await supabase
        .from('credit_requests')
        .select(`
          id,
          clinic_id,
          amount,
          installments,
          treatment_description,
          status,
          created_at,
          updated_at,
          clinics (
            name,
            address
          )
        `)
        .eq('patient_id', currentPatientId)
        .order('created_at', { ascending: false });

      if (requestsError) {
        throw requestsError;
      }

      setCreditRequests(requests || []);

      // Buscar documentos
      const { data: documents, error: documentsError } = await supabase
        .from('credit_documents')
        .select('id, credit_request_id')
        .in('credit_request_id', (requests || []).map(r => r.id));

      if (documentsError) {
        throw documentsError;
      }

      // Buscar ofertas de crédito para solicitações com status 'sent_to_patient'
      const requestsWithOffers = requests?.filter(r => r.status === 'sent_to_patient') || [];
      if (requestsWithOffers.length > 0) {
        const { data: offers, error: offersError } = await supabase
          .from('credit_offers')
          .select('*')
          .in('credit_request_id', requestsWithOffers.map(r => r.id));

        if (offersError) {
          console.error('Erro ao buscar ofertas:', offersError);
        } else {
          // Organizar ofertas por request_id
          const offersMap: { [key: string]: CreditOffer[] } = {};
          offers?.forEach(offer => {
            if (!offersMap[offer.credit_request_id]) {
              offersMap[offer.credit_request_id] = [];
            }
            offersMap[offer.credit_request_id].push(offer);
          });
          setCreditOffers(offersMap);
        }
      }

      // Calcular estatísticas
      const totalRequests = requests?.length || 0;
      const pendingRequests = requests?.filter(r => r.status === 'pending' || r.status === 'clinic_approved' || r.status === 'admin_analyzing').length || 0;
      const approvedRequests = requests?.filter(r => r.status === 'admin_approved').length || 0;
      const rejectedRequests = requests?.filter(r => r.status === 'clinic_rejected' || r.status === 'admin_rejected').length || 0;
      const totalApprovedAmount = requests?.filter(r => r.status === 'admin_approved').reduce((sum, r) => sum + r.requested_amount, 0) || 0;
      const documentsUploaded = documents?.length || 0;

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalApprovedAmount,
        documentsUploaded
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Função para aceitar uma oferta
  const acceptOffer = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'patient_accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Erro ao aceitar oferta:', error);
        toast.error('Erro ao aceitar oferta');
        return;
      }

      toast.success('Oferta aceita com sucesso!');
      await fetchDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao aceitar oferta:', error);
      toast.error('Erro ao aceitar oferta');
    }
  };

  // Função para rejeitar uma oferta
  const rejectOffer = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'patient_rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Erro ao rejeitar oferta:', error);
        toast.error('Erro ao rejeitar oferta');
        return;
      }

      toast.success('Oferta rejeitada');
      await fetchDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao rejeitar oferta:', error);
      toast.error('Erro ao rejeitar oferta');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Pendente', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      clinic_approved: { 
        label: 'Aprovado pela Clínica', 
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle
      },
      clinic_rejected: { 
        label: 'Rejeitado pela Clínica', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      admin_analyzing: { 
        label: 'Em Análise', 
        color: 'bg-purple-100 text-purple-800',
        icon: AlertCircle
      },
      admin_approved: { 
        label: 'Aprovado', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      admin_rejected: { 
        label: 'Rejeitado', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      sent_to_patient: { 
        label: 'Ofertas Disponíveis', 
        color: 'bg-purple-100 text-purple-800',
        icon: CreditCard
      },
      patient_accepted: { 
        label: 'Aceito por Você', 
        color: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle
      },
      patient_rejected: { 
        label: 'Rejeitado por Você', 
        color: 'bg-orange-100 text-orange-800',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusDescription = (status: string) => {
    const descriptions = {
      pending: 'Sua solicitação está aguardando análise da clínica.',
      clinic_approved: 'A clínica aprovou sua solicitação. Aguardando análise final do administrador.',
      clinic_rejected: 'Sua solicitação foi rejeitada pela clínica. Entre em contato para mais informações.',
      admin_analyzing: 'Sua solicitação está em análise final pelo administrador.',
      admin_approved: 'Parabéns! Sua solicitação foi aprovada. O pagamento será processado em breve.',
      admin_rejected: 'Sua solicitação foi rejeitada na análise final. Entre em contato para mais informações.',
      sent_to_patient: 'Você tem ofertas de crédito disponíveis! Analise as opções abaixo e escolha a melhor para você.',
      patient_accepted: 'Você aceitou uma oferta de crédito. A clínica entrará em contato para finalizar o processo.',
      patient_rejected: 'Você rejeitou as ofertas disponíveis. A clínica foi notificada da sua decisão.'
    };

    return descriptions[status as keyof typeof descriptions] || 'Status desconhecido.';
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Dashboard</h1>
          <p className="text-gray-600">Acompanhe suas solicitações de crédito e documentos</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationSystem userId={currentPatientId} userType="patient" />
          <Button onClick={() => navigate('/patient/credit-request')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedRequests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Aprovado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalApprovedAmount)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/patient/credit-request')}
            >
              <Plus className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Nova Solicitação</span>
              <span className="text-sm text-gray-500">Solicitar novo crédito</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/patient/documents')}
            >
              <Upload className="w-6 h-6 text-green-600" />
              <span className="font-medium">Enviar Documentos</span>
              <span className="text-sm text-gray-500">Upload de documentos</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/credit-simulator')}
            >
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Simular Crédito</span>
              <span className="text-sm text-gray-500">Calcular parcelas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Minhas Solicitações ({creditRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditRequests.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-500 mb-6">Faça sua primeira solicitação de crédito para começar.</p>
              <Button onClick={() => navigate('/patient/credit-request')}>
                <Plus className="w-4 h-4 mr-2" />
                Fazer Primeira Solicitação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {creditRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatCurrency(request.requested_amount)} em {request.installments}x
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{request.clinics.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{request.treatment_description}</p>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          {getStatusDescription(request.status)}
                        </p>
                      </div>

                      {/* Seção de Ofertas - Exibir apenas quando status = 'sent_to_patient' */}
                      {request.status === 'sent_to_patient' && creditOffers[request.id] && creditOffers[request.id].length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            Ofertas Disponíveis
                          </h4>
                          
                          {creditOffers[request.id].map((offer) => (
                            <div key={offer.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="w-5 h-5 text-purple-600" />
                                  <span className="font-semibold text-purple-900">{offer.bank_name}</span>
                                </div>
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  Aprovado
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-purple-600">Valor Aprovado:</span>
                                  <p className="font-medium text-purple-900">
                                    {formatCurrency(offer.approved_amount || 0)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-purple-600">Taxa de Juros:</span>
                                  <p className="font-medium text-purple-900">{offer.interest_rate || 0}% a.m.</p>
                                </div>
                                <div>
                                  <span className="text-purple-600">Parcelas:</span>
                                  <p className="font-medium text-purple-900">{offer.installments}x</p>
                                </div>
                                <div>
                                  <span className="text-purple-600">Valor da Parcela:</span>
                                  <p className="font-medium text-purple-900">
                                    {formatCurrency(offer.monthly_payment || 0)}
                                  </p>
                                </div>
                              </div>
                              
                              {offer.conditions && (
                                <div className="mb-3 p-2 bg-white rounded border">
                                  <span className="text-purple-600 text-xs font-medium">Condições:</span>
                                  <p className="text-xs text-gray-600 mt-1">{offer.conditions}</p>
                                </div>
                              )}
                              
                              <div className="flex space-x-2">
                                <Button 
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  size="sm"
                                  onClick={() => acceptOffer(request.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aceitar Oferta
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                                  size="sm"
                                  onClick={() => rejectOffer(request.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Última atualização: {formatDate(request.updated_at)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patient/documents?request=${request.id}`)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Documentos
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implementar página de detalhes da solicitação
                          toast.info('Página de detalhes em desenvolvimento');
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;