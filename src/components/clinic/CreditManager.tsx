import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  CreditCard, 
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Search,
  Edit3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EditValueModalSimple } from './EditValueModalSimple';

interface CreditRequest {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_cpf: string;
  requested_amount: number;
  approved_amount?: number;
  installments: number;
  interest_rate: number;
  status: 'pending' | 'clinic_approved' | 'clinic_rejected' | 'admin_approved' | 'admin_rejected' | 'admin_analyzing';
  treatment_description: string;
  patient_birth_date?: string;
  patient_gender?: string;
  patient_address?: string;
  treatment_type?: string;
  urgency_level?: string;
  preferred_date?: string;
  created_at: string;
  updated_at?: string;
  clinic_comments?: string;
  admin_comments?: string;
}



interface CreditManagerProps {
  clinicId?: string;
}

export const CreditManager: React.FC<CreditManagerProps> = ({ clinicId }) => {
  console.log('🚨 [CreditManager] COMPONENTE INICIADO - VERSÃO 3.0');
  console.log('🚨 [CreditManager] clinicId recebido:', clinicId);
  
  if (!clinicId) {
    console.log('❌ [CreditManager] clinicId não fornecido');
    return <div>Erro: ID da clínica não fornecido</div>;
  }
  console.log('🔥 [CreditManager] Componente renderizado! v2.0');
  console.log('🔥 [CreditManager] clinicId recebido:', clinicId);
  

  
  const { toast } = useToast();
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');


  // Estados para o modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCreditRequest, setSelectedCreditRequest] = useState<any>(null);

  // Buscar dados reais do banco de dados
  useEffect(() => {
    console.log('🏥 [CreditManager] useEffect executado, clinicId:', clinicId);
    
    if (clinicId) {
      console.log('🏥 [CreditManager] Buscando solicitações de crédito para clínica:', clinicId);
      fetchCreditRequests();
    } else {
      console.log('🏥 [CreditManager] clinicId não fornecido');
    }
  }, [clinicId]);

  const fetchCreditRequests = async () => {
    console.log('🏥 [CreditManager] fetchCreditRequests iniciado para clinicId:', clinicId);
    if (!clinicId) {
      console.log('🏥 [CreditManager] clinicId não fornecido, retornando');
      return;
    }
    
    try {
      console.log('🏥 [CreditManager] Buscando solicitações de crédito...');
      
      // Primeiro, vamos verificar se o usuário atual tem acesso
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🏥 [CreditManager] Usuário atual:', user?.id);
      
      // Verificar se o usuário é profissional da clínica
      const { data: clinicProfessional, error: profError } = await supabase
        .from('clinic_professionals')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('user_id', user?.id);
      
      console.log('🏥 [CreditManager] Verificação clinic_professionals:', { clinicProfessional, profError });
      
      // Verificar se o usuário é dono da clínica
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('owner_id, master_user_id')
        .eq('id', clinicId)
        .single();
      
      console.log('🏥 [CreditManager] Verificação clinic owner:', { clinic, clinicError, isOwner: clinic?.owner_id === user?.id, isMaster: clinic?.master_user_id === user?.id });
      
      const { data, error } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      console.log('🏥 [CreditManager] Resultado da query:', { data, error });
      
      if (error) {
        console.error('Erro ao buscar solicitações:', error);
        return;
      }

      // Buscar dados dos perfis dos pacientes
      const requestsWithProfiles = [];
      for (const request of data || []) {
  
        
        console.log('🔍 [CreditManager] Buscando perfil para patient_id:', request.patient_id);
        
        // Primeiro tentar com patient_id = profiles.id
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, phone, cpf, user_id')
          .eq('id', request.patient_id)
          .single();
        
        // Se não encontrar, tentar com patient_id = profiles.user_id
        if (profileError || !profile) {
          console.log('🔍 [CreditManager] Tentando buscar por user_id:', request.patient_id);
          const { data: profileByUserId, error: profileByUserIdError } = await supabase
            .from('profiles')
            .select('full_name, email, phone, cpf, user_id')
            .eq('user_id', request.patient_id)
            .single();
          
          if (!profileByUserIdError && profileByUserId) {
            profile = profileByUserId;
            profileError = null;
          }
        }
        
        console.log('🔍 [CreditManager] Perfil encontrado:', profile);
        console.log('🔍 [CreditManager] Erro do perfil:', profileError);
        
        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
        }
        

        
        requestsWithProfiles.push({
          id: request.id,
          patient_name: profile?.full_name || 'Nome não informado',
          patient_email: profile?.email || 'Email não informado',
          patient_phone: profile?.phone || 'Telefone não informado',
          patient_cpf: profile?.cpf || 'CPF não informado',
          requested_amount: request.requested_amount,
          approved_amount: request.approved_amount,
          installments: request.installments || 12,
          interest_rate: request.interest_rate || 2.5,
          status: request.status,
          treatment_description: request.treatment_description || 'Tratamento não especificado',
          patient_birth_date: request.patient_birth_date,
          patient_gender: request.patient_gender,
          patient_address: request.patient_address,
          treatment_type: request.treatment_type,
          urgency_level: request.urgency_level,
          preferred_date: request.preferred_date,
          created_at: request.created_at,
          updated_at: request.updated_at,
          clinic_comments: request.clinic_comments,
          admin_comments: request.admin_comments
        });
      }

      console.log('🏥 [CreditManager] Solicitações processadas:', requestsWithProfiles.length);
      console.log('🏥 [CreditManager] Dados finais:', requestsWithProfiles);
      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('🏥 [CreditManager] Erro ao buscar solicitações:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'clinic_approved': return 'bg-green-100 text-green-800';
      case 'clinic_rejected': return 'bg-red-100 text-red-800';
      case 'admin_approved': return 'bg-blue-100 text-blue-800';
      case 'admin_rejected': return 'bg-red-100 text-red-800';
      case 'admin_analyzing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'clinic_approved': return 'Aprovado pela Clínica';
      case 'clinic_rejected': return 'Rejeitado pela Clínica';
      case 'admin_approved': return 'Aprovado pelo Admin';
      case 'admin_rejected': return 'Rejeitado pelo Admin';
      case 'admin_analyzing': return 'Em Análise pelo Admin';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'clinic_approved': return CheckCircle;
      case 'clinic_rejected': return AlertCircle;
      case 'admin_approved': return CheckCircle;
      case 'admin_rejected': return AlertCircle;
      case 'admin_analyzing': return Clock;
      default: return Clock;
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: 'clinic_approved' | 'clinic_rejected', notes?: string) => {
    console.log('🚀 [updateRequestStatus] INICIANDO ATUALIZAÇÃO:', {
      requestId,
      newStatus,
      notes,
      clinicId
    });

    try {
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔐 [updateRequestStatus] Usuário autenticado:', { user: user?.id, authError });

      if (authError || !user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Verificar se a clínica está definida
      if (!clinicId) {
        throw new Error('Clínica não identificada. Verifique suas permissões.');
      }

      // Verificar se a solicitação existe e pertence à clínica
      const { data: existingRequest, error: fetchError } = await supabase
        .from('credit_requests')
        .select('*, clinic_id')
        .eq('id', requestId)
        .single();

      console.log('🔍 [updateRequestStatus] Solicitação existente:', { existingRequest, fetchError });

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Solicitação não encontrada ou você não tem permissão para visualizá-la.');
        }
        throw new Error(`Erro ao buscar solicitação: ${fetchError.message}`);
      }

      if (!existingRequest) {
        throw new Error('Solicitação não encontrada.');
      }

      // Verificar se a solicitação pertence à clínica
      if (existingRequest.clinic_id !== clinicId) {
        throw new Error('Você não tem permissão para atualizar esta solicitação.');
      }

      // Verificar se o status atual permite atualização
      if (existingRequest.status !== 'pending') {
        throw new Error(`Esta solicitação já foi processada (status: ${getStatusText(existingRequest.status)}). Não é possível alterar o status.`);
      }

      // Tentar atualizar o status
      console.log('📝 [updateRequestStatus] Tentando atualizar status...');
      const { data: updateData, error: updateError } = await supabase
        .from('credit_requests')
        .update({ 
          status: newStatus,
          clinic_comments: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('clinic_id', clinicId) // Garantir que só atualize se for da clínica correta
        .select();

      console.log('📝 [updateRequestStatus] Resultado da atualização:', { updateData, updateError });

      if (updateError) {
        console.error('❌ [updateRequestStatus] ERRO NA ATUALIZAÇÃO:', updateError);
        
        // Tratamento específico para erros de RLS
        if (updateError.code === '42501' || updateError.message.includes('permission denied')) {
          throw new Error('Você não tem permissão para atualizar esta solicitação. Verifique se ela pertence à sua clínica.');
        }
        
        if (updateError.code === 'PGRST116') {
          throw new Error('Nenhuma solicitação foi atualizada. Verifique se ela ainda existe e pertence à sua clínica.');
        }
        
        throw new Error(`Erro ao atualizar: ${updateError.message}`);
      }

      // Verificar se alguma linha foi atualizada
      if (!updateData || updateData.length === 0) {
        throw new Error('Nenhuma solicitação foi atualizada. Verifique se ela ainda existe e pertence à sua clínica.');
      }

      console.log('✅ [updateRequestStatus] ATUALIZAÇÃO REALIZADA COM SUCESSO!');

      // Criar notificação para o paciente
      try {
        const notificationTitle = newStatus === 'clinic_approved' 
          ? 'Solicitação Aprovada pela Clínica' 
          : 'Solicitação Rejeitada pela Clínica';
        
        const notificationMessage = newStatus === 'clinic_approved'
          ? 'Sua solicitação de crédito foi aprovada pela clínica e enviada para análise final.'
          : 'Sua solicitação de crédito foi rejeitada pela clínica.';

        await supabase
          .from('notifications')
          .insert({
            user_id: existingRequest.patient_id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'credit_update',
            read: false
          });

        console.log('📧 [updateRequestStatus] Notificação criada para o paciente');
      } catch (notificationError) {
        console.error('⚠️ [updateRequestStatus] Erro ao criar notificação:', notificationError);
        // Não falhar a operação principal por causa da notificação
      }

      // Atualizar a lista local
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, clinic_comments: notes || req.clinic_comments }
            : req
        )
      );

      toast({
        title: 'Status atualizado',
        description: `Solicitação ${newStatus === 'clinic_approved' ? 'aprovada' : 'rejeitada'} com sucesso!`
      });

      // Recarregar as solicitações para garantir sincronização
      console.log('🔄 [updateRequestStatus] Recarregando solicitações...');
      await fetchCreditRequests();

    } catch (error) {
      console.error('❌ [updateRequestStatus] ERRO GERAL:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Erro ao atualizar status',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Função para criar solicitação de teste (temporária para debug)
  const createTestRequest = async () => {
    if (!clinicId) {
      toast({
        title: 'Erro',
        description: 'ID da clínica não encontrado'
      });
      return;
    }

    try {
      console.log('🧪 [createTestRequest] Criando solicitação de teste...');
      
      const { data, error } = await supabase
        .from('credit_requests')
        .insert({
          clinic_id: clinicId,
          patient_name: 'João Silva Teste',
          patient_email: 'joao.teste@email.com',
          patient_phone: '(11) 98765-4321',
          patient_cpf: '123.456.789-00',
          requested_amount: 5000.00,
          installments: 12,
          interest_rate: 2.5,
          treatment_description: 'Tratamento odontológico - Implante dentário - Teste de aprovação',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [createTestRequest] Erro:', error);
        throw error;
      }

      console.log('✅ [createTestRequest] Solicitação criada:', data);
      
      toast({
        title: 'Sucesso',
        description: 'Solicitação de teste criada com sucesso!'
      });

      // Recarregar as solicitações
      await fetchCreditRequests();

    } catch (error) {
      console.error('❌ [createTestRequest] Erro geral:', error);
      toast({
        title: 'Erro',
        description: `Erro ao criar solicitação de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };

  // Funções para edição de valores
  const handleEditValues = (request: CreditRequest) => {
    console.log('🔍 [CreditManager] ===== BOTÃO EDITAR VALORES CLICADO =====');
    console.log('🔍 [CreditManager] Request recebida:', request);
    console.log('🔍 [CreditManager] Estado atual editModalOpen:', editModalOpen);
    console.log('🔍 [CreditManager] Estado atual selectedCreditRequest:', selectedCreditRequest);
    
    setSelectedCreditRequest(request);
    setEditModalOpen(true);
    
    console.log('🔍 [CreditManager] Estados atualizados - modal deve abrir');
  };

  const handleEditSuccess = () => {
    console.log('🔍 [CreditManager] Edição realizada com sucesso');
    setEditModalOpen(false);
    setSelectedCreditRequest(null);
    
    // Recarregar as solicitações
    if (clinicId) {
      fetchCreditRequests();
    }
    
    toast({
      title: 'Sucesso',
      description: 'Valores da solicitação atualizados com sucesso!'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.treatment_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'clinic_approved' || r.status === 'admin_approved').length,
    totalApproved: requests
      .filter(r => r.status === 'clinic_approved' || r.status === 'admin_approved')
      .reduce((sum, r) => sum + (r.approved_amount || r.requested_amount), 0),
    approvalRate: requests.length > 0 ? 
      ((requests.filter(r => r.status === 'clinic_approved' || r.status === 'admin_approved').length / requests.length) * 100).toFixed(1) : '0'
  };



  return (
    <div className="w-full max-w-none space-y-6">
      {/* Estatísticas */}
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-800">Aguardando Análise</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-green-800">Aprovadas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                R$ {stats.totalApproved.toLocaleString()}
              </div>
              <div className="text-sm text-blue-800">Crédito Aprovado</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.approvalRate}%</div>
              <div className="text-sm text-gray-800">Taxa de Aprovação</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Crédito */}
      <Card className="w-full">
        <CardHeader>
          <div className="w-full flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Crédito Odontológico
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={createTestRequest} variant="outline">
                🧪 Criar Teste
              </Button>
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>


          {/* Filtros */}
          <div className="w-full flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar solicitações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="clinic_approved">Aprovadas pela Clínica</SelectItem>
                <SelectItem value="clinic_rejected">Rejeitadas pela Clínica</SelectItem>
                <SelectItem value="admin_approved">Aprovadas pelo Admin</SelectItem>
                <SelectItem value="admin_rejected">Rejeitadas pelo Admin</SelectItem>
                <SelectItem value="admin_analyzing">Em Análise pelo Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Solicitações */}
          <div className="w-full space-y-4">
            {(() => {
              
              return filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {requests.length === 0 ? 'Nenhuma solicitação encontrada' : 'Nenhuma solicitação corresponde aos filtros'}
                </div>
              ) : (
                filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <Card key={request.id} className="w-full">
                    <CardContent className="p-4">
                      <div className="w-full flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{request.patient_name}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <div className="w-full space-y-3">
                            {/* Informações do Paciente */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-medium text-sm mb-2 text-gray-700">Dados do Paciente</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Email:</span>
                                  <div>{request.patient_email}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Telefone:</span>
                                  <div>{request.patient_phone}</div>
                                </div>
                                <div>
                                  <span className="font-medium">CPF:</span>
                                  <div>{request.patient_cpf}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Informações da Solicitação */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Valor Solicitado:</span>
                                <div className="text-lg font-bold text-blue-600">
                                  R$ {request.requested_amount.toLocaleString()}
                                </div>
                              </div>
                              {request.approved_amount && (
                                <div>
                                  <span className="font-medium">Valor Aprovado:</span>
                                  <div className="text-lg font-bold text-green-600">
                                    R$ {request.approved_amount.toLocaleString()}
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Parcelas:</span>
                                <div>{request.installments}x de R$ {
                                  ((request.approved_amount || request.requested_amount) / request.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                }</div>
                              </div>
                              <div>
                                <span className="font-medium">Tratamento:</span>
                                <div>{request.treatment_description}</div>
                              </div>
                              <div>
                                <span className="font-medium">Data:</span>
                                <div>{new Date(request.created_at).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="font-medium">Taxa:</span>
                                <div>{request.interest_rate}% a.m.</div>
                              </div>
                            </div>
                          </div>
                          {(request.clinic_comments || request.admin_comments) && (
                            <div className="mt-2 space-y-2">
                              {request.clinic_comments && (
                                <p className="text-sm text-muted-foreground p-2 bg-blue-50 rounded">
                                  <strong>Comentários da Clínica:</strong> {request.clinic_comments}
                                </p>
                              )}
                              {request.admin_comments && (
                                <p className="text-sm text-muted-foreground p-2 bg-purple-50 rounded">
                                  <strong>Comentários do Admin:</strong> {request.admin_comments}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                console.log('🔍 [CreditManager] BOTÃO CLICADO! Request:', request);
                                handleEditValues(request);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Edit3 className="h-4 w-4" />
                              Editar Valores
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => updateRequestStatus(request.id, 'clinic_approved', 'Aprovado pela clínica')}
                            >
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateRequestStatus(request.id, 'clinic_rejected', 'Rejeitado pela clínica')}
                            >
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>);
                })
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Valores */}
      <EditValueModalSimple
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        creditRequest={selectedCreditRequest}
        onSuccess={handleEditSuccess}
        onCreditRequestUpdate={(updatedCreditRequest) => {
          // Atualizar o selectedCreditRequest com os dados atualizados
          setSelectedCreditRequest(updatedCreditRequest);
          
          // Também atualizar na lista de requests se necessário
          setRequests(prevRequests => 
            prevRequests.map(request => 
              request.id === updatedCreditRequest.id 
                ? { ...request, ...updatedCreditRequest }
                : request
            )
          );
        }}
      />
    </div>
  );
};