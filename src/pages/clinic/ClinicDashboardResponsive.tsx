import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Clock, CheckCircle, XCircle, X, Building2, Calendar, User, Phone, Mail, CreditCard, Edit, Send, Trash2, MessageSquare, Upload, Plus, Loader2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';

// Importar componentes responsivos
import { 
  ResponsiveContainer, 
  FluidContainer 
} from '@/components/ui/ResponsiveContainer';
import { 
  ResponsiveGrid, 
  DashboardGrid 
} from '@/components/ui/ResponsiveGrid';
import { 
  ResponsiveHeading, 
  ResponsiveText, 
  ResponsiveParagraph 
} from '@/components/ui/ResponsiveText';
import { 
  ResponsiveTable, 
  ResponsiveTableHeader, 
  ResponsiveTableRow, 
  ResponsiveTableCell, 
  ResponsiveTableHeaderCell 
} from '@/components/ui/ResponsiveTable';

// Importar hook de breakpoint
import { useBreakpoint, useIsMobile } from '@/hooks/useBreakpoint';
import { Menu, X } from 'lucide-react';

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  patient_name: string;
  patient_cpf: string;
  patient_email: string;
  patient_phone: string;
  treatment_type?: string;
  urgency_level?: string;
  requested_date?: string;
  status: 'pending' | 'clinic_reviewing' | 'sent_to_admin' | 'admin_analyzing' | 'approved' | 'rejected' | 'cancelled' | 'awaiting_documents' | 'admin_approved' | 'admin_rejected' | 'clinic_approved' | 'sent_to_patient' | 'patient_accepted' | 'patient_rejected';
  created_at: string;
  updated_at: string;
  clinic_notes?: string;
  admin_notes?: string;
  description?: string;
  analysis_status?: 'pending' | 'pre_approved' | 'denied' | 'loaned' | 'contracted';
  analyzed_at?: string;
  analyzed_by?: string;
  fidc_name?: string;
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

interface ClinicData {
  name: string;
  cnpj: string;
}

const ClinicDashboardResponsive: React.FC = () => {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [creditOffers, setCreditOffers] = useState<Record<string, CreditOffer[]>>({});
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();

  // Buscar dados da clínica e solicitações
  useEffect(() => {
    fetchClinicData();
  }, []);

  useEffect(() => {
    if (clinicId) {
      fetchCreditRequests();
    }
  }, [clinicId]);

  const fetchClinicData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data: clinicInfo, error } = await supabase
        .from('clinics')
        .select('id, name, cnpj')
        .or(`master_user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar clínica:', error);
        toast.error('Erro ao buscar dados da clínica');
        return;
      }

      setClinicId(clinicInfo.id);
      setClinicData({ name: clinicInfo.name, cnpj: clinicInfo.cnpj });
    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      toast.error('Erro ao carregar dados da clínica');
    }
  };

  const fetchCreditRequests = async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      const { data: requests, error } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar solicitações:', error);
        toast.error('Erro ao buscar solicitações');
        return;
      }

      setCreditRequests(requests || []);
      
      // Buscar ofertas para as solicitações
      if (requests && requests.length > 0) {
        const requestIds = requests.map(r => r.id);
        fetchCreditOffers(requestIds);
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditOffers = async (requestIds: string[]) => {
    try {
      const { data: offers, error } = await supabase
        .from('credit_offers')
        .select('*')
        .in('credit_request_id', requestIds);

      if (error) {
        console.error('Erro ao buscar ofertas:', error);
        return;
      }

      // Agrupar ofertas por solicitação
      const groupedOffers: Record<string, CreditOffer[]> = {};
      offers?.forEach(offer => {
        if (!groupedOffers[offer.credit_request_id]) {
          groupedOffers[offer.credit_request_id] = [];
        }
        groupedOffers[offer.credit_request_id].push(offer);
      });

      setCreditOffers(groupedOffers);
    } catch (error) {
      console.error('Erro ao buscar ofertas:', error);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; textColor: string; icon: React.ReactNode }> = {
      pending: { label: 'Pendente', color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      clinic_reviewing: { label: 'Em Análise', color: 'bg-blue-100', textColor: 'text-blue-800', icon: <Eye className="w-3 h-3" /> },
      sent_to_admin: { label: 'Enviado', color: 'bg-purple-100', textColor: 'text-purple-800', icon: <Send className="w-3 h-3" /> },
      admin_analyzing: { label: 'Analisando', color: 'bg-indigo-100', textColor: 'text-indigo-800', icon: <Eye className="w-3 h-3" /> },
      approved: { label: 'Aprovado', color: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { label: 'Rejeitado', color: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100', textColor: 'text-gray-800', icon: <XCircle className="w-3 h-3" /> },
      awaiting_documents: { label: 'Aguardando Docs', color: 'bg-orange-100', textColor: 'text-orange-800', icon: <FileText className="w-3 h-3" /> },
      admin_approved: { label: 'Aprovado Admin', color: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      admin_rejected: { label: 'Rejeitado Admin', color: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      clinic_approved: { label: 'Aprovado Clínica', color: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      sent_to_patient: { label: 'Enviado Paciente', color: 'bg-blue-100', textColor: 'text-blue-800', icon: <Send className="w-3 h-3" /> },
      patient_accepted: { label: 'Aceito', color: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      patient_rejected: { label: 'Recusado', color: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-3 h-3" /> }
    };

    return statusMap[status] || { label: status, color: 'bg-gray-100', textColor: 'text-gray-800', icon: null };
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getMaxApprovedAmount = (requestId: string) => {
    const offers = creditOffers[requestId] || [];
    if (offers.length === 0) return 0;
    return Math.max(...offers.map(offer => offer.approved_amount));
  };

  const openDetailsModal = (request: CreditRequest) => {
    setSelectedRequest(request);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 w-full bg-background flex flex-col ml-0 md:ml-64">
          <div className="bg-white/95 backdrop-blur-md border-b">
            <Navbar />
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 w-full bg-background flex flex-col ml-0 md:ml-64">
        <div className="bg-white/95 backdrop-blur-md border-b">
          <Navbar />
        </div>
        
        <FluidContainer>
          <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div>
              <ResponsiveHeading level={1} size={{ mobile: '2xl', tablet: '3xl', desktop: '4xl' }}>
                Solicitações de Crédito
              </ResponsiveHeading>
              <ResponsiveText 
                color="text-gray-600" 
                size={{ mobile: 'sm', tablet: 'base', desktop: 'base' }}
                className="mt-2"
              >
                Gerencie as solicitações de crédito dos pacientes
              </ResponsiveText>
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              variant="default"
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Simular Proposta</span>
            </Button>
          </div>

          {/* Tabela de Solicitações */}
          {creditRequests.length === 0 ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <ResponsiveHeading level={3} size={{ mobile: 'lg', tablet: 'xl', desktop: 'xl' }}>
                  Nenhuma solicitação encontrada
                </ResponsiveHeading>
                <ResponsiveText color="text-gray-500" className="mt-2">
                  Não há solicitações de crédito para exibir.
                </ResponsiveText>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border">
              <ResponsiveTable
                minWidth={{
                  mobile: 1430,
                  tablet: 1630,
                  desktop: 1880
                }}
                striped={false}
                bordered={false}
                hover={true}
                responsive={true}
                className="table-proposal-spacing"
              >
                <ResponsiveTableHeader sticky={true}>
                  <tr>
                    <ResponsiveTableHeaderCell width="280" align="left" className="px-6" style={{marginRight: '300px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '10px solid #ff0000', backgroundColor: '#ffff00'}}>
                      <div style={{marginRight: '100px', backgroundColor: '#ff0000', color: '#fff', padding: '5px'}}>Nº Proposta</div>
                    </ResponsiveTableHeaderCell>
                    
                    <ResponsiveTableHeaderCell width="320" align="left" className="px-6" style={{marginLeft: '100px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: '10px solid #00ff00', backgroundColor: '#00ffff'}}>
                      <div style={{marginLeft: '100px', backgroundColor: '#00ff00', color: '#000', padding: '5px'}}>Cliente</div>
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="140" align="left">
                      CPF
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="180" align="left">
                      Clínica
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="150" align="left">
                      Valor Solicitado
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="110" align="left">
                      Taxa a.m.
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="100" align="left">
                      Parcelas
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="160" align="left">
                      Valor Parcela
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="160" align="left">
                      Total a Pagar
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="140" align="left">
                      FIDC
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="120" align="left">
                      Status
                    </ResponsiveTableHeaderCell>
                    <ResponsiveTableHeaderCell width="180" align="right">
                      Ações
                    </ResponsiveTableHeaderCell>
                  </tr>
                </ResponsiveTableHeader>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditRequests.map((request) => {
                    const statusDisplay = getStatusDisplay(request.status);
                    const maxApproved = getMaxApprovedAmount(request.id);
                    const bestOffer = creditOffers[request.id]?.find(offer => offer.approved_amount === maxApproved);
                    
                    // Calcular valores baseados na melhor oferta ou dados da solicitação
                    const interestRate = bestOffer?.interest_rate || 2.5;
                    const installments = request.installments || 12;
                    const requestedAmount = request.requested_amount || 0;
                    
                    // Cálculo do valor da parcela
                    let monthlyPayment = 0;
                    if (bestOffer?.monthly_payment) {
                      monthlyPayment = bestOffer.monthly_payment;
                    } else {
                      const monthlyRate = interestRate / 100;
                      if (monthlyRate > 0) {
                        monthlyPayment = requestedAmount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1);
                      } else {
                        monthlyPayment = requestedAmount / installments;
                      }
                    }
                    
                    const totalAmount = monthlyPayment * installments;
                    const proposalNumber = `PROP-${request.id.slice(-8).toUpperCase()}`;
                    const clinicName = clinicData?.name || "Clínica Odontológica";
                    const fidcName = bestOffer?.bank_name || request.fidc_name || "FIDC Santander";
                    
                    return (
                      <ResponsiveTableRow
                        key={request.id}
                        hover={true}
                        onClick={() => openDetailsModal(request)}
                      >
                        <ResponsiveTableCell width="280" align="left" className="px-6" style={{marginRight: '300px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '10px solid #ff0000', backgroundColor: '#ffff00'}}>
                          <div className="text-sm font-medium text-gray-900" style={{marginRight: '100px', backgroundColor: '#ff0000', color: '#fff', padding: '5px'}}>
                            {proposalNumber}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="320" align="left" className="px-6" style={{marginLeft: '100px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: '10px solid #00ff00', backgroundColor: '#00ffff'}}>
                          <div className="text-sm font-medium text-gray-900" style={{marginLeft: '100px', backgroundColor: '#00ff00', color: '#000', padding: '5px'}}>
                            {request.patient_name}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="140" align="left">
                          <div className="text-sm text-gray-900">
                            {formatCPF(request.patient_cpf)}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="180" align="left">
                          <div className="text-sm text-gray-900">
                            {clinicName}
                          </div>
                        </ResponsiveTableCell>

                        <ResponsiveTableCell width="150" align="left">
                          <div className="text-sm font-medium text-gray-900">
                            R$ ${requestedAmount.toFixed(2).replace('.', ',')}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="110" align="left">
                          <div className="text-sm text-gray-900">
                            {interestRate.toFixed(2)}%
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="100" align="left">
                          <div className="text-sm text-gray-900">
                            {installments}x
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="160" align="left">
                          <div className="text-sm font-medium text-gray-900">
                            R$ ${monthlyPayment.toFixed(2).replace('.', ',')}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="160" align="left">
                          <div className="text-sm font-medium text-gray-900">
                            R$ ${totalAmount.toFixed(2).replace('.', ',')}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="140" align="left">
                          <div className="text-sm text-gray-900">
                            {fidcName}
                          </div>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="120" align="left">
                          <Badge className={`${statusDisplay.color} ${statusDisplay.textColor} border-0 text-xs px-2 py-1`}>
                            {statusDisplay.icon}
                            <span className="ml-1">{statusDisplay.label}</span>
                          </Badge>
                        </ResponsiveTableCell>
                        
                        <ResponsiveTableCell width="180" align="right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetailsModal(request);
                              }}
                              className="text-xs px-2 py-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Proposta
                            </Button>
                          </div>
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    );
                  })}
                </tbody>
              </ResponsiveTable>
            </div>
          )}
        </FluidContainer>

        {/* Sidebar de detalhes */}
        {showSidebar && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeSidebar}
            />
            
            {/* Sidebar deslizante */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
              showSidebar ? 'translate-x-0' : 'translate-x-full'
            }`}>
              <div className="h-full flex flex-col">
                {/* Header da sidebar */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <ResponsiveHeading level={2} size={{ mobile: 'base', tablet: 'lg', desktop: 'lg' }}>
                      Ofertas Bancárias
                    </ResponsiveHeading>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeSidebar}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>

                {/* Conteúdo da sidebar */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {selectedRequest && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <ResponsiveText weight="semibold" className="text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                          Paciente
                        </ResponsiveText>
                        <ResponsiveText className="text-gray-900 text-sm sm:text-base">
                          {selectedRequest.patient_name}
                        </ResponsiveText>
                        <ResponsiveText size={{ mobile: 'xs', tablet: 'sm', desktop: 'sm' }} className="text-gray-500 text-xs sm:text-sm">
                          {formatCPF(selectedRequest.patient_cpf)}
                        </ResponsiveText>
                      </div>

                      <div>
                        <ResponsiveText weight="semibold" className="text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                          Valor Solicitado
                        </ResponsiveText>
                        <ResponsiveText className="text-gray-900 font-medium text-sm sm:text-base">
                          R$ ${selectedRequest.requested_amount.toFixed(2).replace('.', ',')}
                        </ResponsiveText>
                      </div>

                      <div>
                        <ResponsiveText weight="semibold" className="text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                          Status Atual
                        </ResponsiveText>
                        {(() => {
                          const statusDisplay = getStatusDisplay(selectedRequest.status);
                          return (
                            <Badge className={`${statusDisplay.color} ${statusDisplay.textColor} border-0 text-xs sm:text-sm`}>
                              {statusDisplay.icon}
                              <span className="ml-1">{statusDisplay.label}</span>
                            </Badge>
                          );
                        })()}
                      </div>

                      <div>
                        <ResponsiveText weight="semibold" className="text-gray-700 mb-2 sm:mb-4 text-sm sm:text-base">
                          Ofertas Disponíveis
                        </ResponsiveText>
                        
                        {creditOffers[selectedRequest.id]?.length > 0 ? (
                          <div className="space-y-3">
                            {creditOffers[selectedRequest.id].map((offer) => (
                              <div key={offer.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <ResponsiveText weight="semibold" className="text-gray-900 text-sm sm:text-base">
                                    {offer.bank_name}
                                  </ResponsiveText>
                                  <Badge variant="outline" className="text-xs">
                                    R$ ${offer.approved_amount.toFixed(2).replace('.', ',')}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                  <div>
                                    <ResponsiveText size="xs" className="text-gray-500 text-xs">
                                      Taxa a.m.
                                    </ResponsiveText>
                                    <ResponsiveText className="text-gray-900 text-sm">
                                      {offer.interest_rate.toFixed(2)}%
                                    </ResponsiveText>
                                  </div>
                                  <div>
                                    <ResponsiveText size="xs" className="text-gray-500 text-xs">
                                      Parcelas
                                    </ResponsiveText>
                                    <ResponsiveText className="text-gray-900 text-sm">
                                      {offer.installments}x
                                    </ResponsiveText>
                                  </div>
                                </div>
                                
                                {offer.monthly_payment && (
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <ResponsiveText size="xs" className="text-gray-500 text-xs">
                                      Valor da Parcela
                                    </ResponsiveText>
                                    <ResponsiveText className="text-gray-900 font-medium text-sm">
                                      R$ ${offer.monthly_payment.toFixed(2).replace('.', ',')}
                                    </ResponsiveText>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8">
                            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <ResponsiveText color="text-gray-500" className="text-sm sm:text-base">
                              Nenhuma oferta disponível no momento
                            </ResponsiveText>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>

    {mobileSidebarOpen && (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
        <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-[calc(100%-56px)] overflow-y-auto">
            <AppSidebar />
          </div>
        </div>
      </div>
    )}
  );
};

export default ClinicDashboardResponsive;
