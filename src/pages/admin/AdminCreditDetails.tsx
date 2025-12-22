import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { 
  ArrowLeft, 
  User, 
  Building, 
  DollarSign, 
  Calendar, 
  FileText, 
  Download,
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  status: 'pending' | 'clinic_approved' | 'clinic_rejected' | 'admin_approved' | 'admin_rejected' | 'admin_analyzing';
  created_at: string;
  updated_at: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_cpf: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    marital_status: string;
    birth_date: string;
    profession: string;
    monthly_income: number;
    address: any;
    bank_name: string;
    bank_code: string;
    bank_agency: string;
    bank_account: string;
    bank_account_type: string;
  };
  clinics: {
    name: string;
    email: string;
    phone: string;
    cnpj: string;
    address: string;
  };
}

interface CreditDocument {
  id: string;
  credit_request_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface CreditAnalysis {
  id: string;
  credit_request_id: string;
  analyst_id: string;
  analysis_type: 'clinic' | 'admin';
  decision: 'approved' | 'rejected' | 'pending';
  comments: string;
  created_at: string;
}

const AdminCreditDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [creditRequest, setCreditRequest] = useState<CreditRequest | null>(null);
  const [documents, setDocuments] = useState<CreditDocument[]>([]);
  const [analyses, setAnalyses] = useState<CreditAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisComments, setAnalysisComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchCreditDetails();
    }
  }, [requestId]);

  const fetchCreditDetails = async () => {
    try {
      setLoading(true);

      // Buscar detalhes da solicitação primeiro
      const { data: requestData, error: requestError } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Erro ao buscar credit_request:', requestError);
        throw requestError;
      }

      // Buscar dados do perfil separadamente se patient_id existir
      let profileData = null;
      if (requestData.patient_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            full_name,
            email,
            phone,
            cpf,
            rg,
            marital_status,
            birth_date,
            profession,
            monthly_income,
            address,
            bank_name,
            bank_code,
            bank_agency,
            bank_account,
            bank_account_type
          `)
          .eq('id', requestData.patient_id)
          .single();

        if (profileError) {
          console.warn('Erro ao buscar perfil do paciente:', profileError);
        } else {
          profileData = profile;
        }
      }

      // Buscar dados da clínica separadamente
      let clinicData = null;
      if (requestData.clinic_id) {
        const { data: clinic, error: clinicError } = await supabase
          .from('clinics')
          .select(`
            name,
            email,
            phone,
            cnpj,
            address
          `)
          .eq('id', requestData.clinic_id)
          .single();

        if (clinicError) {
          console.warn('Erro ao buscar dados da clínica:', clinicError);
        } else {
          clinicData = clinic;
        }
      }

      // Combinar os dados
      const combinedData = {
        ...requestData,
        profiles: profileData,
        clinics: clinicData
      };

      setCreditRequest(combinedData);

      // Buscar documentos (com tratamento de erro para tabela inexistente)
      try {
        const { data: documentsData, error: documentsError } = await supabase
          .from('credit_documents')
          .select('*')
          .eq('credit_request_id', requestId)
          .order('uploaded_at', { ascending: false });

        if (documentsError) {
          console.warn('Erro ao buscar documentos:', documentsError);
          setDocuments([]);
        } else {
          setDocuments(documentsData || []);
        }
      } catch (documentsError) {
        console.warn('Erro ao buscar documentos (tabela pode não existir):', documentsError);
        setDocuments([]);
      }

      // Buscar análises (com tratamento de erro para tabela inexistente)
      try {
        const { data: analysesData, error: analysesError } = await supabase
          .from('credit_analysis')
          .select('*')
          .eq('credit_request_id', requestId)
          .order('created_at', { ascending: false });

        if (analysesError) {
          console.warn('Erro ao buscar análises:', analysesError);
          setAnalyses([]);
        } else {
          setAnalyses(analysesData || []);
        }
      } catch (analysesError) {
        console.warn('Erro ao buscar análises (tabela pode não existir):', analysesError);
        setAnalyses([]);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da solicitação:', error);
      console.error('Request ID:', requestId);
      
      // Mostrar erro mais específico
      if (error?.message) {
        toast.error(`Erro ao carregar detalhes: ${error.message}`);
      } else {
        toast.error('Erro ao carregar detalhes da solicitação');
      }
      
      // Não navegar automaticamente, deixar o usuário tentar novamente
      // navigate('/admin/credit-management');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'admin_approved' | 'admin_rejected' | 'admin_analyzing') => {
    if ((newStatus === 'admin_approved' || newStatus === 'admin_rejected') && !analysisComments.trim()) {
      toast.error('Por favor, adicione comentários sobre sua análise');
      return;
    }

    try {
      setSubmitting(true);

      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('credit_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      // Criar registro de análise se for aprovação ou rejeição
      if (newStatus === 'admin_approved' || newStatus === 'admin_rejected') {
        const { error: analysisError } = await supabase
          .from('credit_analysis')
          .insert({
            credit_request_id: requestId,
            analyst_id: 'current-admin-user-id', // TODO: Substituir pelo ID do usuário logado
            analysis_type: 'admin',
            decision: newStatus === 'admin_approved' ? 'approved' : 'rejected',
            comments: analysisComments
          });

        if (analysisError) {
          throw analysisError;
        }
      }

      // Criar notificação para o paciente
      if (creditRequest) {
        let title = '';
        let message = '';

        switch (newStatus) {
          case 'admin_approved':
            title = 'Crédito Aprovado!';
            message = 'Sua solicitação de crédito foi aprovada! Em breve você receberá as instruções para pagamento.';
            break;
          case 'admin_rejected':
            title = 'Crédito Rejeitado';
            message = `Sua solicitação de crédito foi rejeitada. Motivo: ${analysisComments}`;
            break;
          case 'admin_analyzing':
            title = 'Solicitação em Análise';
            message = 'Sua solicitação de crédito está sendo analisada pela equipe administrativa.';
            break;
        }

        await supabase
          .from('notifications')
          .insert({
            user_id: creditRequest.patient_id,
            title,
            message,
            type: 'credit_update',
            read: false
          });
      }

      toast.success(`Solicitação ${newStatus === 'admin_approved' ? 'aprovada' : newStatus === 'admin_rejected' ? 'rejeitada' : 'colocada em análise'} com sucesso!`);
      setShowAnalysisForm(false);
      setAnalysisComments('');
      fetchCreditDetails();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      clinic_approved: { label: 'Aprovado pela Clínica', variant: 'secondary' as const, icon: CheckCircle },
      clinic_rejected: { label: 'Rejeitado pela Clínica', variant: 'destructive' as const, icon: XCircle },
      admin_analyzing: { label: 'Em Análise', variant: 'secondary' as const, icon: AlertCircle },
      admin_approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      admin_rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'identity': 'Documento de Identidade',
      'income_proof': 'Comprovante de Renda',
      'address_proof': 'Comprovante de Endereço',
      'medical_report': 'Relatório Médico',
      'treatment_plan': 'Plano de Tratamento',
      'other': 'Outros'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!creditRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar solicitação</h1>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar os detalhes da solicitação. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchCreditDetails} disabled={loading}>
              {loading ? 'Carregando...' : 'Tentar Novamente'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/credit-management')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Gerenciamento
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/credit-management')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Gerenciamento
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Detalhes da Solicitação de Crédito
            </h1>
            <p className="text-gray-600">ID: {creditRequest.id}</p>
          </div>
          {getStatusBadge(creditRequest.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Solicitação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Informações da Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Valor Solicitado</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {creditRequest.requested_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Número de Parcelas</p>
                  <p className="text-2xl font-bold">{creditRequest.installments}x</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Valor da Parcela</p>
                  <p className="text-xl font-semibold">
                    R$ {(creditRequest.requested_amount / creditRequest.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Data da Solicitação</p>
                  <p className="text-lg">
                    {new Date(creditRequest.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Descrição do Tratamento</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{creditRequest.treatment_description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                  <p className="text-lg">{creditRequest.profiles?.full_name || creditRequest.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">CPF</p>
                  <p className="text-lg">{creditRequest.profiles?.cpf || creditRequest.patient_cpf || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">RG</p>
                  <p className="text-lg">{creditRequest.profiles?.rg || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Data de Nascimento</p>
                  <p className="text-lg">
                    {creditRequest.profiles?.birth_date 
                      ? new Date(creditRequest.profiles.birth_date).toLocaleDateString('pt-BR')
                      : 'Não informado'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado Civil</p>
                  <p className="text-lg">
                    {creditRequest.profiles?.marital_status 
                      ? creditRequest.profiles.marital_status.charAt(0).toUpperCase() + creditRequest.profiles.marital_status.slice(1).replace('_', ' ')
                      : 'Não informado'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Dados de Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-lg">{creditRequest.profiles?.email || creditRequest.patient_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Telefone</p>
                  <p className="text-lg">{creditRequest.profiles?.phone || creditRequest.patient_phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Endereço Completo</p>
                  <p className="text-lg">
                    {creditRequest.profiles?.address 
                      ? (typeof creditRequest.profiles.address === 'object' 
                          ? `${creditRequest.profiles.address.street || ''}, ${creditRequest.profiles.address.neighborhood || ''}, ${creditRequest.profiles.address.city || ''} - ${creditRequest.profiles.address.state || ''}, CEP: ${creditRequest.profiles.address.zipCode || creditRequest.profiles.address.zip_code || ''}`
                          : creditRequest.profiles.address)
                      : 'Não informado'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Dados Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Profissão</p>
                  <p className="text-lg">{creditRequest.profiles?.profession || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Renda Mensal</p>
                  <p className="text-lg">
                    {creditRequest.profiles?.monthly_income 
                      ? `R$ ${creditRequest.profiles.monthly_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'Não informado'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          {(creditRequest.profiles?.bank_name || creditRequest.profiles?.bank_code || creditRequest.profiles?.bank_agency || creditRequest.profiles?.bank_account) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Dados Bancários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Banco</p>
                    <p className="text-lg">{creditRequest.profiles?.bank_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Código do Banco</p>
                    <p className="text-lg">{creditRequest.profiles?.bank_code || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Agência</p>
                    <p className="text-lg">{creditRequest.profiles?.bank_agency || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Conta</p>
                    <p className="text-lg">{creditRequest.profiles?.bank_account || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipo de Conta</p>
                    <p className="text-lg">
                      {creditRequest.profiles?.bank_account_type 
                        ? creditRequest.profiles.bank_account_type.charAt(0).toUpperCase() + creditRequest.profiles.bank_account_type.slice(1)
                        : 'Não informado'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações da Clínica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nome</p>
                  <p className="text-lg">{creditRequest.clinics.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-lg">{creditRequest.clinics.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Telefone</p>
                  <p className="text-lg">{creditRequest.clinics.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">CNPJ</p>
                  <p className="text-lg">{creditRequest.clinics.cnpj || 'Não informado'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Endereço</p>
                  <p className="text-lg">
                    {creditRequest.clinics.address 
                      ? (typeof creditRequest.clinics.address === 'object' 
                          ? `${creditRequest.clinics.address.street || ''}, ${creditRequest.clinics.address.number || ''} - ${creditRequest.clinics.address.neighborhood || ''}, ${creditRequest.clinics.address.city || ''} - ${creditRequest.clinics.address.state || ''}, CEP: ${creditRequest.clinics.address.zip_code || ''}`
                          : creditRequest.clinics.address)
                      : 'Não informado'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Anexados ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum documento anexado</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                          <p className="text-sm text-gray-500">{doc.file_name}</p>
                          <p className="text-xs text-gray-400">
                            Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ações */}
          {(creditRequest.status === 'clinic_approved' || creditRequest.status === 'admin_analyzing') && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                {!showAnalysisForm ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowAnalysisForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Analisar Solicitação
                    </Button>
                    
                    {creditRequest.status === 'clinic_approved' && (
                      <Button
                        onClick={() => handleStatusUpdate('admin_analyzing')}
                        variant="outline"
                        className="w-full"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Colocar em Análise
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentários da Análise *
                      </label>
                      <Textarea
                        value={analysisComments}
                        onChange={(e) => setAnalysisComments(e.target.value)}
                        placeholder="Descreva os motivos da sua decisão..."
                        rows={4}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleStatusUpdate('admin_approved')}
                        disabled={submitting || !analysisComments.trim()}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {submitting ? 'Processando...' : 'Aprovar'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate('admin_rejected')}
                        disabled={submitting || !analysisComments.trim()}
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {submitting ? 'Processando...' : 'Rejeitar'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAnalysisForm(false);
                          setAnalysisComments('');
                        }}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Histórico de Análises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma análise registrada</p>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={analysis.decision === 'approved' ? 'default' : 'destructive'}>
                          {analysis.decision === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {analysis.analysis_type === 'clinic' ? 'Clínica' : 'Administrador'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{analysis.comments}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(analysis.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Solicitação criada</p>
                    <p className="text-xs text-gray-500">
                      {new Date(creditRequest.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {creditRequest.status !== 'pending' && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Status atual: {getStatusBadge(creditRequest.status)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(creditRequest.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCreditDetails;