import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar"; // 👈 você já tem esse componente
import ClinicNotifications from "@/components/clinic/ClinicNotifications";
import ClinicProfileManager from "@/components/clinic/ClinicProfileManager";
import ClinicSupportSystem from "@/components/clinic/ClinicSupportSystem";
import ClinicorpStatusBadge from "@/components/clinic/ClinicorpStatusBadge";
import ClinicorpDashboard from "@/components/clinic/ClinicorpDashboard";
import { ClinicorpErrorBoundary } from "@/components/clinic/ClinicorpErrorBoundary";
import { EditValueModalSimple } from "@/components/clinic/EditValueModalSimple";
// ChatWidget removido do site

import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Send,
  Settings,
  User,
  MessageSquare,
  Edit3,
  X,
  Eye,
  Building2,
  FileText,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

type LoanRequest = {
  id: string;
  treatment_description: string;
  requested_amount: number;
  installments: number;
  status: string;
  clinic_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  profiles?: { full_name?: string } | null;
};

type CreditRequest = {
  id: string;
  patient_id: string;
  clinic_id: string;
  clinic_name: string;
  full_name: string;
  birth_date: string;
  cpf: string;
  address: string;
  phone: string;
  requested_amount: number;
  installments: number;
  interest_rate: number;
  clinic_approved_amount?: number;
  clinic_installments?: number;
  clinic_interest_rate?: number;
  clinic_notes?: string;
  special_conditions?: string;
  edited_by_clinic: boolean;
  email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'Aguardando Admin' | 'clinic_approved' | 'clinic_rejected' | 'admin_approved' | 'admin_rejected' | 'admin_analyzing';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
};

type CreditOffer = {
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
  updated_at: string;
};

export default function ClinicDashboard() {
  console.log('🔥 [DEBUG] ClinicDashboard PRINCIPAL renderizado! (com botão Editar Valores)');
  console.log('🎯 DASHBOARD PRINCIPAL CARREGADO!');
  const { user } = useAuth();
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [creditOffers, setCreditOffers] = useState<Record<string, CreditOffer[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string>("");
  const [clinicNotes, setClinicNotes] = useState("");
  const [activeTab, setActiveTab] = useState("credit-requests");
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicAgendaUrl, setClinicAgendaUrl] = useState<string>("");
  const [clinicAgendaSlug, setClinicAgendaSlug] = useState<string>("");
  
  // Estados para o modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCreditRequest, setSelectedCreditRequest] = useState<CreditRequest | null>(null);
  
  // Estado para controlar solicitações editadas
  const [editedRequests, setEditedRequests] = useState<Set<string>>(new Set());
  
  // Estados para modal de detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<CreditRequest | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<CreditOffer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const embedUrl = useMemo(() => {
    if (clinicAgendaUrl) return clinicAgendaUrl;
    if (clinicAgendaSlug) {
      const slug = String(clinicAgendaSlug).replace(/^\/+|\/+$/g, "");
      return `https://agenda.link/online_scheduling/${slug}/`;
    }
    return null;
  }, [clinicAgendaUrl, clinicAgendaSlug]);

  useEffect(() => {
    if (user) {
      fetchLoanRequests();
      fetchCreditRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Debug: Monitorar mudanças nos estados do modal
  useEffect(() => {
    console.log('🔥 [DEBUG] Estado editModalOpen mudou para:', editModalOpen);
  }, [editModalOpen]);

  useEffect(() => {
    console.log('🔥 [DEBUG] Estado selectedCreditRequest mudou para:', selectedCreditRequest);
  }, [selectedCreditRequest]);

  const fetchLoanRequests = async () => {
    try {
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("id, agenda_link_url")
        .or(`master_user_id.eq.${user?.id},owner_id.eq.${user?.id}`)
        .limit(1);

      if (clinicError) throw clinicError;
      if (!clinicData || clinicData.length === 0) {
        setLoanRequests([]);
        return;
      }
      
      const clinic = clinicData[0];
      setClinicId(clinic.id);
      setClinicAgendaUrl(clinic.agenda_link_url || "");

      const { data, error } = await supabase
        .from("loan_requests")
        .select(
          `
          *,
          profiles!loan_requests_profile_id_fkey (full_name)
        `
        )
        .eq("clinic_id", clinic.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLoanRequests((data || []) as any);
    } catch (error) {
      console.error("Error fetching loan requests:", error);
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditRequests = async () => {
    try {
      console.log('🔍 [ClinicDashboard] Iniciando busca de solicitações de crédito...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ [ClinicDashboard] Usuário não logado');
        return;
      }
      
      console.log('👤 [ClinicDashboard] Usuário logado:', user.id, user.email);

      // Buscar clínicas associadas ao usuário
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select("id, name, email")
        .or(`master_user_id.eq.${user.id},owner_id.eq.${user.id}`);

      if (clinicsError) {
        console.error('❌ [ClinicDashboard] Erro ao buscar clínicas:', clinicsError);
        throw clinicsError;
      }
      
      console.log('🏥 [ClinicDashboard] Clínicas encontradas:', clinics);
      
      if (!clinics || clinics.length === 0) {
        console.log('⚠️ [ClinicDashboard] Nenhuma clínica encontrada para o usuário');
        return;
      }

      const clinicIds = clinics.map(clinic => clinic.id);
      console.log('🔑 [ClinicDashboard] IDs das clínicas:', clinicIds);

      // Buscar solicitações de crédito para essas clínicas
      const { data: requests, error: requestsError } = await supabase
        .from("credit_requests")
        .select("*")
        .in("clinic_id", clinicIds)
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error('❌ [ClinicDashboard] Erro ao buscar solicitações:', requestsError);
        throw requestsError;
      }
      
      console.log('📋 [ClinicDashboard] Solicitações encontradas:', requests);
      console.log('📊 [ClinicDashboard] Total de solicitações:', requests?.length || 0);

      // Processar os dados - os dados já estão na tabela credit_requests
      const processedRequests = requests?.map(request => ({
        ...request,
        full_name: request.full_name || 'N/A',
        cpf: request.cpf || 'N/A',
        birth_date: request.birth_date || new Date(),
        phone: request.phone || 'N/A',
        email: request.email || '',
        address: request.address || 'N/A'
      })) || [];
      
      console.log('✅ [ClinicDashboard] Solicitações processadas:', processedRequests.length);
      console.log('🔥 [DEBUG] Status das solicitações:', processedRequests?.map(r => ({ id: r.id, status: r.status })));

      setCreditRequests(processedRequests);
      
      // Buscar ofertas bancárias para as solicitações
      if (processedRequests.length > 0) {
        await fetchCreditOffers(processedRequests.map(r => r.id));
      }
    } catch (error) {
      console.error("❌ [ClinicDashboard] Error fetching credit requests:", error);
    }
  };

  const fetchCreditOffers = async (requestIds: string[]) => {
    try {
      console.log('🏦 [ClinicDashboard] Buscando ofertas bancárias para:', requestIds);
      
      const { data: offers, error } = await supabase
        .from("credit_offers")
        .select("*")
        .in("credit_request_id", requestIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('❌ [ClinicDashboard] Erro ao buscar ofertas:', error);
        return;
      }

      console.log('💰 [ClinicDashboard] Ofertas encontradas:', offers);

      // Organizar ofertas por request_id
      const offersMap: Record<string, CreditOffer[]> = {};
      offers?.forEach(offer => {
        if (!offersMap[offer.credit_request_id]) {
          offersMap[offer.credit_request_id] = [];
        }
        offersMap[offer.credit_request_id].push(offer);
      });

      setCreditOffers(offersMap);
      console.log('✅ [ClinicDashboard] Ofertas organizadas:', offersMap);
    } catch (error) {
      console.error("❌ [ClinicDashboard] Error fetching credit offers:", error);
    }
  };

  const updateCreditRequestStatus = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      console.log('🔄 [ClinicDashboard] Atualizando solicitação:', requestId, 'para status:', status);
      
      // Mapear status da clínica para os status corretos
      const clinicStatus = status === 'approved' ? 'clinic_approved' : 'clinic_rejected';
      
      const { error } = await supabase
        .from("credit_requests")
        .update({ 
          status: clinicStatus, 
          clinic_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) {
        console.error('❌ [ClinicDashboard] Erro ao atualizar:', error);
        throw error;
      }
      
      console.log('✅ [ClinicDashboard] Solicitação atualizada com sucesso');
      await fetchCreditRequests();
      toast.success(`Solicitação ${status === 'approved' ? 'aprovada pela clínica' : 'rejeitada pela clínica'} com sucesso!`);
    } catch (error) {
      console.error("❌ [ClinicDashboard] Error updating credit request:", error);
      toast.error("Erro ao atualizar solicitação");
    }
  };

  // Nova função para enviar para admin
  const handleSendToAdmin = async (requestId: string, notes?: string) => {
    try {
      console.log('🔄 [ClinicDashboard] Enviando para admin:', requestId);
      
      const { error } = await supabase
        .from("credit_requests")
        .update({ 
          status: 'admin_analyzing',
          clinic_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) {
        console.error('❌ [ClinicDashboard] Erro ao enviar para admin:', error);
        throw error;
      }
      
      // Remover da lista de editadas após enviar
      setEditedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      
      console.log('✅ [ClinicDashboard] Solicitação enviada para admin com sucesso');
      await fetchCreditRequests();
      toast.success('Solicitação enviada para análise do administrador!');
    } catch (error) {
      console.error("❌ [ClinicDashboard] Error sending to admin:", error);
      toast.error("Erro ao enviar para administrador");
    }
  };

  const handleEditValues = (request: CreditRequest) => {
    console.log('🔥 [DEBUG] handleEditValues chamada para request:', request.id);
    setSelectedCreditRequest(request);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    console.log('✅ [ClinicDashboard] Edição concluída com sucesso');
    
    // Marcar a solicitação como editada
    if (selectedCreditRequest) {
      setEditedRequests(prev => new Set(prev).add(selectedCreditRequest.id));
    }
    
    setEditModalOpen(false);
    setSelectedCreditRequest(null);
    fetchCreditRequests(); // Recarrega as solicitações para mostrar as mudanças
    toast.success('Valores editados com sucesso!');
  };

  // Funções para gerenciar modais de detalhes
  const openDetailsModal = (request: CreditRequest) => {
    setSelectedRequestDetails(request);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedRequestDetails(null);
    setShowDetailsModal(false);
  };

  const openOfferModal = (offer: CreditOffer) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setSelectedOffer(null);
    setShowOfferModal(false);
  };

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'clinic_approved':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Aguardando Admin</Badge>;
      case 'clinic_rejected':
        return <Badge variant="destructive">Rejeitado pela Clínica</Badge>;
      case 'admin_analyzing':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Em Análise</Badge>;
      case 'admin_approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>;
      case 'admin_rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa */}
      <AppSidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 w-full bg-background flex flex-col">
        {/* Navbar fixa no topo */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
          <Navbar />
        </div>

        {/* Conteúdo com padding */}
        <div className="flex-1 w-full px-6 py-8 pt-24">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Painel da Clínica
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Gerencie solicitações de crédito dos pacientes
              </p>
            </div>
            <div className="mt-1">
              <ClinicorpStatusBadge />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credit-requests" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Solicitações de Crédito
              </TabsTrigger>
              <TabsTrigger value="loans" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Empréstimos Antigos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credit-requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Solicitações de Crédito Odontológico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creditRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhuma solicitação de crédito encontrada</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Valor Solicitado</TableHead>
                            <TableHead>Máx. Aprovado</TableHead>
                            <TableHead>Data de Criação</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {creditRequests.map((request) => {
                            const maxApproved = creditOffers[request.id] 
                              ? Math.max(...creditOffers[request.id].map(offer => offer.approved_amount || 0))
                              : 0;
                            
                            return (
                              <TableRow 
                                key={request.id} 
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => openDetailsModal(request)}
                              >
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">{request.full_name}</div>
                                      <div className="text-sm text-gray-500">{request.cpf}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{request.phone || '-'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{request.email || '-'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    R$ {request.requested_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {maxApproved > 0 ? (
                                      <span className="text-green-600">
                                        R$ {maxApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-900">
                                    {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(request.status)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loans" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Empréstimos (Sistema Antigo)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loanRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhuma solicitação de empréstimo encontrada</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Tratamento</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loanRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.profiles?.full_name || 'N/A'}</TableCell>
                            <TableCell>{request.treatment_description}</TableCell>
                            <TableCell>R$ {request.requested_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell>
                              <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(request.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer no final */}
        <Footer />
      </main>

      {/* Modal de Edição de Valores */}
      {selectedCreditRequest && (
        <EditValueModalSimple
          creditRequest={selectedCreditRequest}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de Detalhes da Solicitação */}
      {selectedRequestDetails && showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                Detalhes da Solicitação - {selectedRequestDetails.full_name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDetailsModal}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Paciente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Informações do Paciente</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {selectedRequestDetails.full_name}</p>
                    <p><strong>CPF:</strong> {selectedRequestDetails.cpf}</p>
                    <p><strong>Data de Nascimento:</strong> {new Date(selectedRequestDetails.birth_date).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Telefone:</strong> {selectedRequestDetails.phone}</p>
                    <p><strong>Email:</strong> {selectedRequestDetails.email}</p>
                    <p><strong>Endereço:</strong> {
                      typeof selectedRequestDetails.address === 'object' && selectedRequestDetails.address !== null
                        ? `${selectedRequestDetails.address.street || ''}, ${selectedRequestDetails.address.neighborhood || ''}, ${selectedRequestDetails.address.city || ''} - ${selectedRequestDetails.address.state || ''}, CEP: ${selectedRequestDetails.address.zip_code || selectedRequestDetails.address.zipCode || ''}`
                        : selectedRequestDetails.address || 'Não informado'
                    }</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Detalhes da Solicitação</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Valor Solicitado:</strong> R$ {selectedRequestDetails.requested_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p><strong>Parcelas:</strong> {selectedRequestDetails.installments}x</p>
                    <p><strong>Taxa de Juros:</strong> {selectedRequestDetails.interest_rate}% a.m.</p>
                    <p><strong>Data da Solicitação:</strong> {new Date(selectedRequestDetails.created_at).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedRequestDetails.status)}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {selectedRequestDetails.clinic_notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2">Observações da Clínica</h4>
                  <p className="text-sm">{selectedRequestDetails.clinic_notes}</p>
                </div>
              )}

              {selectedRequestDetails.admin_notes && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-2">Análise do Administrador</h4>
                  <p className="text-sm">{selectedRequestDetails.admin_notes}</p>
                </div>
              )}

              {/* Ofertas Bancárias */}
              {creditOffers[selectedRequestDetails.id] && creditOffers[selectedRequestDetails.id].length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ofertas Bancárias ({creditOffers[selectedRequestDetails.id].length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {creditOffers[selectedRequestDetails.id].map((offer) => (
                      <div key={offer.id} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-green-800">{offer.bank_name}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOfferModal(offer)}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Valor Aprovado:</strong> R$ {offer.approved_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <p><strong>Parcelas:</strong> {offer.installments}x de R$ {offer.monthly_payment ? offer.monthly_payment.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</p>
                          <p><strong>Taxa de Juros:</strong> {offer.interest_rate}% a.m.</p>
                          <p><strong>Total:</strong> R$ {offer.total_amount ? offer.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Oferta */}
      {selectedOffer && showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                Oferta - {selectedOffer.bank_name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeOfferModal}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Principais da Oferta */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-blue-900">{selectedOffer.bank_name}</h3>
                  <p className="text-blue-700">Proposta de Financiamento</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Valor Aprovado</p>
                    <p className="text-3xl font-bold text-green-600">
                      R$ {selectedOffer.approved_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Taxa de Juros</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedOffer.interest_rate}%
                    </p>
                    <p className="text-xs text-gray-500">ao mês</p>
                  </div>
                </div>
              </div>

              {/* Detalhes do Financiamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Detalhes do Pagamento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Número de Parcelas:</span>
                      <span className="font-medium">{selectedOffer.installments}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor da Parcela:</span>
                      <span className="font-medium">R$ {selectedOffer.monthly_payment ? selectedOffer.monthly_payment.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Total:</span>
                      <span className="font-medium">R$ {selectedOffer.total_amount ? selectedOffer.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Informações Adicionais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Data da Oferta:</span>
                      <span>{new Date(selectedOffer.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condições */}
              {selectedOffer.conditions && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">Condições Especiais</h4>
                  <p className="text-sm">{selectedOffer.conditions}</p>
                </div>
              )}

              {/* Botão de Ação */}
              <div className="text-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2">
                  <Building2 className="w-4 h-4 mr-2" />
                  Gerar Boleto Próprio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {/* ChatWidget removido */}
    </div>
  );
}
