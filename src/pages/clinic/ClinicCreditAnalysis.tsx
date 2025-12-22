import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  patients: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birth_date: string;
    address: string;
  };
}

interface CreditDocument {
  id: string;
  credit_request_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
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

const ClinicCreditAnalysis: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [creditRequest, setCreditRequest] = useState<CreditRequest | null>(null);
  const [documents, setDocuments] = useState<CreditDocument[]>([]);
  const [analysis, setAnalysis] = useState<CreditAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchCreditRequestDetails();
    }
  }, [requestId]);

  const fetchCreditRequestDetails = async () => {
    try {
      setLoading(true);

      // Buscar detalhes da solicitação
      const { data: requestData, error: requestError } = await supabase
        .from('credit_requests')
        .select(`
          *,
          patients (
            name,
            email,
            phone,
            cpf,
            birth_date,
            address
          )
        `)
        .eq('id', requestId)
        .single();

      if (requestError) {
        throw requestError;
      }

      setCreditRequest(requestData);

      // Buscar documentos
      const { data: documentsData, error: documentsError } = await supabase
        .from('credit_documents')
        .select('*')
        .eq('credit_request_id', requestId);

      if (documentsError) {
        throw documentsError;
      }

      setDocuments(documentsData || []);

      // Buscar análises anteriores
      const { data: analysisData, error: analysisError } = await supabase
        .from('credit_analysis')
        .select('*')
        .eq('credit_request_id', requestId)
        .order('created_at', { ascending: false });

      if (analysisError) {
        throw analysisError;
      }

      setAnalysis(analysisData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      toast.error('Erro ao carregar detalhes da solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!creditRequest || !comments.trim()) {
      toast.error('Por favor, adicione comentários sobre sua análise');
      return;
    }

    try {
      setSubmitting(true);

      // Atualizar status da solicitação
      const newStatus = decision === 'approved' ? 'clinic_approved' : 'clinic_rejected';
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

      // Criar registro de análise
      const { error: analysisError } = await supabase
        .from('credit_analysis')
        .insert({
          credit_request_id: requestId,
          analyst_id: 'current-clinic-user-id', // TODO: Substituir pelo ID do usuário logado
          analysis_type: 'clinic',
          decision,
          comments
        });

      if (analysisError) {
        throw analysisError;
      }

      // Criar notificação para o paciente
      await supabase
        .from('notifications')
        .insert({
          user_id: creditRequest.patient_id,
          title: decision === 'approved' ? 'Solicitação Aprovada pela Clínica' : 'Solicitação Rejeitada pela Clínica',
          message: decision === 'approved' 
            ? 'Sua solicitação de crédito foi aprovada pela clínica e enviada para análise final.'
            : `Sua solicitação de crédito foi rejeitada pela clínica. Motivo: ${comments}`,
          type: 'credit_update',
          read: false
        });

      toast.success(`Solicitação ${decision === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      navigate('/clinic-dashboard?tab=credito');
    } catch (error) {
      console.error('Erro ao processar decisão:', error);
      toast.error('Erro ao processar decisão');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      clinic_approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      clinic_rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
      admin_approved: { label: 'Aprovado Final', variant: 'default' as const, icon: CheckCircle },
      admin_rejected: { label: 'Rejeitado Final', variant: 'destructive' as const, icon: XCircle },
      admin_analyzing: { label: 'Em Análise', variant: 'secondary' as const, icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitação não encontrada</h1>
          <Button onClick={() => navigate('/clinic-dashboard?tab=credito')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/clinic-dashboard?tab=credito')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Análise de Crédito</h1>
            <p className="text-gray-600">Solicitação de {creditRequest.patients.name}</p>
          </div>
          {getStatusBadge(creditRequest.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Nome</p>
              <p className="text-lg">{creditRequest.patients.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p>{creditRequest.patients.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Telefone</p>
              <p>{creditRequest.patients.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">CPF</p>
              <p>{creditRequest.patients.cpf}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Data de Nascimento</p>
              <p>{new Date(creditRequest.patients.birth_date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Endereço</p>
              <p>
                {creditRequest.patients.address 
                  ? (typeof creditRequest.patients.address === 'object' 
                      ? `${creditRequest.patients.address.street || ''}, ${creditRequest.patients.address.neighborhood || ''}, ${creditRequest.patients.address.city || ''} - ${creditRequest.patients.address.state || ''}, CEP: ${creditRequest.patients.address.zipCode || creditRequest.patients.address.zip_code || ''}`
                      : creditRequest.patients.address)
                  : 'Não informado'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Solicitação */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Solicitação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Valor Solicitado</p>
              <p className="text-2xl font-bold text-green-600">
                R$ ${creditRequest.requested_amount.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Número de Parcelas</p>
              <p className="text-xl font-semibold">{creditRequest.installments}x</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Valor da Parcela</p>
              <p className="text-lg font-medium">
                R$ ${(creditRequest.requested_amount / creditRequest.installments).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Data da Solicitação</p>
              <p>{new Date(creditRequest.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Descrição do Tratamento</p>
              <p className="text-sm bg-gray-50 p-3 rounded-md">
                {creditRequest.treatment_description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Documentos Anexados</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum documento anexado</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{doc.document_type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{doc.file_name}</p>
                  <Button
                    size="sm"
                    variant="outline"
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

      {/* Histórico de Análises */}
      {analysis.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.map((item) => (
                <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={item.decision === 'approved' ? 'default' : 'destructive'}>
                      {item.decision === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {item.analysis_type === 'clinic' ? 'Clínica' : 'Administrador'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{item.comments}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Análise */}
      {creditRequest.status === 'pending' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Realizar Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentários da Análise *
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Descreva os motivos da sua decisão..."
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => handleDecision('approved')}
                  disabled={submitting || !comments.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {submitting ? 'Processando...' : 'Aprovar'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDecision('rejected')}
                  disabled={submitting || !comments.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {submitting ? 'Processando...' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClinicCreditAnalysis;